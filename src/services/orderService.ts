// ─── ORDER SERVICE ──────────────────────────────────────────────
// Capa de servicios para el flujo de Guest Checkout.
//
// IMPORTANTE: Esta función NO realiza inserciones múltiples.
// Toda la lógica transaccional (crear pedido + insertar items)
// está encapsulada en la función PL/pgSQL `create_guest_order`
// del lado del servidor. El frontend solo envía UNA llamada RPC.
//
// La función de base de datos garantiza atomicidad: si algo falla,
// se hace rollback automático y ningún dato queda huérfano.
// ────────────────────────────────────────────────────────────────

import { supabase } from '../lib/supabaseClient';
import type { CheckoutState, ShippingData } from '../types';
import { logger } from '../lib/logger';

/**
 * Crea un pedido anónimo (guest checkout) invocando una ÚNICA
 * función RPC en Supabase.
 *
 * @param checkout - Estado completo del checkout (items + totales)
 * @param shipping - Datos de envío y dedicatoria
 * @param tenantId - UUID de la tienda (tienda_id)
 * @returns Objeto con el orderId generado por la base de datos
 * @throws Error si la función RPC falla
 *
 * @example
 * ```ts
 * const result = await createGuestOrder(checkout, shippingData, tenant.id);
 * logger.info('Pedido creado:', result.orderId);
 * ```
 */
export async function createGuestOrder(
  checkout: CheckoutState,
  shipping: ShippingData,
  tenantId: string
): Promise<{ success: boolean; orderId: string }> {

  // Mapear los items del carrito al formato que espera la función RPC
  const itemsPayload = checkout.items.map((item) => ({
    producto_id: item.productId,
    variante_id: item.variantId,
    nombre: item.name,
    cantidad: item.quantity,
    precio_unitario: item.unitPrice,
  }));

  // ── ÚNICA llamada a la base de datos ──────────────────────────
  // La función PL/pgSQL `create_guest_order` recibe todos los datos
  // y ejecuta las inserciones dentro de una transacción atómica:
  //   1. INSERT INTO pedidos (tienda_id, total, datos_envio, estado)
  //   2. INSERT INTO pedido_items (pedido_id, producto_id, variante_id, cantidad, precio_unitario)
  //   3. RETURN pedido.id
  const { data, error } = await supabase.rpc('create_guest_order', {
    p_tienda_id: tenantId,
    p_total: checkout.total,
    p_datos_envio: shipping,
    p_items: itemsPayload,
    p_costo_envio: checkout.shippingCost,
  });

  if (error) {
    logger.error('Error al crear pedido en RPC:', error);
    throw new Error('No se pudo procesar tu pedido. Por favor, intenta de nuevo más tarde.');
  }

  return { success: true, orderId: data };
}
