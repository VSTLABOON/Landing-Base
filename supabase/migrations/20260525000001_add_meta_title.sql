-- ═══════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Agregar meta_title a Tiendas
-- ═══════════════════════════════════════════════════════════════════

-- Agregar columna meta_title a tiendas, VARCHAR(60) nullable, sin valor por defecto.
ALTER TABLE public.tiendas
  ADD COLUMN IF NOT EXISTS meta_title VARCHAR(60);
