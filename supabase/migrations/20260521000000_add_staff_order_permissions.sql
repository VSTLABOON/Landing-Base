-- 1. Actualizar permisos de modificación (Permitir a empleados actualizar estado de pedidos)
DROP POLICY IF EXISTS "owner_update_pedidos" ON pedidos;

CREATE POLICY "owner_update_pedidos" ON pedidos
  FOR UPDATE TO authenticated
  USING (
    tienda_id IN (
      SELECT tienda_id FROM perfiles 
      WHERE id = auth.uid() AND rol IN ('dueño', 'superadmin', 'empleado')
    )
  );

-- 2. Permitir que el personal inserte pedidos manuales
DROP POLICY IF EXISTS "staff_insert_pedidos" ON pedidos;

CREATE POLICY "staff_insert_pedidos" ON pedidos
  FOR INSERT TO authenticated
  WITH CHECK (
    tienda_id IN (
      SELECT tienda_id FROM perfiles 
      WHERE id = auth.uid() AND rol IN ('dueño', 'superadmin', 'empleado')
    )
  );

-- 3. Permitir que el personal inserte items de pedidos manuales
DROP POLICY IF EXISTS "staff_insert_pedido_items" ON pedido_items;

CREATE POLICY "staff_insert_pedido_items" ON pedido_items
  FOR INSERT TO authenticated
  WITH CHECK (
    pedido_id IN (
      SELECT p.id FROM pedidos p
      JOIN perfiles pf ON pf.tienda_id = p.tienda_id
      WHERE pf.id = auth.uid() AND pf.rol IN ('dueño', 'superadmin', 'empleado')
    )
  );
