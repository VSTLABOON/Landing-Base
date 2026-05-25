-- Fix RLS policies for productos and producto_variantes
-- The old policies incorrectly referenced an "owner_id" column in tiendas which does not exist.

-- Drop old broken policies
DROP POLICY IF EXISTS "Dueños gestionan sus productos" ON public.productos;
DROP POLICY IF EXISTS "Dueños gestionan variantes" ON public.producto_variantes;

-- Create correct policies based on perfiles table
CREATE POLICY "Dueños gestionan sus productos" 
ON public.productos FOR ALL TO authenticated 
USING (
  tienda_id IN (
    SELECT tienda_id FROM public.perfiles
    WHERE id = auth.uid() AND rol IN ('dueño', 'superadmin', 'empleado')
  )
) WITH CHECK (
  tienda_id IN (
    SELECT tienda_id FROM public.perfiles
    WHERE id = auth.uid() AND rol IN ('dueño', 'superadmin', 'empleado')
  )
);

CREATE POLICY "Dueños gestionan variantes" 
ON public.producto_variantes FOR ALL TO authenticated 
USING (
  producto_id IN (
    SELECT p.id FROM public.productos p
    JOIN public.perfiles pf ON p.tienda_id = pf.tienda_id
    WHERE pf.id = auth.uid() AND pf.rol IN ('dueño', 'superadmin', 'empleado')
  )
) WITH CHECK (
  producto_id IN (
    SELECT p.id FROM public.productos p
    JOIN public.perfiles pf ON p.tienda_id = pf.tienda_id
    WHERE pf.id = auth.uid() AND pf.rol IN ('dueño', 'superadmin', 'empleado')
  )
);
