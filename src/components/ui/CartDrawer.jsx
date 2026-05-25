import { useState, useEffect } from 'react';
import { useCartStore } from '../../store/cartStore.ts';
import { useTenant } from '../../context/TenantContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { initiateStripeCheckout } from '../../services/checkoutService.ts';
import { createGuestOrder } from '../../services/orderService.ts';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { UI_COLORS } from '../../lib/constants.ts';
import { toast } from '../../store/toastStore.ts';
import { logger } from '../../lib/logger';

export default function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const openCart = useCartStore((s) => s.openCart);
  const closeCart = useCartStore((s) => s.closeCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const { tenant } = useTenant();
  const { profile } = useAuth();

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '', telefono: '', fecha: '', direccion: '',
    destinatario: '', notas: '', mensaje: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        nombre: prev.nombre || profile.nombre || '',
        telefono: prev.telefono || profile.telefono || '',
        direccion: prev.direccion || profile.direccion || '',
      }));
    }
  }, [profile]);

  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  useEffect(() => {
    if (!formData.fecha) setFormData(p => ({ ...p, fecha: minDate }));
  }, [minDate, formData.fecha]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mensaje' && value.length > 120) return;
    setFormData(p => ({ ...p, [name]: value }));
  };

  // Valida que el número de WhatsApp sea real (no el fallback)
  const isWhatsAppConfigured = tenant.whatsapp && tenant.whatsapp !== '0000000000' && /^\d{10,15}$/.test(tenant.whatsapp.replace(/\D/g, ''));

  const handleWhatsApp = async (e) => {
    e.preventDefault();
    if (!items.length) return toast.error("Tu carrito está vacío.");
    if (!isWhatsAppConfigured) {
      return toast.error('Esta tienda aún no ha configurado su WhatsApp. Intenta más tarde.');
    }
    const { nombre, fecha, direccion, destinatario, telefono, notas, mensaje } = formData;

    // ── 1. Registrar pedido en Supabase (estado: pendiente) ──────
    // Esto garantiza que el dueño vea el pedido en su dashboard
    // incluso si el cliente no completa la conversación por WhatsApp.
    let orderId = null;
    try {
      const subtotal = getSubtotal();
      const result = await createGuestOrder(
        {
          items,
          subtotal,
          shippingData: null,
          shippingCost: tenant.envio_costo || 0,
          total: subtotal + (tenant.envio_costo || 0),
        },
        {
          recipientName: destinatario,
          recipientPhone: telefono,
          deliveryAddress: direccion,
          deliveryDate: fecha,
          customMessage: mensaje,
        },
        tenant.id
      );
      orderId = result.orderId;
      logger.info('[CartDrawer] Pedido WhatsApp registrado:', orderId);
    } catch (err) {
      // Si falla el registro, seguimos con WhatsApp igualmente
      // El dueño recibirá los datos vía mensaje de texto
      logger.warn('[CartDrawer] No se pudo registrar pedido en BD:', err.message);
    }

    // ── 2. Construir mensaje de WhatsApp ─────────────────────────
    const [y,m,d] = fecha.split('-');
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const lines = ['Hola! Quiero hacer un pedido:','','-- Arreglos --'];
    items.forEach((it,i) => lines.push(`${i+1}. ${it.name} — ${it.variantName} x${it.quantity} ($${it.unitPrice*it.quantity})`));
    lines.push('',`Total: $${getSubtotal()} MXN`,'',
      `Entrega: ${Number(d)} de ${meses[Number(m)-1]} de ${y}`,
      `Dirección: ${direccion}`, `Quién pide: ${nombre}`, `Para: ${destinatario}`);
    if (notas) lines.push(`Notas: ${notas}`);
    if (mensaje) lines.push(`Tarjeta: "${mensaje}"`);
    if (orderId) lines.push('', `ID de pedido: ${orderId.slice(0, 8).toUpperCase()}`);
    lines.push('','¡Gracias!');

    // ── 3. Abrir WhatsApp y limpiar carrito ──────────────────────
    const cleanNumber = tenant.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    if (orderId) {
      clearCart();
      toast.success('¡Pedido registrado! Confirma por WhatsApp.');
    }
  };

  const handleCheckout = async () => {
    if (!items.length) return;

    // ── Validación de campos obligatorios ───────────────────────
    const { nombre, fecha, direccion, destinatario, telefono, notas, mensaje } = formData;
    if (!nombre.trim() || !fecha || !direccion.trim() || !destinatario.trim()) {
      toast.error('Completa los campos obligatorios: nombre, fecha, dirección y destinatario.');
      return;
    }

    setCheckoutLoading(true); setCheckoutError(null); setCheckoutResult(null);
    try {

      // ── 1. Crear pedido en BD con datos de envío (estado: pendiente_pago) ──
      // Esto garantiza que la dirección, fecha y dedicatoria se persistan
      // ANTES de redirigir a Stripe. El webhook solo necesita cambiar el estado.
      const subtotal = getSubtotal();
      const result = await createGuestOrder(
        {
          items,
          subtotal,
          shippingData: null,
          shippingCost: tenant.envio_costo || 0,
          total: subtotal + (tenant.envio_costo || 0),
        },
        {
          recipientName: destinatario,
          recipientPhone: telefono,
          deliveryAddress: direccion,
          deliveryDate: fecha,
          customMessage: mensaje,
        },
        tenant.id
      );

      logger.info('[CartDrawer] Pedido pre-pago creado:', result.orderId);

      // ── 2. Construir payload seguro: SOLO IDs y cantidades (Price Hardening) ──
      const checkoutItems = items.map((item) => ({
        product_id: item.productId,
        variant_id: item.variantId || null,
        quantity: item.quantity,
      }));

      const currentUrl = window.location.origin;
      const successUrl = `${currentUrl}?checkout=success&order=${result.orderId}`;
      const cancelUrl = `${currentUrl}?checkout=cancel&order=${result.orderId}`;

      // ── 3. Llamar a la Edge Function → Stripe Checkout ──
      const stripeUrl = await initiateStripeCheckout({
        tenantId: tenant.id,
        items: checkoutItems,
        successUrl,
        cancelUrl,
        orderId: result.orderId,
      });

      // Redirigir al usuario a la página de pago de Stripe
      window.location.href = stripeUrl;
    } catch (err) {
      const errorMsg = err.message || 'Error al procesar el pago';
      setCheckoutError(errorMsg);
      toast.error(errorMsg);
    } finally { setCheckoutLoading(false); }
  };

  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const INPUT = "w-full bg-negro border border-white/10 rounded-lg px-4 py-2.5 text-[var(--color-background-primary)] text-sm focus:outline-none focus:border-verde focus:ring-1 focus:ring-verde transition-all";
  const LABEL = "text-[0.75rem] font-semibold text-[var(--color-background-primary)]/60 uppercase tracking-wider";

  // Feature flags derived from subscription_level (DB source of truth)
  // Nivel 1: WhatsApp only | Nivel 2+: Stripe Checkout + WhatsApp
  const enableCheckout = tenant.subscription_level >= 2; // Nivel 2 = PRO
  const enableWhatsApp = true; // WhatsApp is always available
  const isCheckoutMode = enableCheckout;
  const FabIcon = isCheckoutMode ? ShoppingCart : MessageCircle;
  const fabAriaLabel = isCheckoutMode ? "Ir al checkout" : "Contactar por WhatsApp";

  return (
    <>
      {/* FAB */}
      <button onClick={openCart} aria-label={fabAriaLabel}
        aria-expanded={isOpen} aria-controls="cart-drawer"
        className={`fixed bottom-6 right-6 z-[8900] w-[60px] h-[60px] rounded-full bg-verde text-[var(--color-background-primary)] shadow-lg-custom flex items-center justify-center transition-transform duration-300 hover:scale-110 ${itemCount > 0 ? 'animate-bounce' : ''}`}>
        <FabIcon className="w-6 h-6" strokeWidth={2} />
        {itemCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-rosa text-[var(--color-background-primary)] text-[0.7rem] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-negro">
            <span aria-live="polite" aria-atomic="true">{itemCount}</span>
          </div>
        )}
      </button>

      {/* Backdrop */}
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9990] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={closeCart} aria-hidden="true" />

      {/* Drawer */}
      <aside id="cart-drawer" role="region" aria-label="Carrito de compras"
        className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-negro/90 backdrop-blur-2xl border-l border-white/5 z-[9991] flex flex-col shadow-2xl transition-transform duration-500 ease-spring ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3 text-[var(--color-background-primary)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            <span className="font-display text-xl font-bold">Tu Pedido</span>
            {itemCount > 0 && <span className="text-xs bg-verde/20 text-verde-light px-2 py-0.5 rounded-full font-semibold">{itemCount}</span>}
          </div>
          <button onClick={closeCart} aria-label="Cerrar" className="text-[var(--color-background-primary)]/50 hover:text-[var(--color-background-primary)] transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-6 flex flex-col gap-6">
          {/* Items con [−] qty [+] */}
          <div className="flex flex-col gap-3">
            {items.length === 0 ? (
              <p className="text-texto-muted text-sm text-center py-6">Tu carrito está vacío</p>
            ) : items.map((item) => (
              <div key={item.cartItemId} className="flex items-center gap-3 bg-[var(--color-background-primary)]/5 p-3 rounded-xl border border-white/5">
                {item.image && <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg bg-crema-dark shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[var(--color-background-primary)] text-sm truncate">{item.name}</p>
                  <p className="text-rosa text-xs">{item.variantName}</p>
                  <p className="text-verde-light text-xs font-semibold mt-0.5">${item.unitPrice * item.quantity}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-[var(--color-background-primary)]/10 text-[var(--color-background-primary)]/60 hover:text-[var(--color-background-primary)] hover:bg-[var(--color-background-primary)]/20 flex items-center justify-center text-sm font-bold transition-colors" aria-label="Reducir">−</button>
                  <span className="w-7 text-center text-[var(--color-background-primary)] text-sm font-semibold tabular-nums">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-[var(--color-background-primary)]/10 text-[var(--color-background-primary)]/60 hover:text-[var(--color-background-primary)] hover:bg-[var(--color-background-primary)]/20 flex items-center justify-center text-sm font-bold transition-colors" aria-label="Aumentar">+</button>
                </div>
                <button onClick={() => removeItem(item.cartItemId)} className="p-1.5 text-[var(--color-background-primary)]/30 hover:text-rosa hover:bg-rosa/10 rounded-lg transition-colors" aria-label="Quitar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ))}
          </div>

          {/* Form */}
          <form id="carrito-form" onSubmit={handleWhatsApp} className="flex flex-col gap-5 mt-2" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cd-nombre" className={LABEL}>Tu nombre *</label>
                <input type="text" id="cd-nombre" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="María González" className={INPUT} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cd-fecha" className={LABEL}>Fecha entrega *</label>
                <input type="date" id="cd-fecha" name="fecha" value={formData.fecha} min={minDate} onChange={handleChange} required className={`${INPUT} [color-scheme:dark]`} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cd-direccion" className={LABEL}>Dirección de entrega *</label>
              <input type="text" id="cd-direccion" name="direccion" value={formData.direccion} onChange={handleChange} required placeholder="Calle, número, colonia" className={INPUT} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cd-destinatario" className={LABEL}>¿Para quién? *</label>
                <input type="text" id="cd-destinatario" name="destinatario" value={formData.destinatario} onChange={handleChange} required placeholder="Nombre de quien recibe" className={INPUT} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cd-telefono" className={LABEL}>Teléfono</label>
                <input type="tel" id="cd-telefono" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="81 1234 5678" className={INPUT} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cd-notas" className={LABEL}>Preferencias <span className="text-[var(--color-background-primary)]/30 lowercase normal-case">(opcional)</span></label>
              <input type="text" id="cd-notas" name="notas" value={formData.notas} onChange={handleChange} placeholder="Ej: Rosas rojas..." className={INPUT} />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-end">
                <label htmlFor="cd-mensaje" className={LABEL}>Mensaje tarjeta <span className="text-[var(--color-background-primary)]/30 lowercase normal-case">(opcional)</span></label>
                <span className={`text-xs ${formData.mensaje.length > 100 ? 'text-rosa' : 'text-[var(--color-background-primary)]/30'}`}>{formData.mensaje.length}/120</span>
              </div>
              <textarea id="cd-mensaje" name="mensaje" value={formData.mensaje} onChange={handleChange} rows="2" placeholder="Con todo mi amor…" maxLength="120" className={`${INPUT} resize-none`} />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-negro shrink-0 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5 mb-1">
            <div className="flex justify-between items-center text-[var(--color-background-primary)]">
              <span className="text-xs text-[var(--color-background-primary)]/40">Subtotal</span>
              <span className="text-sm text-[var(--color-background-primary)]/70">${subtotal}</span>
            </div>
            {(tenant.envio_costo > 0) && (
              <div className="flex justify-between items-center text-[var(--color-background-primary)]">
                <span className="text-xs text-[var(--color-background-primary)]/40">Envío</span>
                <span className="text-sm text-[var(--color-background-primary)]/70">${tenant.envio_costo}</span>
              </div>
            )}
            <div className="h-px bg-white/5 my-1" />
            <div className="flex justify-between items-center text-[var(--color-background-primary)]">
              <span className="text-sm font-semibold text-[var(--color-background-primary)]/60">Total</span>
              <span className="font-display text-2xl font-bold text-verde">${subtotal + (tenant.envio_costo || 0)}</span>
            </div>
          </div>
          {checkoutResult?.success && (
            <div className="bg-verde/10 border border-verde/20 rounded-2xl p-4 text-center animate-fade-up mb-2">
              <p className="text-verde-light font-bold text-[1rem] mb-1">¡Pedido confirmado!</p>
              <p className="text-[var(--color-background-primary)]/60 text-[0.75rem] font-mono">{checkoutResult.orderId}</p>
            </div>
          )}
          {checkoutError && (
            <div className="bg-rosa/10 border border-rosa/20 rounded-2xl p-3 text-center animate-fade-up mb-2">
              <p className="text-rosa text-[0.8rem]">{checkoutError}</p>
            </div>
          )}

          {enableCheckout && (
            <button type="button" disabled={!items.length || checkoutLoading} onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2.5 bg-verde hover:bg-verde-light disabled:bg-[var(--color-background-primary)]/10 disabled:text-[var(--color-background-primary)]/30 text-[var(--color-background-primary)] rounded-xl py-3.5 font-bold text-[0.85rem] tracking-[0.04em] transition-all duration-300 ease-spring hover:scale-[1.02] disabled:hover:scale-100">
              {checkoutLoading ? (<><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeLinecap="round"/></svg>Procesando...</>)
              : (<><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Pagar ahora</>)}
            </button>
          )}

          {enableCheckout && enableWhatsApp && (
            <div className="flex items-center gap-3 my-1"><div className="flex-1 h-[1px] bg-[var(--color-background-primary)]/10"/><span className="text-[0.7rem] text-[var(--color-background-primary)]/30 uppercase tracking-[0.15em]">o</span><div className="flex-1 h-[1px] bg-[var(--color-background-primary)]/10"/></div>
          )}

          {enableWhatsApp && (
            <button type="submit" form="carrito-form" disabled={!items.length}
              className={`w-full flex items-center justify-center gap-2 text-[var(--color-background-primary)] rounded-xl py-3.5 font-bold transition-all duration-200 ${enableCheckout ? `bg-transparent border border-[${UI_COLORS.WHATSAPP}]/40 text-[${UI_COLORS.WHATSAPP}] hover:bg-[${UI_COLORS.WHATSAPP}]/10 text-[0.8rem]` : `bg-[${UI_COLORS.WHATSAPP}] hover:bg-[${UI_COLORS.WHATSAPP_HOVER}] text-[0.85rem]`} disabled:bg-[var(--color-background-primary)]/10 disabled:text-[var(--color-background-primary)]/30 disabled:border-white/10`}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              Pedido por WhatsApp
            </button>
          )}

          <p className="text-[0.6rem] text-center text-[var(--color-background-primary)]/30 flex items-center justify-center gap-1.5 mt-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            {enableCheckout && enableWhatsApp ? 'Elige el método que prefieras. Ambos son seguros.'
              : enableWhatsApp ? 'Sin apps, sin registro. Confirman en minutos.'
              : 'Pago seguro procesado por nuestro servidor.'}
          </p>
        </div>
      </aside>
    </>
  );
}
