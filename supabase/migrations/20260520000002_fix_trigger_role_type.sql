-- ═══════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Corregir tipo de dato de variable v_role en handle_new_user
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_tienda_id UUID;
  v_origin_tenant_id TEXT;
  v_nombre TEXT;
  v_role public.user_role; -- Corregido: tipo public.user_role en vez de TEXT para evitar error 42804
  v_existing_members_count INT;
BEGIN
  -- 1. Extraer metadata
  v_nombre := COALESCE(new.raw_user_meta_data->>'nombre_completo', 
                       new.raw_user_meta_data->>'full_name', 
                       'Usuario');
  
  -- Intentar obtener el tenant de origen desde los query params de OAuth
  v_origin_tenant_id := new.raw_user_meta_data->>'origin_tenant_id';

  -- 2. Lógica de asignación
  IF v_origin_tenant_id IS NOT NULL AND v_origin_tenant_id <> '' THEN
    -- El usuario viene de una landing específica
    v_tienda_id := v_origin_tenant_id::UUID;
    
    -- Verificar si ya hay un dueño para esta tienda
    SELECT count(*) INTO v_existing_members_count 
    FROM public.perfiles 
    WHERE tienda_id = v_tienda_id;

    -- Si es el primer usuario, lo hacemos dueño (probablemente el creador)
    -- Si no, es un cliente normal.
    IF v_existing_members_count = 0 THEN
      v_role := 'dueño';
    ELSE
      v_role := 'cliente';
    END IF;

  ELSE
    -- El usuario NO viene de una landing (signup directo en la plataforma)
    -- En Fase 4, aquí podríamos crear una tienda de prueba o dejarlo sin tienda
    -- Por ahora, para no romper el flujo de desarrollo, creamos una tienda nueva.
    INSERT INTO public.tiendas (nombre, slug, subscription_level, currency)
    VALUES (
      'Mi Nueva Florería',
      'tienda-' || substring(gen_random_uuid()::text from 1 for 8),
      1,
      'mxn'
    )
    RETURNING id INTO v_tienda_id;
    
    v_role := 'dueño';
  END IF;

  -- 3. Crear el perfil vinculado
  INSERT INTO public.perfiles (id, tienda_id, rol, nombre_completo)
  VALUES (new.id, v_tienda_id, v_role, v_nombre);

  RETURN new;

EXCEPTION WHEN OTHERS THEN
  -- Fallback de seguridad: crear perfil como cliente sin tienda para no bloquear el Auth
  BEGIN
    INSERT INTO public.perfiles (id, rol, nombre_completo)
    VALUES (new.id, 'cliente', v_nombre);
  EXCEPTION WHEN OTHERS THEN
    -- Ignorar si falla el perfil, lo importante es no bloquear el registro
  END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
