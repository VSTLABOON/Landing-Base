-- ═══════════════════════════════════════════════════════════════════
-- STORAGE: Bucket para imágenes de productos
--
-- Crea el bucket con acceso público para que las imágenes se muestren
-- sin necesidad de token. Las políticas RLS controlan quién puede
-- subir/borrar archivos.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Crear el bucket (público para lectura, las URLs son directas)
INSERT INTO storage.buckets (id, name, public)
VALUES ('productos', 'productos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política: Cualquier usuario autenticado con rol dueño/empleado puede subir
CREATE POLICY "Staff sube imagenes de productos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'productos'
  AND EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid()
    AND rol IN ('dueño', 'empleado', 'superadmin')
  )
);

-- 3. Política: Cualquier persona puede ver las imágenes (son públicas)
CREATE POLICY "Imagenes de productos son publicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'productos');

-- 4. Política: Staff puede borrar imágenes de productos
CREATE POLICY "Staff borra imagenes de productos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'productos'
  AND EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid()
    AND rol IN ('dueño', 'empleado', 'superadmin')
  )
);

-- 5. Política: Staff puede actualizar (reemplazar) imágenes
CREATE POLICY "Staff actualiza imagenes de productos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'productos'
  AND EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid()
    AND rol IN ('dueño', 'empleado', 'superadmin')
  )
);
