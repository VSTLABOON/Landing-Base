-- Migración: Tabla de Suscripciones SaaS (Nivel 2/3)

CREATE TABLE IF NOT EXISTS suscripciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tiendas(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('basico','pro','enterprise')),
  estado TEXT NOT NULL CHECK (estado IN ('activo','vencido','prueba','cancelado')),
  fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_renovacion TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  monto_mensual NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;

-- Solo superadmin puede leer y modificar:
CREATE POLICY "superadmin_full_access" ON suscripciones
  USING (
    EXISTS (
      SELECT 1 FROM perfiles 
      WHERE id = auth.uid() AND rol = 'superadmin'
    )
  );

CREATE POLICY "superadmin_full_access_update" ON suscripciones
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM perfiles 
      WHERE id = auth.uid() AND rol = 'superadmin'
    )
  );

CREATE POLICY "superadmin_full_access_insert" ON suscripciones
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM perfiles 
      WHERE id = auth.uid() AND rol = 'superadmin'
    )
  );

CREATE POLICY "superadmin_full_access_delete" ON suscripciones
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM perfiles 
      WHERE id = auth.uid() AND rol = 'superadmin'
    )
  );
