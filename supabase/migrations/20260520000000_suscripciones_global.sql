-- ═══════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Soporte SaaS Global y Ciclo de Vida en Suscripciones
-- ═══════════════════════════════════════════════════════════════════

-- 1. Eliminar restricciones CHECK antiguas
ALTER TABLE public.suscripciones DROP CONSTRAINT IF EXISTS suscripciones_plan_check;
ALTER TABLE public.suscripciones DROP CONSTRAINT IF EXISTS suscripciones_estado_check;

-- 2. Crear restricciones CHECK actualizadas
-- Se añade 'premium' a los planes y los estados de ciclo de vida de Stripe ('past_due', 'unpaid', 'pago_fallido')
ALTER TABLE public.suscripciones ADD CONSTRAINT suscripciones_plan_check 
  CHECK (plan IN ('basico', 'pro', 'premium', 'enterprise'));

ALTER TABLE public.suscripciones ADD CONSTRAINT suscripciones_estado_check 
  CHECK (estado IN ('activo', 'vencido', 'prueba', 'cancelado', 'past_due', 'unpaid', 'pago_fallido'));

-- 3. Añadir nuevas columnas para cumplimiento fiscal y divisas globales
ALTER TABLE public.suscripciones ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'mxn';
ALTER TABLE public.suscripciones ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.suscripciones ADD COLUMN IF NOT EXISTS stripe_tax_id TEXT;

-- 4. Añadir constraint UNIQUE sobre stripe_subscription_id para asegurar idempotencia en webhook
-- Nota: En Postgres, múltiples valores NULL están permitidos en un constraint UNIQUE.
ALTER TABLE public.suscripciones ADD CONSTRAINT unique_stripe_subscription_id UNIQUE (stripe_subscription_id);
