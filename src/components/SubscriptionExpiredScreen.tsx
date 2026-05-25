import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { getLocaleAndCurrency } from '../lib/stripeHelpers';
import { CreditCard, ShieldAlert, LogOut, Check, Globe, HelpCircle, Loader2 } from 'lucide-react';

interface PlanCard {
  id: 'basico' | 'pro' | 'premium';
  levelLabel: string;
  name: string;
  desc: string;
  prices: Record<'mxn' | 'usd' | 'eur' | 'gbp', string>;
  features: string[];
  colorClass: string;
  buttonText: string;
  isPopular?: boolean;
}

const PLANS: PlanCard[] = [
  {
    id: 'basico',
    levelLabel: 'Nivel 1',
    name: 'BotaniQ Esencia',
    desc: 'Para florerías locales que desean recibir pedidos vía WhatsApp.',
    prices: { mxn: '$400 MXN', usd: '$20 USD', eur: '20 €', gbp: '£18' },
    features: ['Catálogo de flores', 'Pedidos directos a WhatsApp', 'Panel de control básico'],
    colorClass: 'bg-white/5 border-white/5 hover:border-white/10',
    buttonText: 'Activar Esencia'
  },
  {
    id: 'pro',
    levelLabel: 'Nivel 2',
    name: 'BotaniQ Alquimia',
    desc: 'Perfecto para cobrar anticipos con tarjeta y transferencias.',
    prices: { mxn: '$900 MXN', usd: '$45 USD', eur: '45 €', gbp: '£40' },
    features: ['Cobros con Tarjeta y SPEI', 'Notificaciones automáticas', 'Gestión de hasta 3 ayudantes'],
    colorClass: 'bg-gradient-to-b from-purple-500/10 to-fuchsia-500/5 border-purple-500/30 shadow-purple-500/5 hover:border-purple-500/50',
    buttonText: 'Reactivar Alquimia',
    isPopular: true
  },
  {
    id: 'premium',
    levelLabel: 'Nivel 3',
    name: 'BotaniQ Edén',
    desc: 'Para florerías con alta demanda de envíos y logística.',
    prices: { mxn: '$1,300 MXN', usd: '$65 USD', eur: '65 €', gbp: '£58' },
    features: ['App propia de repartidores', 'Rastreo GPS de entregas', 'Dominio propio (.com)'],
    colorClass: 'bg-gradient-to-b from-amber-500/10 to-orange-500/5 border-amber-500/20 hover:border-amber-500/45',
    buttonText: 'Activar Edén'
  }
];

export default function SubscriptionExpiredScreen() {
  const { tenant } = useTenant();
  const { profile } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<'basico' | 'pro' | 'premium' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isOwner = profile?.rol === 'dueño' || profile?.rol === 'superadmin';

  // Detección de locale y moneda basado en el helper centralizado
  const { locale, currency } = getLocaleAndCurrency();

  const handleReactivate = async (plan: 'basico' | 'pro' | 'premium') => {
    if (!tenant?.id) return;
    setLoadingPlan(plan);
    setError(null);

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
      }

      // Armar URLs de retorno para reactivación
      const baseDomainUrl = window.location.origin;
      const successUrl = `${baseDomainUrl}/admin?saas_success=true&reactivated=true`;
      const cancelUrl = `${baseDomainUrl}/admin?saas_cancel=true`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-saas-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentSession.access_token}`,
          },
          body: JSON.stringify({
            plan,
            tenant_id: tenant.id,
            currency,
            locale,
            success_url: successUrl,
            cancel_url: cancelUrl
          })
        }
      );

      const resData = await response.json();
      if (!response.ok || !resData.url) {
        throw new Error(resData.error || 'Ocurrió un error al contactar con la pasarela de Stripe.');
      }

      // Redirigir al Checkout de Stripe
      window.location.href = resData.url;
    } catch (err: any) {
      console.error('Error reactivating plan:', err);
      setError(err?.message || 'Error al conectar con Stripe. Intenta de nuevo.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md overflow-y-auto px-4 py-8">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-4xl bg-gray-900/40 border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-2xl text-white">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-16 w-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 mb-4 animate-pulse">
            <ShieldAlert size={36} />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
            Acceso Suspendido
          </h1>
          
          <p className="mt-2 text-gray-400 max-w-xl text-sm md:text-base">
            {isOwner 
              ? `El período de prueba o tu plan activo para "${tenant?.nombre || 'tu tienda'}" ha finalizado. Elige uno de nuestros planes para continuar vendiendo.`
              : `La suscripción para "${tenant?.nombre || 'tu tienda'}" ha finalizado y el acceso al panel administrativo está suspendido.`
            }
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {isOwner ? (
          /* Catálogo de planes para el Dueño */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {PLANS.map(plan => {
              const price = plan.prices[currency] || plan.prices.usd;
              const isCurrentLoading = loadingPlan === plan.id;
              
              return (
                <div 
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-2xl p-6 transition-all ${plan.colorClass}`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 right-6 rounded-full bg-purple-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                      Popular
                    </div>
                  )}
                  
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">{plan.levelLabel}</span>
                    <h3 className="text-xl font-bold mt-1">{plan.name}</h3>
                    <p className="text-sm text-gray-400 mt-2 min-h-[40px]">{plan.desc}</p>
                    <div className="mt-4 flex items-baseline">
                      <span className={`text-3xl font-extrabold ${plan.id === 'pro' ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-300' : plan.id === 'premium' ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300' : 'text-white'}`}>
                        {price}
                      </span>
                      <span className="text-gray-400 text-sm ml-1">/mes</span>
                    </div>
                    
                    <ul className="mt-6 space-y-2.5 text-sm text-gray-300">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check size={16} className={`${plan.id === 'pro' ? 'text-purple-400' : plan.id === 'premium' ? 'text-amber-400' : 'text-emerald-500'} shrink-0`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleReactivate(plan.id)}
                    disabled={loadingPlan !== null}
                    className={`mt-8 w-full py-3 rounded-xl active:scale-[0.98] transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 ${
                      plan.id === 'pro' 
                        ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-md shadow-purple-500/10'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {isCurrentLoading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        <CreditCard size={18} />
                        {plan.buttonText}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* Mensaje informativo para Empleados/Ayudantes */
          <div className="mb-8 p-8 rounded-2xl bg-white/5 border border-white/5 text-center flex flex-col items-center">
            <HelpCircle className="text-gray-400 mb-3" size={48} />
            <h3 className="text-lg font-bold">Comunícate con el Administrador</h3>
            <p className="text-sm text-gray-400 mt-2 max-w-md">
              Tu cuenta tiene rol de ayudante. Solo el dueño de la tienda puede reactivar la suscripción para restablecer los servicios y habilitar de nuevo el panel de administración.
            </p>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex justify-between items-center border-t border-white/10 pt-6">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Globe size={14} />
            <span>Resolución de precios en {currency.toUpperCase()} ({locale})</span>
          </div>
          
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all active:scale-[0.97]"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>

      </div>
    </div>
  );
}
