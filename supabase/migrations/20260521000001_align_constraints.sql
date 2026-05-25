-- 1. Migrar registros históricos
UPDATE pedidos 
SET metodo_pago = 'tarjeta' 
WHERE metodo_pago = 'stripe';

-- 2. Actualizar check de estado para incluir 'pendiente_pago'
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_estado_check;
ALTER TABLE pedidos ADD CONSTRAINT pedidos_estado_check CHECK (estado IN ('pendiente', 'pagado', 'preparando', 'en_ruta', 'entregado', 'cancelado', 'pendiente_pago'));

-- 3. Actualizar check de metodo_pago para incluir 'tarjeta', 'spei', 'oxxo' y quitar 'stripe'
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_metodo_pago_check;
ALTER TABLE pedidos ADD CONSTRAINT pedidos_metodo_pago_check CHECK (metodo_pago IN ('tarjeta', 'efectivo', 'transferencia', 'spei', 'oxxo'));
