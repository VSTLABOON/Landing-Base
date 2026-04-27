import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useCart } from '../../context/CartContext';

/**
 * BotonCheckout — Componente de prueba para invocar la Edge Function.
 *
 * Toma los items del CartContext, los envía a `procesar-venta` vía
 * supabase.functions.invoke(), y muestra el resultado al usuario.
 */
export default function BotonCheckout() {
  const { cart, calcularTotal, vaciarCarrito } = useCart();
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      // Preparar payload
      const payload = {
        items_carrito: cart.map(item => ({
          id: item.id,
          nombre: item.name,
          precio: item.precioNum,
        })),
        total: calcularTotal(),
        cliente: {
          // En producción, estos datos vendrían del formulario del CartDrawer
          timestamp: new Date().toISOString(),
        },
      };

      // Invocar Edge Function
      const { data, error: fnError } = await supabase.functions.invoke(
        'procesar-venta',
        { body: payload }
      );

      if (fnError) throw fnError;

      setResultado(data);
      // Vaciar carrito después de orden exitosa
      if (data?.success) {
        vaciarCarrito();
      }
    } catch (err) {
      console.error('[BotonCheckout] Error:', err);
      setError(err.message || 'Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading || cart.length === 0}
        className="w-full bg-verde hover:bg-verde-light text-white font-bold text-[0.85rem] tracking-[0.08em] uppercase py-4 rounded-full transition-all duration-300 ease-spring hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeLinecap="round" />
            </svg>
            Procesando...
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Confirmar Pedido
          </>
        )}
      </button>

      {/* Resultado exitoso */}
      {resultado?.success && (
        <div className="bg-verde/10 border border-verde/20 rounded-2xl p-5 text-center animate-fade-up">
          <p className="text-verde-light font-bold text-[1.1rem] mb-1">¡Pedido confirmado!</p>
          <p className="text-white/60 text-[0.8rem] font-mono">{resultado.orden_id}</p>
          <p className="text-white/40 text-[0.75rem] mt-2">
            {resultado.items_count} arreglo{resultado.items_count !== 1 ? 's' : ''} · ${resultado.total} MXN
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-rosa/10 border border-rosa/20 rounded-2xl p-4 text-center animate-fade-up">
          <p className="text-rosa text-[0.85rem]">{error}</p>
        </div>
      )}
    </div>
  );
}
