-- Agregar la columna slug a la tabla productos
ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS slug TEXT;

-- Crear la función para generar el slug a partir del nombre
CREATE OR REPLACE FUNCTION generate_product_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.nombre, '[^a-zA-Z0-9]+', '-', 'g'));
    -- Quitar guiones al principio y al final
    NEW.slug := trim(both '-' from NEW.slug);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger para que se ejecute antes de insertar o actualizar
CREATE TRIGGER trigger_generate_product_slug
BEFORE INSERT OR UPDATE OF nombre ON public.productos
FOR EACH ROW
EXECUTE FUNCTION generate_product_slug();

-- Actualizar productos existentes con un slug
UPDATE public.productos
SET slug = lower(regexp_replace(nombre, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;
