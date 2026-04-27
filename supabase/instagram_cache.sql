-- ═══════════════════════════════════════════════════════════════════
-- INSTAGRAM FEED CACHE — Multi-tenant
-- Ejecutar en: Supabase Dashboard > SQL Editor > New Query
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. TABLA: instagram_cache ───────────────────────────────────
-- Almacena los posts cacheados de Instagram por tienda.
-- El campo tienda_id aísla el feed de cada tenant.
CREATE TABLE IF NOT EXISTS instagram_cache (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tienda_id     UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,
  ig_post_id    TEXT NOT NULL,                  -- ID del post en Instagram
  media_type    TEXT NOT NULL DEFAULT 'IMAGE',  -- IMAGE, VIDEO, CAROUSEL_ALBUM
  media_url     TEXT NOT NULL,                  -- URL de la imagen/video
  thumbnail_url TEXT,                           -- Thumbnail para videos
  permalink     TEXT NOT NULL DEFAULT '',       -- Link al post en Instagram
  caption       TEXT DEFAULT '',                -- Texto del post
  timestamp     TIMESTAMPTZ NOT NULL,           -- Fecha de publicación en IG
  cached_at     TIMESTAMPTZ DEFAULT NOW(),      -- Cuándo se cacheó
  
  -- Evitar duplicados: un post de IG solo puede existir una vez por tienda
  UNIQUE(tienda_id, ig_post_id)
);

-- Índices para consultas frecuentes
CREATE INDEX idx_ig_cache_tienda ON instagram_cache(tienda_id);
CREATE INDEX idx_ig_cache_timestamp ON instagram_cache(tienda_id, timestamp DESC);

-- ── 2. TABLA: instagram_tokens ──────────────────────────────────
-- Almacena los Long-Lived Tokens de Instagram por tienda.
-- Solo los administradores autenticados pueden leer/escribir esta tabla.
CREATE TABLE IF NOT EXISTS instagram_tokens (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tienda_id       UUID NOT NULL UNIQUE REFERENCES tiendas(id) ON DELETE CASCADE,
  access_token    TEXT NOT NULL,                 -- Long-Lived Token (60 días)
  ig_user_id      TEXT NOT NULL DEFAULT '',      -- Instagram User ID
  token_expires   TIMESTAMPTZ,                   -- Fecha de expiración del token
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. RLS ──────────────────────────────────────────────────────
ALTER TABLE instagram_cache  ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_tokens ENABLE ROW LEVEL SECURITY;

-- Cache: Lectura pública (el feed es visible para visitantes anónimos)
CREATE POLICY "anon_read_ig_cache"
  ON instagram_cache
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Tokens: SOLO lectura para el service_role (Edge Functions).
-- Los tokens NUNCA se exponen al frontend.
-- No creamos política de SELECT para anon/authenticated — esto bloquea
-- el acceso desde el cliente. Solo service_role_key los puede leer.
CREATE POLICY "service_role_manage_ig_tokens"
  ON instagram_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Cache: INSERT/UPDATE/DELETE solo desde service_role (Edge Functions)
CREATE POLICY "service_role_manage_ig_cache"
  ON instagram_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
