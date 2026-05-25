-- ── MIGRACIÓN: subscription_level = 0 (Bloqueo/Inactivo) ──

ALTER TABLE public.tiendas
  DROP CONSTRAINT IF EXISTS tiendas_subscription_level_check,
  ADD CONSTRAINT tiendas_subscription_level_check
    CHECK (subscription_level BETWEEN 0 AND 3);
