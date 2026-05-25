-- ═══════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Función RPC atómica para rate limiting [BLINDADO]
-- ═══════════════════════════════════════════════════════════════════
-- FUGA 5: El patrón anterior (READ → INCREMENT → WRITE) tenía una
-- race condition. Dos requests simultáneas podían leer el mismo
-- count y ambas pasar el límite.
--
-- Esta función hace un UPSERT atómico con RETURNING, eliminando
-- la race condition por completo. PostgreSQL serializa las
-- escrituras automáticamente.
-- ═══════════════════════════════════════════════════════════════════

-- Agregar columna updated_at si no existe
ALTER TABLE public.rate_limits
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Función RPC atómica
CREATE OR REPLACE FUNCTION public.atomic_rate_limit(
  p_identifier TEXT,
  p_endpoint TEXT,
  p_window_minutes INT DEFAULT 1
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT;
BEGIN
  -- UPSERT atómico: INSERT si no existe, UPDATE si existe.
  -- Si la ventana expiró, resetear el contador.
  INSERT INTO public.rate_limits (identifier, endpoint, request_count, window_start, updated_at)
  VALUES (p_identifier, p_endpoint, 1, now(), now())
  ON CONFLICT (identifier, endpoint)
  DO UPDATE SET
    request_count = CASE
      -- Si la ventana expiró, resetear a 1
      WHEN rate_limits.window_start + (p_window_minutes || ' minutes')::INTERVAL < now()
        THEN 1
      -- Si no, incrementar atómicamente
      ELSE rate_limits.request_count + 1
    END,
    window_start = CASE
      WHEN rate_limits.window_start + (p_window_minutes || ' minutes')::INTERVAL < now()
        THEN now()
      ELSE rate_limits.window_start
    END,
    updated_at = now()
  RETURNING request_count INTO v_count;

  RETURN v_count;
END;
$$;

-- Permisos: solo service_role puede ejecutar esta función
REVOKE ALL ON FUNCTION public.atomic_rate_limit FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.atomic_rate_limit TO service_role;
