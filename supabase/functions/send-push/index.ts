import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";
import webpush from "npm:web-push@3.6.7";
import { getCorsHeaders, forbiddenOriginResponse, isOriginAllowed } from "../_shared/cors.ts";  // [BLINDADO] — Migrado de corsHeaders wildcard

// Set VAPID details
const VAPID_PUBLIC_KEY = Deno.env.get('VITE_VAPID_PUBLIC_KEY') || '';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:admin@landingbase.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

serve(async (req: Request) => {
  const origin = req.headers.get("Origin");

  // For OPTIONS preflight — allow without DB check
  if (req.method === "OPTIONS") {
    const allowed = await isOriginAllowed(origin, true);
    if (!allowed) return forbiddenOriginResponse();
    return new Response("ok", { headers: getCorsHeaders(origin) });
  }

  // For real requests — full validation including DB
  const originAllowed = await isOriginAllowed(origin);
  if (!originAllowed) {
    console.warn(`⛔ Origin no autorizado: ${origin}`);
    return forbiddenOriginResponse();
  }

  const corsHeaders = getCorsHeaders(origin);

  try {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      throw new Error('VAPID keys not configured');
    }

    const { user_id, title, body, icon, url, data } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get subscriptions for the user
    const { data: subscriptions, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('endpoint, auth_key, p256dh_key')
      .eq('user_id', user_id);

    if (error) throw error;
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscriptions found for user' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const payload = JSON.stringify({
      title: title || 'Notificación',
      body: body || 'Tienes una nueva notificación.',
      icon: icon || '/icon-192.png',
      url: url || '/admin',
      data: data || {}
    });

    const sendPromises = subscriptions.map((sub: any) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.auth_key,
          p256dh: sub.p256dh_key
        }
      };

      return webpush.sendNotification(pushSubscription, payload).catch((err: any) => {
        console.error('Error sending push to endpoint:', sub.endpoint, err);
        // If gone, you could delete the subscription from DB here
      });
    });

    await Promise.all(sendPromises);

    return new Response(JSON.stringify({ success: true, count: sendPromises.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Push Error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
