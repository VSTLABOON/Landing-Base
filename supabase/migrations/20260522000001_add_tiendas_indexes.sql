-- Migración: Índices para resolución eficiente de tenant
-- Acelera las búsquedas en TenantContext por subdominio (slug) y dominio personalizado (custom_domain)

CREATE INDEX IF NOT EXISTS idx_tiendas_slug
  ON public.tiendas(slug);

CREATE INDEX IF NOT EXISTS idx_tiendas_custom_domain
  ON public.tiendas(custom_domain);
