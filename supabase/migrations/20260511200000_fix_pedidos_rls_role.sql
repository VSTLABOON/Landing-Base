-- Fix: RLS policy owner_update_pedidos referenced rol = 'owner' (English)
-- but the platform uses Spanish roles ('dueño', 'empleado', 'superadmin').
-- This fix ensures store owners can update order status (preparando, en_ruta, etc.)

DROP POLICY IF EXISTS "owner_update_pedidos" ON pedidos;

CREATE POLICY "owner_update_pedidos" ON pedidos
  FOR UPDATE TO authenticated
  USING (
    tienda_id IN (
      SELECT tienda_id FROM perfiles 
      WHERE id = auth.uid() AND rol IN ('dueño', 'superadmin')
    )
  );

-- Also add metadata JSONB column to notificaciones for future enrichment
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
