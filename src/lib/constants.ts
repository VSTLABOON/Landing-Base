// ─── CONSTANTS — VALORES CENTRALIZADOS ──────────────────────────
// Fuente de verdad para colores de UI, límites, y valores que
// antes estaban hardcodeados en componentes individuales.
//
// REGLA: Si un valor aparece en más de un archivo, debe vivir aquí.
// Los colores dinámicos del tenant (primario, secundario, acento)
// NO van aquí — viven en TenantContext y CSS custom properties.
// ────────────────────────────────────────────────────────────────

// ── Colores de UI del Sistema ────────────────────────────────────
// Estos son colores de terceros y del sistema de diseño, NO
// del branding dinámico del tenant.

export const UI_COLORS = {
  /** WhatsApp brand green — botones de contacto */
  WHATSAPP: '#25D366',
  WHATSAPP_HOVER: '#1EBA57',

  /** Color primario hover — usado como hover de rosa */
  PRIMARY_HOVER: '#C43860',

  /** Indicador de disponibilidad (punto verde) */
  AVAILABLE_DOT: '#4ade80',

  /** Charts del Dashboard */
  CHART_PRIMARY: '#10b981',
  CHART_GRID: '#f3f4f6',
  CHART_TICK: '#9ca3af',

  /** Superadmin theme */
  SUPERADMIN_BG: '#0a0a0f',
  SUPERADMIN_SIDEBAR: '#0f0f18',

  /** Login page decorative orb */
  LOGIN_ORB_INDIGO: '#6366f1',

  /** Login alert colors */
  LOGIN_ERROR_TEXT: '#fca5a5',
  LOGIN_SUCCESS_TEXT: '#86efac',

  /** Petal overlay colors for Hero animation */
  PETAL_COLORS: ['rgba(240,160,180,.7)', 'rgba(255,255,255,.5)', 'rgba(217,79,110,.55)', 'rgba(196,154,60,.4)'],
} as const;

// ── Límites y Configuración ──────────────────────────────────────

export const LIMITS = {
  /** Tamaño máximo del logo en bytes (2 MB) */
  LOGO_MAX_SIZE_BYTES: 2 * 1024 * 1024,

  /** Duración del animation counter en Hero (ms) */
  HERO_COUNTER_ANIMATION_MS: 2000,

  /** Texto centralizado para promesa de entrega express */
  EXPRESS_DELIVERY_TEXT: 'menos de 3 horas',
} as const;

// ── Fallback defaults para tenant ────────────────────────────────
// Usados cuando Supabase no devuelve datos. Estos coinciden con
// los defaults en TenantContext FALLBACK_TENANT.

export const FALLBACK_TENANT_DEFAULTS = {
  SLUG: 'demo',
  NAME: 'Florería Demo',
  COLORS: {
    PRIMARY: '#D94F6E',
    SECONDARY: '#3A6B34',
    ACCENT: '#C49A3C',
  }
} as const;

// ── Regex Patterns ───────────────────────────────────────────────

export const PATTERNS = {
  /** Teléfono mexicano: 10 dígitos, opcionalmente con +52 */
  PHONE_MX: /^(\+?52)?[\s-]?\d{2,3}[\s-]?\d{3,4}[\s-]?\d{4}$/,

  /** URL válida (http/https) */
  URL: /^https?:\/\/.+/,
} as const;

// ── Tipografía ───────────────────────────────────────────────────

export const FONT_OPTIONS = [
  { name: 'Inter',              value: 'Inter' },
  { name: 'Playfair Display',   value: 'Playfair Display' },
  { name: 'DM Serif Display',   value: 'DM Serif Display' },
  { name: 'Outfit',             value: 'Outfit' },
  { name: 'Cormorant Garamond', value: 'Cormorant Garamond' },
  { name: 'Roboto',             value: 'Roboto' },
  { name: 'Lora',               value: 'Lora' },
  { name: 'Merriweather',       value: 'Merriweather' },
  { name: 'Montserrat',         value: 'Montserrat' },
  { name: 'Nunito',             value: 'Nunito' },
  { name: 'Poppins',            value: 'Poppins' },
  { name: 'Raleway',            value: 'Raleway' },
  { name: 'Oswald',             value: 'Oswald' },
] as const;
