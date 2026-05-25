-- ═══════════════════════════════════════════════════════════════════
-- STORAGE: Bucket para logos de tiendas
--
-- Crea el bucket con acceso público para que los logos se muestren
-- sin necesidad de token.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Crear el bucket (público para lectura)
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política: Cualquier usuario autenticado con rol dueño/admin puede subir
CREATE POLICY "Staff sube logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logos'
  AND EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid()
    AND rol IN ('dueño', 'admin', 'superadmin')
  )
);

-- 3. Política: Cualquier persona puede ver los logos (son públicos)
CREATE POLICY "Logos son publicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

-- 4. Política: Staff puede borrar logos
CREATE POLICY "Staff borra logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'logos'
  AND EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid()
    AND rol IN ('dueño', 'admin', 'superadmin')
  )
);

-- 5. Política: Staff puede actualizar (reemplazar) logos
CREATE POLICY "Staff actualiza logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'logos'
  AND EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid()
    AND rol IN ('dueño', 'admin', 'superadmin')
  )
);
