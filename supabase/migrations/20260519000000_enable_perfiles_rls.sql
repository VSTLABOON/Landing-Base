-- ═══════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Habilitar RLS y políticas seguras en tabla perfiles
-- ═══════════════════════════════════════════════════════════════════

-- 1. Habilitar Row Level Security
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Usuario lee su propio perfil" ON public.perfiles;
DROP POLICY IF EXISTS "Usuario lee su propio perfil o miembros de su tienda" ON public.perfiles;

-- 3. Crear función auxiliar para obtener tienda_id del usuario actual sin recursión RLS
CREATE OR REPLACE FUNCTION public.get_user_tienda_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT tienda_id FROM public.perfiles WHERE id = auth.uid();
$$;

-- 4. Crear política de lectura (SELECT)
-- Permite que un usuario lea su propio perfil o los perfiles de los miembros de su misma tienda (para pantallas como Equipo)
CREATE POLICY "Lectura de perfiles autorizada"
ON public.perfiles
FOR SELECT
TO authenticated
USING (id = auth.uid() OR tienda_id = public.get_user_tienda_id());

-- 5. Crear política de actualización (UPDATE)
-- Permite que un usuario intente actualizar su propio perfil
CREATE POLICY "Usuario actualiza su propio perfil"
ON public.perfiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 6. Crear trigger de protección contra escalación de privilegios (Role/Tenant Hijacking)
-- Evita que un usuario cambie su propio rol o se asigne a otra tienda a través del cliente
CREATE OR REPLACE FUNCTION public.prevent_profile_role_hijack()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Permitir modificaciones libres si el editor es superadmin
  IF EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND rol = 'superadmin'
  ) THEN
    RETURN NEW;
  END IF;

  -- Bloquear cambios en rol para usuarios normales
  IF NEW.rol IS DISTINCT FROM OLD.rol THEN
    RAISE EXCEPTION 'No tienes permiso para modificar tu rol de % a %.', OLD.rol, NEW.rol;
  END IF;

  -- Bloquear cambios en tienda_id (excepto si OLD.tienda_id era NULL, permitiendo la vinculación inicial si fuera necesaria)
  IF OLD.tienda_id IS NOT NULL AND NEW.tienda_id IS DISTINCT FROM OLD.tienda_id THEN
    RAISE EXCEPTION 'No tienes permiso para cambiar tu tienda vinculada.';
  END IF;

  RETURN NEW;
END;
$$;

-- Eliminar trigger si existía y crearlo
DROP TRIGGER IF EXISTS trigger_prevent_profile_role_hijack ON public.perfiles;
CREATE TRIGGER trigger_prevent_profile_role_hijack
  BEFORE UPDATE ON public.perfiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_hijack();
