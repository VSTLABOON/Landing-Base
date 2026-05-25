-- ═══════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Control de límites SaaS de Nivel Básico (Nivel 1)
-- ═══════════════════════════════════════════════════════════════════
-- Añade validaciones backend estrictas mediante triggers para evitar
-- saltarse las restricciones de catálogo (40 productos, 3 variantes)
-- y de secciones (10 elementos en config_ui) de Nivel 1.
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. TRIGGER PARA LÍMITE DE 40 PRODUCTOS ────────────────────────
CREATE OR REPLACE FUNCTION public.check_product_limits()
RETURNS TRIGGER AS $$
DECLARE
  v_subscription_level INTEGER;
  v_product_count INTEGER;
BEGIN
  -- Obtener el nivel de suscripción de la tienda
  SELECT subscription_level INTO v_subscription_level
  FROM public.tiendas
  WHERE id = NEW.tienda_id;

  -- Si es Nivel 1 (Básico), verificar límites
  IF v_subscription_level = 1 THEN
    -- Contar productos existentes para esta tienda
    SELECT COUNT(*) INTO v_product_count
    FROM public.productos
    WHERE tienda_id = NEW.tienda_id;

    IF v_product_count >= 40 THEN
      RAISE EXCEPTION 'Límite de productos excedido. El Nivel Básico permite un máximo de 40 productos.'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_product_limits ON public.productos;
CREATE TRIGGER trg_check_product_limits
BEFORE INSERT ON public.productos
FOR EACH ROW
EXECUTE FUNCTION public.check_product_limits();


-- ── 2. TRIGGER PARA LÍMITE DE 3 VARIANTES POR PRODUCTO ────────────
CREATE OR REPLACE FUNCTION public.check_variant_limits()
RETURNS TRIGGER AS $$
DECLARE
  v_subscription_level INTEGER;
  v_variant_count INTEGER;
  v_tienda_id UUID;
BEGIN
  -- Obtener tienda_id desde el producto
  SELECT tienda_id INTO v_tienda_id
  FROM public.productos
  WHERE id = NEW.producto_id;

  -- Obtener el nivel de suscripción de la tienda
  SELECT subscription_level INTO v_subscription_level
  FROM public.tiendas
  WHERE id = v_tienda_id;

  -- Si es Nivel 1 (Básico), verificar límites
  IF v_subscription_level = 1 THEN
    SELECT COUNT(*) INTO v_variant_count
    FROM public.producto_variantes
    WHERE producto_id = NEW.producto_id;

    IF v_variant_count >= 3 THEN
      RAISE EXCEPTION 'Límite de variantes excedido. El Nivel Básico permite un máximo de 3 variantes por producto.'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_variant_limits ON public.producto_variantes;
CREATE TRIGGER trg_check_variant_limits
BEFORE INSERT ON public.producto_variantes
FOR EACH ROW
EXECUTE FUNCTION public.check_variant_limits();


-- ── 3. TRIGGER PARA LÍMITE DE 10 ELEMENTOS POR SECCIÓN (JSONB) ────
-- ═══════════════════════════════════════════════════════════════════
-- NOTA DE MANTENIMIENTO: Este trigger valida que si la tienda está en
-- Nivel 1 (Básico), no supere los límites de elementos en config_ui.
-- Si en el futuro se modifican las claves JSONB usadas por la UI,
-- este trigger debe ser actualizado de forma sincronizada.
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.check_tienda_config_limits()
RETURNS TRIGGER AS $$
DECLARE
  v_servicios_len INTEGER;
  v_beneficios_len INTEGER;
  v_testimonios_len INTEGER;
  v_flores_len INTEGER;
  v_galeria_len INTEGER;
  v_item RECORD;
  v_nested_len INTEGER;
BEGIN
  -- Bloquear modificación de campos críticos de facturación/suscripción por parte del cliente
  IF TG_OP = 'UPDATE' AND (
    OLD.subscription_level IS DISTINCT FROM NEW.subscription_level OR
    OLD.stripe_customer_id IS DISTINCT FROM NEW.stripe_customer_id OR
    OLD.stripe_subscription_id IS DISTINCT FROM NEW.stripe_subscription_id OR
    OLD.stripe_account_id IS DISTINCT FROM NEW.stripe_account_id OR
    OLD.stripe_connect_id IS DISTINCT FROM NEW.stripe_connect_id
  ) THEN
    -- Si la petición viene de un usuario logueado en la API del cliente (auth.uid() no es nulo)
    IF auth.uid() IS NOT NULL THEN
      -- Y ese usuario no es un superadmin registrado
      IF NOT EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE id = auth.uid() AND rol = 'superadmin'
      ) THEN
        RAISE EXCEPTION 'No tienes permiso para modificar el nivel de suscripción ni datos críticos de pasarela.'
          USING ERRCODE = 'insufficient_privilege';
      END IF;
    END IF;
  END IF;

  -- Si es Nivel 1 (Básico), verificar límites en config_ui
  IF NEW.subscription_level = 1 THEN
    -- Guardas de tipo seguras para evitar excepciones si las claves no existen o no son arrays
    
    -- 1. Servicios
    IF jsonb_typeof(NEW.config_ui->'servicios') = 'array' THEN
      v_servicios_len := jsonb_array_length(NEW.config_ui->'servicios');
      IF v_servicios_len > 10 THEN
        RAISE EXCEPTION 'El Nivel Básico permite un máximo de 10 servicios.' USING ERRCODE = 'check_violation';
      END IF;

      -- Verificar carrusel de catálogo anidado de cada servicio
      FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.config_ui->'servicios') LOOP
        IF jsonb_typeof(v_item.value->'catalog') = 'array' THEN
          v_nested_len := jsonb_array_length(v_item.value->'catalog');
          IF v_nested_len > 10 THEN
            RAISE EXCEPTION 'El carrusel de catálogo anidado de servicios permite un máximo de 10 elementos.' USING ERRCODE = 'check_violation';
          END IF;
        END IF;
      END LOOP;
    END IF;

    -- 2. Beneficios
    IF jsonb_typeof(NEW.config_ui->'beneficios') = 'array' THEN
      v_beneficios_len := jsonb_array_length(NEW.config_ui->'beneficios');
      IF v_beneficios_len > 10 THEN
        RAISE EXCEPTION 'El Nivel Básico permite un máximo de 10 beneficios.' USING ERRCODE = 'check_violation';
      END IF;
    END IF;

    -- 3. Testimonios
    IF jsonb_typeof(NEW.config_ui->'testimonios') = 'array' THEN
      v_testimonios_len := jsonb_array_length(NEW.config_ui->'testimonios');
      IF v_testimonios_len > 10 THEN
        RAISE EXCEPTION 'El Nivel Básico permite un máximo de 10 testimonios.' USING ERRCODE = 'check_violation';
      END IF;
    END IF;

    -- 4. Flores (catálogo rápido)
    IF jsonb_typeof(NEW.config_ui->'flores') = 'array' THEN
      v_flores_len := jsonb_array_length(NEW.config_ui->'flores');
      IF v_flores_len > 10 THEN
        RAISE EXCEPTION 'El Nivel Básico permite un máximo de 10 flores en el catálogo rápido.' USING ERRCODE = 'check_violation';
      END IF;
    END IF;

    -- 5. Galería
    IF jsonb_typeof(NEW.config_ui->'galeria') = 'array' THEN
      v_galeria_len := jsonb_array_length(NEW.config_ui->'galeria');
      IF v_galeria_len > 10 THEN
        RAISE EXCEPTION 'El Nivel Básico permite un máximo de 10 imágenes en la galería.' USING ERRCODE = 'check_violation';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_tienda_config_limits ON public.tiendas;
CREATE TRIGGER trg_check_tienda_config_limits
BEFORE INSERT OR UPDATE ON public.tiendas
FOR EACH ROW
EXECUTE FUNCTION public.check_tienda_config_limits();
