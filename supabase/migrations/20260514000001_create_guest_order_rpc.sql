-- ═══════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Función RPC create_guest_order
--
-- CONTEXTO: El frontend (orderService.ts) llama a esta función para
-- registrar pedidos del flujo WhatsApp (Nivel 1) de forma atómica.
--
-- FLUJO:
--   1. Inserta una fila en `pedidos` con estado 'pendiente'
--   2. Inserta N filas en `pedido_items` con los productos
--   3. Retorna el UUID del pedido creado
--
-- Todo ocurre dentro de una transacción implícita de PL/pgSQL.
-- Si cualquier INSERT falla, se hace rollback automático.
--
-- SEGURIDAD:
--   - Ejecutable por `anon` (clientes sin cuenta) y `authenticated`
--   - Los precios vienen del frontend (Nivel 1 no valida server-side
--     porque el dueño confirma manualmente vía WhatsApp)
--   - Para Nivel 2 (Stripe), los precios se validan en la Edge Function
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.create_guest_order(
  p_tienda_id   UUID,
  p_total       NUMERIC,
  p_datos_envio JSONB,
  p_items       JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER  -- Bypassa RLS para INSERT anónimo controlado
SET search_path = public
AS $$
DECLARE
  v_pedido_id UUID;
  v_item      JSONB;
BEGIN
  -- ── 1. Validar que la tienda existe ─────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM tiendas WHERE id = p_tienda_id) THEN
    RAISE EXCEPTION 'Tienda no encontrada: %', p_tienda_id;
  END IF;

  -- ── 2. Validar que hay items ────────────────────────────────────
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'El pedido debe contener al menos un item';
  END IF;

  -- ── 3. Insertar el pedido ───────────────────────────────────────
  INSERT INTO pedidos (
    tienda_id,
    total,
    estado,
    metodo_pago,
    datos_envio
  ) VALUES (
    p_tienda_id,
    p_total,
    'pendiente',
    'efectivo',
    p_datos_envio
  )
  RETURNING id INTO v_pedido_id;

  -- ── 4. Insertar los items del pedido ────────────────────────────
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO pedido_items (
      pedido_id,
      producto_id,
      variante_id,
      nombre_producto,
      cantidad,
      precio_unitario
    ) VALUES (
      v_pedido_id,
      NULLIF(v_item->>'producto_id', '')::UUID,
      NULLIF(v_item->>'variante_id', '')::UUID,
      COALESCE(v_item->>'nombre', 'Producto'),
      COALESCE((v_item->>'cantidad')::INTEGER, 1),
      COALESCE((v_item->>'precio_unitario')::NUMERIC, 0)
    );
  END LOOP;

  -- ── 5. Retornar el ID del pedido creado ─────────────────────────
  RETURN v_pedido_id;
END;
$$;

-- Permitir que usuarios anónimos y autenticados ejecuten la función
GRANT EXECUTE ON FUNCTION public.create_guest_order(UUID, NUMERIC, JSONB, JSONB)
  TO anon, authenticated;

-- Comentario para documentación
COMMENT ON FUNCTION public.create_guest_order IS
  'Crea un pedido guest (WhatsApp/Nivel 1) de forma atómica. '
  'Inserta en pedidos + pedido_items dentro de una transacción.';
