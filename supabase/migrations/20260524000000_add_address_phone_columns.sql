-- ═══════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Agregar Dirección y Teléfono a Tiendas y Perfiles
-- ═══════════════════════════════════════════════════════════════════

-- 1. Agregar dirección física opcional a las tiendas (para mostrar en storefront)
ALTER TABLE public.tiendas
  ADD COLUMN IF NOT EXISTS direccion TEXT;

-- 2. Agregar teléfono y dirección física opcionales a los perfiles de usuario (clientes/staff)
ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS telefono TEXT,
  ADD COLUMN IF NOT EXISTS direccion TEXT;
