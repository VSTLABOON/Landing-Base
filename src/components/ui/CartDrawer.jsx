import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { meta } from '../../data/floreria';
import { supabase } from '../../lib/supabaseClient';

// ── Feature Flags (leídos desde variables de entorno de Vite) ────
//
// Vite expone las variables VITE_* como strings en import.meta.env.
// Por ejemplo: VITE_ENABLE_CHECKOUT=true llega como el string "true".
//
// La comparación `=== 'true'` convierte el string a un booleano real.
// Si la variable no existe (undefined), el resultado es `false`,
// lo que actúa como un "apagado seguro" por defecto.
//
// Para cambiar estos valores:
//   1. Edita el archivo .env en la raíz del proyecto
//   2. Reinicia Vite (Ctrl+C → npm run dev)
//
// Ver .env.example para los 3 escenarios de despliegue documentados.
const features = {
  enableCheckout: import.meta.env.VITE_ENABLE_CHECKOUT === 'true',
  enableWhatsApp: import.meta.env.VITE_ENABLE_WHATSAPP === 'true',
};

export default function CartDrawer() {
  const { cart, isCartOpen, abrirCarrito, cerrarCarrito, eliminarDelCarrito, calcularTotal, vaciarCarrito } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    fecha: '',
    colonia: '',
    destinatario: '',
    notas: '',
    mensaje: ''
  });

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const minDate = `${yyyy}-${mm}-${dd}`;

  useEffect(() => {
    if (!formData.fecha) {
      setFormData(prev => ({ ...prev, fecha: minDate }));
    }
  }, [minDate, formData.fecha]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mensaje' && value.length > 120) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Tu carrito está vacío. Agrega al menos un arreglo para continuar.");
      return;
    }

    const { nombre, fecha, colonia, destinatario, notas, mensaje } = formData;
    const [y, m, d] = fecha.split('-');
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const fechaLeg = `${Number(d)} de ${meses[Number(m) - 1]} de ${y}`;

    const productos = cart.filter(i => i.type === 'producto');
    const floresArr = cart.filter(i => i.type === 'flor');

    const lines = [
      '¡Hola! Quiero hacer un pedido 🌸',
      '',
    ];
    
    if (productos.length) {
      lines.push('🛒 *Arreglos:*');
      productos.forEach((p, i) => lines.push(`${i + 1}. ${p.label} (${p.sub})`));
      lines.push('');
    }
    
    if (floresArr.length || notas) {
      lines.push('💐 *Preferencia de Flores / Extras:*');
      floresArr.forEach(f => lines.push(`• ${f.label} (${f.sub})`));
      if (notas) lines.push(`📝 *Notas:* ${notas}`);
      lines.push('');
    }

    lines.push(
      `📅 *Fecha de entrega:* ${fechaLeg}`,
      `📍 *Colonia:* ${colonia}`,
      `👤 *Quién pide:* ${nombre}`,
      `💐 *Para:* ${destinatario}`
    );
    if (mensaje) lines.push(`✉️ *Tarjeta:* "${mensaje}"`);

    lines.push('', 'Por favor confirmar disponibilidad y costo de envío. ¡Gracias!');

    const url = `https://wa.me/${meta.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
    
    window.open(url, '_blank', 'noopener');
  };

  return (
    <>
      {/* Botón FAB Global (Floating Action Button) */}
      <button 
        onClick={abrirCarrito}
        aria-label="Abrir formulario de pedido"
        className={`fixed bottom-6 right-6 z-[8900] w-[60px] h-[60px] rounded-full bg-verde text-white shadow-lg-custom flex items-center justify-center transition-transform duration-300 hover:scale-110 ${cart.length > 0 ? 'animate-bounce' : ''}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24" aria-hidden="true">
          <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
        </svg>
        {cart.length > 0 && (
          <div className="absolute -top-1 -right-1 bg-rosa text-white text-[0.7rem] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-negro">
            {cart.length}
          </div>
        )}
      </button>

      {/* Backdrop del Drawer */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9990] transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={cerrarCarrito}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside 
        role="dialog"
        aria-modal="true"
        aria-label="Hacer un pedido"
        className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-negro-soft border-l border-white/5 z-[9991] flex flex-col shadow-2xl transition-transform duration-500 ease-spring ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3 text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
            <span className="font-display text-xl font-bold">Tu Pedido</span>
          </div>
          <button onClick={cerrarCarrito} aria-label="Cerrar panel" className="text-white/50 hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-6 flex flex-col gap-6">
          {/* Lista de Productos del Carrito */}
          <div className="flex flex-col gap-4">
            {cart.length === 0 ? (
              <p className="text-texto-muted text-sm text-center py-6">Tu carrito está vacío</p>
            ) : (
              cart.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                  {item.img && <img src={item.img} alt={item.label} className="w-16 h-16 object-cover rounded-lg bg-crema-dark shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{item.label}</p>
                    <p className="text-rosa text-xs">{item.sub}</p>
                  </div>
                  <button onClick={() => eliminarDelCarrito(item.id)} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors" aria-label="Quitar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Formulario */}
          <form id="carrito-form" onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cd-nombre" className="text-[0.75rem] font-semibold text-white/60 uppercase tracking-wider">Tu nombre *</label>
                <input type="text" id="cd-nombre" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="María González" className="w-full bg-negro border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-verde focus:ring-1 focus:ring-verde transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cd-fecha" className="text-[0.75rem] font-semibold text-white/60 uppercase tracking-wider">Fecha entrega *</label>
                <input type="date" id="cd-fecha" name="fecha" value={formData.fecha} min={minDate} onChange={handleChange} required className="w-full bg-negro border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-verde focus:ring-1 focus:ring-verde transition-all [color-scheme:dark]" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cd-colonia" className="text-[0.75rem] font-semibold text-white/60 uppercase tracking-wider">Colonia de entrega *</label>
              <input type="text" id="cd-colonia" name="colonia" value={formData.colonia} onChange={handleChange} required placeholder="Ej: Angelópolis" className="w-full bg-negro border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-verde focus:ring-1 focus:ring-verde transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cd-destinatario" className="text-[0.75rem] font-semibold text-white/60 uppercase tracking-wider">¿Para quién es? *</label>
              <input type="text" id="cd-destinatario" name="destinatario" value={formData.destinatario} onChange={handleChange} required placeholder="Nombre de quien recibe" className="w-full bg-negro border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-verde focus:ring-1 focus:ring-verde transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cd-notas" className="text-[0.75rem] font-semibold text-white/60 uppercase tracking-wider">Preferencias <span className="text-white/30 lowercase normal-case">(opcional)</span></label>
              <input type="text" id="cd-notas" name="notas" value={formData.notas} onChange={handleChange} placeholder="Ej: Rosas rojas..." className="w-full bg-negro border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-verde focus:ring-1 focus:ring-verde transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-end">
                <label htmlFor="cd-mensaje" className="text-[0.75rem] font-semibold text-white/60 uppercase tracking-wider">Mensaje tarjeta <span className="text-white/30 lowercase normal-case">(opcional)</span></label>
                <span className={`text-xs ${formData.mensaje.length > 100 ? 'text-rosa' : 'text-white/30'}`}>{formData.mensaje.length} / 120</span>
              </div>
              <textarea id="cd-mensaje" name="mensaje" value={formData.mensaje} onChange={handleChange} rows="2" placeholder="Con todo mi amor…" maxLength="120" className="w-full bg-negro border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-verde focus:ring-1 focus:ring-verde transition-all resize-none"></textarea>
            </div>
          </form>
        </div>

        {/* Footer del Drawer */}
        <div className="p-6 border-t border-white/5 bg-negro shrink-0 flex flex-col gap-3">
          <div className="flex justify-between items-center text-white mb-2">
            <span className="text-sm font-semibold text-white/60">Total estimado:</span>
            <span className="font-display text-2xl font-bold text-verde">${calcularTotal()}</span>
          </div>

          {/* Resultado del checkout */}
          {checkoutResult?.success && (
            <div className="bg-verde/10 border border-verde/20 rounded-2xl p-4 text-center animate-fade-up mb-2">
              <p className="text-verde-light font-bold text-[1rem] mb-1">¡Pedido confirmado!</p>
              <p className="text-white/60 text-[0.75rem] font-mono">{checkoutResult.orden_id}</p>
            </div>
          )}
          {checkoutError && (
            <div className="bg-rosa/10 border border-rosa/20 rounded-2xl p-3 text-center animate-fade-up mb-2">
              <p className="text-rosa text-[0.8rem]">{checkoutError}</p>
            </div>
          )}

          {/* ── Botón 1: Checkout Formal ── */}
          {features.enableCheckout && (
            <button 
              type="button"
              disabled={cart.length === 0 || checkoutLoading}
              onClick={async (e) => {
                e.preventDefault();
                setCheckoutLoading(true);
                setCheckoutError(null);
                setCheckoutResult(null);
                try {
                  const payload = {
                    items_carrito: cart.map(item => ({
                      id: item.id,
                      nombre: item.label || item.name,
                      precio: item.precioNum || 0,
                    })),
                    total: calcularTotal(),
                    cliente: {
                      nombre: formData.nombre,
                      fecha: formData.fecha,
                      colonia: formData.colonia,
                      destinatario: formData.destinatario,
                    },
                  };
                  const { data, error: fnError } = await supabase.functions.invoke(
                    'procesar-venta',
                    { body: payload }
                  );
                  if (fnError) throw fnError;
                  setCheckoutResult(data);
                  if (data?.success) vaciarCarrito();
                } catch (err) {
                  setCheckoutError(err.message || 'Error al procesar');
                } finally {
                  setCheckoutLoading(false);
                }
              }}
              className="w-full flex items-center justify-center gap-2.5 bg-verde hover:bg-verde-light disabled:bg-white/10 disabled:text-white/30 text-white rounded-xl py-3.5 font-bold text-[0.85rem] tracking-[0.04em] transition-all duration-300 ease-spring hover:scale-[1.02] disabled:hover:scale-100"
            >
              {checkoutLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeLinecap="round" /></svg>
                  Procesando...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Pagar ahora
                </>
              )}
            </button>
          )}

          {/* ── Separador Visual ── */}
          {features.enableCheckout && features.enableWhatsApp && (
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-[1px] bg-white/10"></div>
              <span className="text-[0.7rem] text-white/30 uppercase tracking-[0.15em] font-medium">o</span>
              <div className="flex-1 h-[1px] bg-white/10"></div>
            </div>
          )}

          {/* ── Botón 2: WhatsApp ── */}
          {features.enableWhatsApp && (
            <button 
              type="submit" 
              form="carrito-form"
              disabled={cart.length === 0}
              className={`w-full flex items-center justify-center gap-2 text-white rounded-xl py-3.5 font-bold transition-all duration-200
                ${features.enableCheckout
                  ? 'bg-transparent border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 text-[0.8rem]'
                  : 'bg-[#25D366] hover:bg-[#1EBA57] text-[0.85rem]'
                }
                disabled:bg-white/10 disabled:text-white/30 disabled:border-white/10`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Hacer pedido por WhatsApp
            </button>
          )}

          <p className="text-[0.6rem] text-center text-white/30 flex items-center justify-center gap-1.5 mt-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            {features.enableCheckout && features.enableWhatsApp
              ? 'Elige el método que prefieras. Ambos son seguros.'
              : features.enableWhatsApp
              ? 'Sin apps, sin registro. Confirman en minutos.'
              : 'Pago seguro procesado por nuestro servidor.'
            }
          </p>
        </div>
      </aside>
    </>
  );
}
