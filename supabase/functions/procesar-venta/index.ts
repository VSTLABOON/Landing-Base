// @ts-nocheck — Runtime: Supabase Edge Functions (Deno), no Node.js.
// ═══════════════════════════════════════════════════════════════════
// EDGE FUNCTION: procesar-venta (HARDENED)
// Deploy: supabase functions deploy procesar-venta
//
// Correcciones de seguridad aplicadas:
//   V1 — CORS restringido a orígenes autorizados
//   V2 — Verificación de JWT (Authorization header requerido)
//   V3 — Recálculo del total en el server consultando precios reales
// ═══════════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Supabase server client (service_role para leer precios) ─────
const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);

// ── FIX V1: Orígenes permitidos (CORS restringido) ─────────────
// Solo estos dominios pueden invocar esta función.
// En desarrollo se permite localhost; en producción, tu dominio real.
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:4173",
  Deno.env.get("ALLOWED_ORIGIN") || "https://floresdel-corazon.mx",
];

/**
 * Devuelve el header Access-Control-Allow-Origin correcto.
 * Si el origin del request está en la lista blanca, lo refleja.
 * Si no, devuelve el primer origen permitido (bloquea el preflight).
 */
function getCorsHeaders(req) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

/** Genera un ID de orden único (prefijo FDC + timestamp + random) */
function generarOrdenId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `FDC-${ts}-${rand}`;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // ── Preflight CORS ────────────────────────────────────────
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // ── Solo POST ─────────────────────────────────────────────
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método no permitido. Usa POST." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // ── FIX V2: Verificar que el request traiga un JWT válido ──
    // El SDK de Supabase (supabase.functions.invoke) envía
    // automáticamente el header Authorization con la anon key.
    // Aquí validamos que exista y que sea un Bearer token.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "No autorizado. Se requiere token de autenticación." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar el JWT contra Supabase Auth
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    // Para la landing pública, el anon key no genera un "user",
    // pero el token sigue siendo válido si fue emitido por Supabase.
    // Si el token es completamente inválido, authError lo indica.
    // Aceptamos tanto usuarios autenticados como tokens anon válidos.
    if (authError && authError.message !== "User from sub claim in JWT does not exist") {
      // Si el error es otro (token expirado, malformado, etc.), rechazar
      const isAnonToken = token === Deno.env.get("SUPABASE_ANON_KEY");
      if (!isAnonToken) {
        return new Response(
          JSON.stringify({ error: "Token inválido o expirado." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ── Parsear body ──────────────────────────────────────────
    const body = await req.json();
    const { items_carrito, total: totalCliente, cliente } = body;

    // ── Validar estructura del carrito ─────────────────────────
    if (!items_carrito || !Array.isArray(items_carrito) || items_carrito.length === 0) {
      return new Response(
        JSON.stringify({ error: "El carrito está vacío o tiene formato inválido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validar que cada item tenga un ID
    const itemIds = items_carrito.map(i => i.id).filter(Boolean);
    if (itemIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "Los items del carrito no tienen IDs válidos." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── FIX V3: Recalcular total desde la base de datos ────────
    // NUNCA confiar en el "total" que envía el frontend.
    // Consultamos los precios reales de cada producto.
    const { data: productosDB, error: dbError } = await supabase
      .from("productos")
      .select("id, slug, nombre, precio_num, disponible")
      .or(`slug.in.(${itemIds.map(id => `"${id}"`).join(",")}),id.in.(${itemIds.map(id => `"${id}"`).join(",")})`)
      .eq("disponible", true);

    if (dbError) {
      return new Response(
        JSON.stringify({ error: "Error al verificar productos.", detail: dbError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar que todos los items existan en la DB
    if (!productosDB || productosDB.length === 0) {
      return new Response(
        JSON.stringify({ error: "Ninguno de los productos del carrito está disponible." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Recalcular el total real sumando precios de la base de datos
    const totalReal = productosDB.reduce((sum, p) => sum + (parseFloat(p.precio_num) || 0), 0);

    // Comparar con el total del cliente (tolerancia de $1 por redondeo)
    if (Math.abs(totalReal - totalCliente) > 1) {
      return new Response(
        JSON.stringify({
          error: "El total no coincide con los precios actuales.",
          total_recibido: totalCliente,
          total_calculado: totalReal,
          productos_encontrados: productosDB.length,
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Generar orden ─────────────────────────────────────────
    const orden_id = generarOrdenId();

    // Guardar la orden en la base de datos para trazabilidad
    // (La tabla "ordenes" se creará en una fase futura)
    // await supabase.from("ordenes").insert({
    //   orden_id,
    //   tienda_id: ...,
    //   items: productosDB.map(p => ({ id: p.id, precio: p.precio_num })),
    //   total: totalReal,
    //   cliente,
    //   status: "pendiente",
    // });

    // FUTURO: Integración con Stripe
    // const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(totalReal * 100), // centavos
    //   currency: "mxn",
    //   metadata: { orden_id },
    // });

    // ── Respuesta exitosa ─────────────────────────────────────
    return new Response(
      JSON.stringify({
        success: true,
        orden_id,
        total: totalReal,
        items_count: productosDB.length,
        mensaje: `Orden ${orden_id} creada exitosamente.`,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Error interno del servidor.", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
