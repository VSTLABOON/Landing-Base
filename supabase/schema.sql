-- ═══════════════════════════════════════════════════════════════════
-- FLORES DEL CORAZÓN — Políticas RLS para Catálogo Público
-- Contexto: Arquitectura Multi-tenant con tablas existentes:
--   • tiendas  (id UUID, slug TEXT, ...)
--   • perfiles (id UUID, rol TEXT, tienda_id UUID FK, ...)
--   • productos (id UUID, tienda_id UUID FK, disponible BOOLEAN, ...)
--
-- Objetivo: Permitir que visitantes anónimos (rol `anon` de Supabase)
-- puedan leer el catálogo público de cualquier tienda.
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. HABILITAR RLS ────────────────────────────────────────────
-- Si ya lo habilitaste para las políticas de admin, estos comandos
-- son idempotentes (no fallan si ya está habilitado).
ALTER TABLE tiendas   ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- ── 2. POLÍTICAS DE LECTURA PÚBLICA ─────────────────────────────

-- Tiendas: Cualquier visitante puede leer datos de tiendas.
-- Esto permite resolver el slug → id sin autenticación.
CREATE POLICY "anon_read_tiendas"
  ON tiendas
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Productos: Solo se exponen productos marcados como disponibles.
-- Esto evita que productos en draft o agotados aparezcan en la landing.
CREATE POLICY "anon_read_productos_disponibles"
  ON productos
  FOR SELECT
  TO anon, authenticated
  USING (disponible = true);

-- ═══════════════════════════════════════════════════════════════════
-- NOTA: Las políticas de INSERT/UPDATE/DELETE para administradores
-- que ya tienes configuradas NO se ven afectadas por estas políticas.
-- RLS evalúa TODAS las políticas aplicables con OR lógico para
-- determinar el acceso. Tus admins seguirán pudiendo escribir.
-- ═══════════════════════════════════════════════════════════════════
