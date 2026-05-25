-- ═══════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Tablas requeridas por el Stripe Webhook
-- Contexto: El webhook stripe-webhook/index.ts necesita estas tablas
-- para registrar pedidos pagados y notificar al dueño de la tienda.
--
-- NOTA: Si las tablas ya existen, cada CREATE TABLE usa IF NOT EXISTS.
-- Los UNIQUE constraints y índices también son idempotentes.
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. TABLA: pedidos ────────────────────────────────────────────
-- Almacena cada pedido pagado. El webhook solo inserta con estado='pagado'.
-- El admin del dashboard puede actualizar el estado posteriormente.

CREATE TABLE IF NOT EXISTS pedidos (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tienda_id                 UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,
  usuario_id                UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email_cliente             TEXT,
  estado                    TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'pagado', 'preparando', 'en_ruta', 'entregado', 'cancelado')),
  metodo_pago               TEXT DEFAULT 'efectivo'
    CHECK (metodo_pago IN ('stripe', 'efectivo', 'transferencia')),
  total                     NUMERIC(12,2) NOT NULL DEFAULT 0,
  datos_envio               JSONB,
  stripe_session_id         TEXT UNIQUE,  -- ← Clave de idempotencia del webhook
  stripe_payment_intent_id  TEXT,         -- ← Para reembolsos vía Stripe Dashboard
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para consultas del dashboard del dueño (filtrar por tienda)
CREATE INDEX IF NOT EXISTS idx_pedidos_tienda_id ON pedidos(tienda_id);

-- Índice para búsquedas por estado (filtros del admin)
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(tienda_id, estado);

-- Índice para lookup rápido de idempotencia del webhook
CREATE INDEX IF NOT EXISTS idx_pedidos_stripe_session ON pedidos(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- ── 2. TABLA: pedido_items ───────────────────────────────────────
-- Detalle de cada producto comprado en un pedido.
-- Los nombres y precios son snapshots (inmutables post-compra).

CREATE TABLE IF NOT EXISTS pedido_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id         UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id       UUID REFERENCES productos(id) ON DELETE SET NULL,
  variante_id       UUID,
  nombre_producto   TEXT NOT NULL,
  cantidad          INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  precio_unitario   NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido ON pedido_items(pedido_id);

-- ── 3. TABLA: notificaciones ─────────────────────────────────────
-- Notificaciones en tiempo real para el dashboard del dueño.
-- Supabase Realtime escucha INSERT en esta tabla filtrado por tienda_id.

CREATE TABLE IF NOT EXISTS notificaciones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tienda_id   UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL DEFAULT 'info'
    CHECK (tipo IN ('nuevo_pedido', 'pedido_cancelado', 'stock_bajo', 'info', 'alerta')),
  titulo      TEXT NOT NULL,
  mensaje     TEXT,
  leida       BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notificaciones_tienda ON notificaciones(tienda_id);

-- Índice para consulta "notificaciones no leídas" del dashboard
CREATE INDEX IF NOT EXISTS idx_notificaciones_no_leidas
  ON notificaciones(tienda_id, leida)
  WHERE leida = false;

-- ── 4. RLS (Row Level Security) ──────────────────────────────────
-- Habilitamos RLS en las nuevas tablas. Las políticas permiten
-- que los dueños vean solo los datos de su tienda.

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Política: Dueños y empleados pueden leer pedidos de su tienda
CREATE POLICY "staff_read_pedidos" ON pedidos
  FOR SELECT TO authenticated
  USING (
    tienda_id IN (
      SELECT tienda_id FROM perfiles WHERE id = auth.uid()
    )
  );

-- Política: Dueños pueden actualizar estado de pedidos
CREATE POLICY "owner_update_pedidos" ON pedidos
  FOR UPDATE TO authenticated
  USING (
    tienda_id IN (
      SELECT tienda_id FROM perfiles WHERE id = auth.uid() AND rol = 'owner'
    )
  );

-- Política: Staff lee items de pedidos de su tienda
CREATE POLICY "staff_read_pedido_items" ON pedido_items
  FOR SELECT TO authenticated
  USING (
    pedido_id IN (
      SELECT p.id FROM pedidos p
      JOIN perfiles pf ON pf.tienda_id = p.tienda_id
      WHERE pf.id = auth.uid()
    )
  );

-- Política: Staff lee notificaciones de su tienda
CREATE POLICY "staff_read_notificaciones" ON notificaciones
  FOR SELECT TO authenticated
  USING (
    tienda_id IN (
      SELECT tienda_id FROM perfiles WHERE id = auth.uid()
    )
  );

-- Política: Staff marca notificaciones como leídas
CREATE POLICY "staff_update_notificaciones" ON notificaciones
  FOR UPDATE TO authenticated
  USING (
    tienda_id IN (
      SELECT tienda_id FROM perfiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    tienda_id IN (
      SELECT tienda_id FROM perfiles WHERE id = auth.uid()
    )
  );

-- ── 5. TRIGGER: updated_at automático para pedidos ───────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_pedidos_updated_at'
  ) THEN
    CREATE TRIGGER set_pedidos_updated_at
      BEFORE UPDATE ON pedidos
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;

-- ── 6. HABILITAR REALTIME para notificaciones ────────────────────
-- Esto permite que el frontend escuche INSERT en la tabla
-- notificaciones vía supabase.channel('notificaciones').on(...)
ALTER PUBLICATION supabase_realtime ADD TABLE notificaciones;
