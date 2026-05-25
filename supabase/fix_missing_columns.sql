-- Este script agrega las columnas faltantes a las tablas de pedidos y pedido_items
-- por si las tablas ya existían antes de la actualización a Stripe Webhooks.

DO $$
BEGIN
    -- Agregar columnas a la tabla pedidos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pedidos' AND column_name='email_cliente') THEN
        ALTER TABLE pedidos ADD COLUMN email_cliente TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pedidos' AND column_name='datos_envio') THEN
        ALTER TABLE pedidos ADD COLUMN datos_envio JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pedidos' AND column_name='stripe_session_id') THEN
        ALTER TABLE pedidos ADD COLUMN stripe_session_id TEXT UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pedidos' AND column_name='stripe_payment_intent_id') THEN
        ALTER TABLE pedidos ADD COLUMN stripe_payment_intent_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pedidos' AND column_name='metodo_pago') THEN
        ALTER TABLE pedidos ADD COLUMN metodo_pago TEXT DEFAULT 'efectivo' CHECK (metodo_pago IN ('stripe', 'efectivo', 'transferencia'));
    END IF;

    -- Agregar columnas a la tabla pedido_items
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pedido_items' AND column_name='nombre_producto') THEN
        ALTER TABLE pedido_items ADD COLUMN nombre_producto TEXT NOT NULL DEFAULT 'Producto General';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pedido_items' AND column_name='variante_id') THEN
        ALTER TABLE pedido_items ADD COLUMN variante_id UUID;
    END IF;

END
$$;

-- Después de ejecutar esto, recarga la caché de la API en Supabase:
-- NOTIFY pgrst, 'reload schema';
