-- ═══════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Soporte para Zonas de Envío y Costo de Envío
-- ═══════════════════════════════════════════════════════════════════

-- 1. Agregar columnas a las tablas correspondientes
ALTER TABLE tiendas 
  ADD COLUMN IF NOT EXISTS zonas_envio JSONB DEFAULT '[]'::jsonb;

ALTER TABLE pedidos 
  ADD COLUMN IF NOT EXISTS costo_envio NUMERIC(10,2) DEFAULT 0.00;

-- 2. Eliminar la función RPC vieja para evitar conflictos de sobrecarga
DROP FUNCTION IF EXISTS public.create_guest_order(UUID, NUMERIC, JSONB, JSONB);

-- 3. Crear la nueva versión de la función RPC con p_costo_envio
CREATE OR REPLACE FUNCTION public.create_guest_order(
  p_tienda_id   UUID,
  p_total       NUMERIC,
  p_datos_envio JSONB,
  p_items       JSONB,
  p_costo_envio NUMERIC DEFAULT 0.00
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
    datos_envio,
    costo_envio
  ) VALUES (
    p_tienda_id,
    p_total,
    'pendiente',
    'efectivo',
    p_datos_envio,
    p_costo_envio
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
GRANT EXECUTE ON FUNCTION public.create_guest_order(UUID, NUMERIC, JSONB, JSONB, NUMERIC)
  TO anon, authenticated;

-- Comentario para documentación
COMMENT ON FUNCTION public.create_guest_order IS
  'Crea un pedido guest de forma atómica persistiendo el costo de envío. '
  'Inserta en pedidos + pedido_items dentro de una transacción.';
