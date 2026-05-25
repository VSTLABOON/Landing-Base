import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';

/**
 * Checks rate limits for a given endpoint and identifier (IP or User ID).
 * Returns true if the request is allowed, false if rate limited.
 * 
 * [BLINDADO] Usa UPDATE atómico para evitar race conditions.
 * El patrón anterior (READ → INCREMENT → WRITE) permitía que dos
 * requests simultáneas leyeran el mismo count y ambas pasaran.
 * 
 * @param req The incoming Request object
 * @param endpoint The name of the endpoint/function (e.g., 'create-checkout')
 * @param maxRequests Maximum requests allowed in the time window
 * @param windowMinutes The time window in minutes
 */
export async function checkRateLimit(
  req: Request, 
  endpoint: string, 
  maxRequests: number = 5, 
  windowMinutes: number = 1
): Promise<boolean> {
  // Use service_role key to bypass RLS for rate_limits table
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase env vars in rateLimit helper');
    return true; // Fail open if misconfigured to not block legit users
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 1. Identify the user (prefer Auth ID, fallback to IP)
  const authHeader = req.headers.get('Authorization');
  let identifier = '';

  if (authHeader) {
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (user) {
      identifier = `user:${user.id}`;
    }
  }

  // If no user, use IP
  if (!identifier) {
    // [BLINDADO] Prioridad de headers. cf-connecting-ip no puede ser spoofeado
    // si usas Cloudflare. Si se usa x-forwarded-for, verificamos el orden.
    const ip = req.headers.get('cf-connecting-ip') || 
               req.headers.get('x-real-ip') || 
               req.headers.get('x-forwarded-for') || 
               'unknown';
    // Si hay múltiples IPs en x-forwarded-for, la última suele ser la del
    // proxy más cercano a nosotros (menos spoofable por el cliente original).
    const ips = ip.split(',');
    const clientIp = ips[ips.length - 1].trim();
    identifier = `ip:${clientIp}`;
  }

  // ═══════════════════════════════════════════════════════════════  // [BLINDADO]
  // 2. UPDATE ATÓMICO — Elimina race condition                     // [BLINDADO]
  // ═══════════════════════════════════════════════════════════════  // [BLINDADO]
  // ANTES: READ count → INCREMENT en JS → WRITE (no atómico)      // [BLINDADO]
  //   Dos requests simultáneas leían count=4, ambas escribían 5,   // [BLINDADO]
  //   y ambas pasaban el límite. Un atacante con requests           // [BLINDADO]
  //   paralelas podía bypassear el rate limit.                     // [BLINDADO]
  //                                                                // [BLINDADO]
  // AHORA: Un solo UPDATE atómico con RETURNING en PostgreSQL.     // [BLINDADO]
  //   La DB serializa las escrituras → imposible bypassear.        // [BLINDADO]
  // ═══════════════════════════════════════════════════════════════  // [BLINDADO]
  try {
    // [BLINDADO] Paso 2a: Intentar UPDATE atómico (increment + reset si ventana expiró)
    const { data: rpcResult, error: rpcError } = await supabase                  // [BLINDADO]
      .rpc('atomic_rate_limit', {                                                // [BLINDADO]
        p_identifier: identifier,                                                // [BLINDADO]
        p_endpoint: endpoint,                                                    // [BLINDADO]
        p_window_minutes: windowMinutes,                                         // [BLINDADO]
      });                                                                        // [BLINDADO]

    if (rpcError) {                                                              // [BLINDADO]
      console.error('Rate limit RPC error:', rpcError.message);                  // [BLINDADO]
      return true; // Fail open                                                  // [BLINDADO]
    }                                                                            // [BLINDADO]

    const currentCount = rpcResult as number;                                    // [BLINDADO]

    if (currentCount > maxRequests) {                                            // [BLINDADO]
      console.warn(`Rate limit exceeded for ${identifier} on ${endpoint} (${currentCount}/${maxRequests})`);  // [BLINDADO]
      return false; // Rate limited                                              // [BLINDADO]
    }                                                                            // [BLINDADO]

    return true; // Allowed                                                      // [BLINDADO]
  } catch (err) {
    console.error('Rate limiting error:', err);
    return true; // Fail open
  }
}
