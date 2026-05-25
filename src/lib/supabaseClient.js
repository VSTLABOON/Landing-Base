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
//
// SESIÓN CROSS-SUBDOMAIN:
// Para que un usuario que inicia sesión en botaniq.com/login
// mantenga su sesión al ser redirigido a flores.botaniq.com/admin,
// usamos un storage basado en cookies con domain=.botaniq.com
// en lugar del localStorage por defecto (aislado por origen).
// ────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';
import { getPlatformDomain } from './domain';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ── Validación estricta: sin credenciales, la app no puede funcionar ──
// Este throw es intencional: el ErrorBoundary lo captura y muestra
// "Error de configuración. Contacta al administrador."
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Error de configuración. Contacta al administrador.\n' +
    '[Supabase] Variables faltantes: VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY.\n' +
    'Consulta .env.example para referencia.'
  );
}

// ── Cookie Domain Helper ────────────────────────────────────────
// Determina el dominio de la cookie basándose en el hostname actual.
// En producción, las cookies se comparten entre subdominios usando
// domain=.botaniq.com. En localhost, no se especifica dominio.
function getCookieDomain(hostname) {
  // Localhost / IP → sin dominio de cookie (funciona por defecto)
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)
  ) {
    return '';
  }

  // Plataforma base y subdominios → compartir con domain padre
  const platform = getPlatformDomain();
  if (hostname === platform || hostname.endsWith(`.${platform}`)) {
    return `; domain=.${platform}`;
  }

  // Staging en Vercel/Railway → compartir con el dominio base de staging
  if (hostname.endsWith('.vercel.app') || hostname.endsWith('.railway.app')) {
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      const baseDomain = parts.slice(parts.length - 3).join('.');
      return `; domain=.${baseDomain}`;
    }
  }

  // Custom domains → sin dominio especial (cookie aislada al dominio)
  return '';
}

// ── Cookie Storage para Sesiones Cross-Subdomain ────────────────
// Reemplaza el localStorage por defecto de Supabase con cookies
// que se comparten entre todos los subdominios de la plataforma.
// Incluye un fallback a localStorage para respaldo/compatibilidad.
const cookieStorage = {
  getItem(key) {
    // Intentar leer de cookies primero
    const name = key + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    for (let c of decodedCookie.split(';')) {
      c = c.trimStart();
      if (c.startsWith(name)) {
        return c.substring(name.length);
      }
    }
    // Fallback a localStorage
    try { return localStorage.getItem(key); } catch { return null; }
  },

  setItem(key, value) {
    const cookieDomain = getCookieDomain(window.location.hostname);
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    const isSecure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expires}; path=/${cookieDomain}; SameSite=Lax${isSecure}`;
    // Respaldo en localStorage
    try { localStorage.setItem(key, value); } catch {}
  },

  removeItem(key) {
    const cookieDomain = getCookieDomain(window.location.hostname);
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${cookieDomain}`;
    try { localStorage.removeItem(key); } catch {}
  }
};

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      // ── FIX DT-01: Sesiones persistentes cross-subdomain ──────
      // Las cookies con domain=.botaniq.com permiten que la sesión
      // persista cuando el usuario es redirigido de botaniq.com/login
      // a flores.botaniq.com/admin tras el onboarding/login.
      //
      // Supabase maneja ambos estados sin conflicto — si no hay
      // sesión activa, las queries usan el rol anon automáticamente.
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'botaniq-auth-token',
      storage: cookieStorage,
    },
  }
);
