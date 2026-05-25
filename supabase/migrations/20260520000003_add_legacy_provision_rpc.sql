-- ═══════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Función RPC para aprovisionar tiendas de usuarios legacy
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.provision_store_for_legacy_user()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_tienda_id UUID;
  v_profile_tienda_id UUID;
  v_nombre TEXT := 'Mi Nueva Florería';
BEGIN
  -- 1. Obtener ID del usuario autenticado
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No autorizado. Debes estar autenticado para realizar esta acción.';
  END IF;

  -- 2. Obtener tienda_id actual del perfil
  SELECT tienda_id INTO v_profile_tienda_id
  FROM public.perfiles
  WHERE id = v_user_id;

  -- Si ya tiene una tienda vinculada, retornar esa misma
  IF v_profile_tienda_id IS NOT NULL THEN
    RETURN v_profile_tienda_id;
  END IF;

  -- 3. Crear una nueva tienda de forma segura
  INSERT INTO public.tiendas (nombre, slug, subscription_level, currency)
  VALUES (
    v_nombre,
    'tienda-' || substring(gen_random_uuid()::text from 1 for 8),
    1,
    'mxn'
  )
  RETURNING id INTO v_tienda_id;

  -- 4. Deshabilitar temporalmente el trigger de seguridad de perfiles para permitir el cambio de rol
  ALTER TABLE public.perfiles DISABLE TRIGGER trigger_prevent_profile_role_hijack;

  -- 5. Actualizar el perfil del usuario para asociar la tienda y cambiar el rol a 'dueño'
  UPDATE public.perfiles
  SET tienda_id = v_tienda_id,
      rol = 'dueño'
  WHERE id = v_user_id;

  -- Re-habilitar el trigger
  ALTER TABLE public.perfiles ENABLE TRIGGER trigger_prevent_profile_role_hijack;

  RETURN v_tienda_id;

EXCEPTION WHEN OTHERS THEN
  -- Asegurarse de re-habilitar el trigger si algo sale mal
  BEGIN
    ALTER TABLE public.perfiles ENABLE TRIGGER trigger_prevent_profile_role_hijack;
  EXCEPTION WHEN OTHERS THEN
    -- Ignorar si no estaba deshabilitado
  END;
  RAISE;
END;
$$;
