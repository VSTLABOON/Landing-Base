// ─── FEATURE GATE ───────────────────────────────────────────────
// Componente de control de acceso por nivel de suscripción SaaS.
//
// Uso:
//   <FeatureGate requiredLevel={2}>
//     <StripeCheckout />           ← Solo visible en Nivel 2+
//   </FeatureGate>
//
//   <FeatureGate requiredLevel={3} fallback={<UpgradeBanner plan="Logística" />}>
//     <GPSTracker />               ← Solo visible en Nivel 3
//   </FeatureGate>
//
// Niveles del SaaS:
//   1 = Base       → Landing + Catálogo + Pedidos WhatsApp
//   2 = E-commerce → + Pasarela de pago, Guest Checkout, Push
//   3 = Logística  → + GPS, App Repartidores, Rutas
//
// Arquitectura:
//   Lee `subscription_level` del TenantContext (sincronizado con
//   la columna `subscription_level` de la tabla `tiendas`).
//   No hace queries propias — es puramente declarativo.
// ────────────────────────────────────────────────────────────────

import type { ReactNode } from 'react';
import { useTenant } from '../context/TenantContext';
import { SubscriptionLevel } from '../types';

interface FeatureGateProps {
  /** Nivel mínimo de suscripción requerido. */
  requiredLevel: SubscriptionLevel;

  /** Contenido protegido — se renderiza solo si el tenant cumple el nivel. */
  children: ReactNode;

  /**
   * UI alternativa cuando el tenant NO cumple el nivel.
   * Si no se proporciona, el componente no renderiza nada (oculta la feature).
   * Ideal para mostrar un banner de upgrade o un tooltip informativo.
   */
  fallback?: ReactNode;
}

export default function FeatureGate({
  requiredLevel,
  children,
  fallback = null,
}: FeatureGateProps) {
  const { tenant, loading, status } = useTenant();

  // Mientras el TenantContext resuelve, no renderizamos nada
  // para evitar un flash de contenido premium o del fallback.
  if (loading || status === 'loading') return null;

  // ── Gate check ────────────────────────────────────────────────
  if (tenant.subscription_level >= requiredLevel) {
    return <>{children}</>;
  }

  // El tenant no cumple el nivel → mostrar fallback o nada
  return <>{fallback}</>;
}
