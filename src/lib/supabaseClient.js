// ─── SUPABASE CLIENT ────────────────────────────────────────────
// Configuración centralizada del cliente de Supabase para React + Vite.
//
// Arquitectura Multi-tenant:
// Este cliente se conecta con el rol `anon` de Supabase. Las políticas
// RLS en las tablas `tiendas` y `productos` controlan qué datos son
// visibles para visitantes no autenticados.
//
// Las variables de entorno DEBEN tener el prefijo VITE_ para que
// Vite las exponga al bundle del cliente.
// ────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación en tiempo de desarrollo
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '⚠️ [Supabase] Variables de entorno faltantes.\n' +
    'Crea un archivo .env en la raíz del proyecto con:\n' +
    '  VITE_SUPABASE_URL=https://tu-proyecto.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=tu-clave-anon\n' +
    'Consulta .env.example para referencia.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // La landing pública no necesita persistir sesiones de usuario.
    // Desactivamos autoRefreshToken y persistSession para que el
    // cliente opere exclusivamente como lector anónimo, sin escribir
    // cookies ni tokens en localStorage.
    persistSession: false,
    autoRefreshToken: false,
  },
});
