-- ═══════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Columnas faltantes para TenantContext del Frontend
-- 
-- CONTEXTO: El frontend (TenantContext.tsx) espera estas columnas
-- en la tabla `tiendas`, pero nunca fueron creadas en las migraciones
-- anteriores. Sin ellas, el frontend cae al FALLBACK y no carga
-- la configuración real de la tienda.
--
-- INSTRUCCIONES: Copia y pega TODO este script en el SQL Editor 
-- de Supabase y ejecútalo con un solo clic.
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. COLUMNAS DE IDENTIDAD VISUAL ─────────────────────────────
ALTER TABLE public.tiendas
  ADD COLUMN IF NOT EXISTS color_primario   TEXT DEFAULT '#D94F6E',
  ADD COLUMN IF NOT EXISTS color_secundario TEXT DEFAULT '#3A6B34',
  ADD COLUMN IF NOT EXISTS color_acento     TEXT DEFAULT '#C49A3C';

-- ── 2. COLUMNAS DE UBICACIÓN ────────────────────────────────────
ALTER TABLE public.tiendas
  ADD COLUMN IF NOT EXISTS ciudad              TEXT DEFAULT 'Monterrey',
  ADD COLUMN IF NOT EXISTS estado              TEXT DEFAULT 'Nuevo León',
  ADD COLUMN IF NOT EXISTS area_metropolitana  TEXT DEFAULT 'área metropolitana',
  ADD COLUMN IF NOT EXISTS mapa_url            TEXT;

-- ── 3. COLUMNAS DE CONTACTO ─────────────────────────────────────
ALTER TABLE public.tiendas
  ADD COLUMN IF NOT EXISTS whatsapp TEXT DEFAULT '0000000000',
  ADD COLUMN IF NOT EXISTS wa_base  TEXT DEFAULT 'https://wa.me/0000000000';

-- ── 4. COLUMNAS DE CONTENIDO (JSONB para flexibilidad) ──────────
ALTER TABLE public.tiendas
  ADD COLUMN IF NOT EXISTS horarios       JSONB DEFAULT '{"regular":"Lunes a Domingo · 9:00 AM – 6:00 PM"}'::jsonb,
  ADD COLUMN IF NOT EXISTS redes_sociales JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS nav_links      TEXT[] DEFAULT ARRAY['Catálogo','Servicios','Cobertura','Nosotros'],
  ADD COLUMN IF NOT EXISTS campana        JSONB,
  ADD COLUMN IF NOT EXISTS anio_fundacion INTEGER DEFAULT 2020,
  ADD COLUMN IF NOT EXISTS texto_nosotros TEXT DEFAULT 'Bienvenido a nuestra florería.',
  ADD COLUMN IF NOT EXISTS firma          TEXT DEFAULT 'El equipo',
  ADD COLUMN IF NOT EXISTS envio_costo    NUMERIC(10,2) DEFAULT 50,
  ADD COLUMN IF NOT EXISTS colonias       TEXT[] DEFAULT ARRAY[]::TEXT[];

-- ── 5. COLUMNA MASTER DE UI (Secciones dinámicas del storefront) ─
-- Almacena: servicios, beneficios, flores, galeria, testimonios,
-- orden_secciones, y configuración por sección (textos, imágenes).
ALTER TABLE public.tiendas
  ADD COLUMN IF NOT EXISTS config_ui JSONB DEFAULT '{}'::jsonb;

-- ── 6. POLÍTICAS RLS — Lectura pública del storefront ───────────
-- Los clientes anónimos necesitan leer los datos de la tienda para
-- poder ver la landing page. Sin esta política, el frontend recibe 406.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tiendas' AND policyname = 'Storefront público puede leer tiendas'
  ) THEN
    CREATE POLICY "Storefront público puede leer tiendas"
    ON public.tiendas FOR SELECT
    USING (true);
  END IF;
END $$;

-- Asegurar que RLS está habilitado
ALTER TABLE public.tiendas ENABLE ROW LEVEL SECURITY;

-- ── 7. POLÍTICAS RLS — Perfiles legibles por su propio dueño ────
-- El AuthContext necesita leer el perfil del usuario logueado.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'perfiles' AND policyname = 'Usuario lee su propio perfil'
  ) THEN
    CREATE POLICY "Usuario lee su propio perfil"
    ON public.perfiles FOR SELECT
    USING (id = auth.uid());
  END IF;
END $$;

-- ── 8. POLÍTICA RLS — Superadmin actualiza tiendas ──────────────
-- El panel /superadmin necesita poder cambiar subscription_level.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'tiendas' AND policyname = 'Superadmin gestiona todas las tiendas'
  ) THEN
    CREATE POLICY "Superadmin gestiona todas las tiendas"
    ON public.tiendas FOR ALL
    USING ( public.auth_is_superadmin() );
  END IF;
END $$;

-- ── 9. POLÍTICA RLS — Dueño actualiza su propia tienda ──────────
-- El Store Builder necesita que el dueño pueda editar su config.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'tiendas' AND policyname = 'Dueño actualiza su propia tienda'
  ) THEN
    CREATE POLICY "Dueño actualiza su propia tienda"
    ON public.tiendas FOR UPDATE
    USING (
      id IN (
        SELECT tienda_id FROM public.perfiles
        WHERE perfiles.id = auth.uid()
        AND perfiles.rol IN ('dueño')
      )
    );
  END IF;
END $$;

-- ── 10. AUDITORÍA FINAL ─────────────────────────────────────────
SELECT
  prueba,
  CASE resultado WHEN true THEN 'OK' ELSE 'FALTA' END AS estado
FROM (
  SELECT 'Columna color_primario' AS prueba,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tiendas' AND column_name='color_primario') AS resultado
  UNION ALL
  SELECT 'Columna whatsapp',
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tiendas' AND column_name='whatsapp')
  UNION ALL
  SELECT 'Columna config_ui',
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tiendas' AND column_name='config_ui')
  UNION ALL
  SELECT 'Columna anio_fundacion',
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tiendas' AND column_name='anio_fundacion')
  UNION ALL
  SELECT 'RLS en tiendas',
    EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='tiendas' AND c.relrowsecurity)
) sub;
