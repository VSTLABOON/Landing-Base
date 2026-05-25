import { useTenant } from '../context/TenantContext';
import { SubscriptionLevel } from '../types';

const TRIAL_DAYS = 14;

export function useSubscriptionStatus() {
  const { tenant } = useTenant();

  const isTrialExpired = (() => {
    if (!tenant || tenant.subscription_level !== SubscriptionLevel.BASICO) return false;
    if (tenant.has_active_subscription) return false;
    if (!tenant.created_at) return false;

    const creationDate = new Date(tenant.created_at);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - TRIAL_DAYS);
    return creationDate < cutoff;
  })();

  const isBlocked =
    tenant?.subscription_level === SubscriptionLevel.BLOCKED || isTrialExpired;

  return {
    isBlocked,
    isTrialExpired,
    subscriptionLevel: tenant?.subscription_level ?? SubscriptionLevel.BASICO,
    hasActiveSubscription: tenant?.has_active_subscription ?? false,
  };
}
