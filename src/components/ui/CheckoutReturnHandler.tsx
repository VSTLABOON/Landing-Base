// ─── CHECKOUT RETURN HANDLER ────────────────────────────────────
// Procesa los query params ?checkout=success|cancel&order=xxx
// que Stripe envía al redirigir al usuario de vuelta.
//
// Este componente:
//   1. Lee los query params al montar
//   2. Muestra un modal de éxito o cancelación
//   3. Limpia el carrito en caso de éxito
//   4. Limpia los query params de la URL (sin recargar)
// ────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useCartStore } from '../../store/cartStore.ts';
import { toast } from '../../store/toastStore.ts';
import { useTenant } from '../../context/TenantContext.tsx';
import { CheckCircle, XCircle, X, ArrowRight, Copy, Check } from 'lucide-react';

type CheckoutStatus = 'success' | 'cancel' | null;

export default function CheckoutReturnHandler() {
  const [status, setStatus] = useState<CheckoutStatus>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const clearCart = useCartStore((s) => s.clearCart);
  const { tenant } = useTenant();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get('checkout') as CheckoutStatus;
    const orderParam = params.get('order');

    if (!checkoutStatus) return;

    setStatus(checkoutStatus);
    setOrderId(orderParam);

    // Limpiar los query params de la URL sin recargar
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);

    if (checkoutStatus === 'success') {
      clearCart();
      toast.success('¡Pago recibido! Tu pedido está confirmado.', { duration: 5000 });
    } else if (checkoutStatus === 'cancel') {
      toast.warning('El pago fue cancelado. Tu carrito sigue intacto.', { duration: 5000 });
    }
  }, [clearCart]);

  const handleClose = () => {
    setStatus(null);
    setOrderId(null);
  };

  const handleCopy = () => {
    if (!orderId) return;
    const shortId = orderId.slice(0, 8).toUpperCase();
    navigator.clipboard.writeText(shortId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!status) return null;

  const isSuccess = status === 'success';
  const shortOrderId = orderId ? orderId.slice(0, 8).toUpperCase() : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label={isSuccess ? 'Pago exitoso' : 'Pago cancelado'}
      >
        <div
          className="relative bg-negro/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors z-10"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Visual header */}
          <div className={`relative h-40 flex items-center justify-center ${
            isSuccess
              ? 'bg-gradient-to-br from-verde/20 via-verde-dark/10 to-transparent'
              : 'bg-gradient-to-br from-rosa/20 via-rosa/5 to-transparent'
          }`}>
            {/* Decorative circles */}
            <div className={`absolute inset-0 overflow-hidden`}>
              <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-30 ${
                isSuccess ? 'bg-verde' : 'bg-rosa'
              }`} />
              <div className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-2xl opacity-20 ${
                isSuccess ? 'bg-verde-light' : 'bg-rosa'
              }`} />
            </div>

            {/* Icon */}
            <div className={`relative w-20 h-20 rounded-full flex items-center justify-center ${
              isSuccess
                ? 'bg-verde/20 ring-2 ring-verde/30'
                : 'bg-rosa/20 ring-2 ring-rosa/30'
            }`}>
              {isSuccess ? (
                <CheckCircle className="w-10 h-10 text-verde-light" strokeWidth={1.5} />
              ) : (
                <XCircle className="w-10 h-10 text-rosa" strokeWidth={1.5} />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 pt-2 text-center">
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              {isSuccess ? '¡Pedido Confirmado!' : 'Pago Cancelado'}
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              {isSuccess
                ? `Tu pago fue recibido exitosamente. ${tenant.nombre} ya fue notificado y pronto comenzará a preparar tu pedido.`
                : 'No se realizó ningún cargo. Tu carrito sigue intacto por si quieres intentarlo de nuevo.'}
            </p>

            {/* Order ID chip */}
            {isSuccess && shortOrderId && (
              <div className="mb-6">
                <p className="text-white/30 text-xs uppercase tracking-widest mb-2">
                  Número de pedido
                </p>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                >
                  <span className="font-mono text-lg font-bold text-verde-light tracking-wider">
                    {shortOrderId}
                  </span>
                  {copied ? (
                    <Check className="w-4 h-4 text-verde-light" />
                  ) : (
                    <Copy className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                  )}
                </button>
              </div>
            )}

            {/* Action button */}
            <button
              onClick={handleClose}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] ${
                isSuccess
                  ? 'bg-verde hover:bg-verde-light text-negro'
                  : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
            >
              {isSuccess ? 'Seguir comprando' : 'Volver a la tienda'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
