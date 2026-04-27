// ─── usePublicCatalog.js ────────────────────────────────────────
// Custom Hook para el catálogo público de una tienda Multi-tenant.
//
// Flujo:
// 1. Recibe el `slug` de la tienda (ej. 'flores-del-corazon')
// 2. Consulta la tabla `tiendas` para resolver slug → tienda_id
// 3. Consulta la tabla `productos` filtrando por ese tienda_id
// 4. Opcionalmente filtra por categoría
// 5. Si Supabase falla, hace fallback a datos locales (floreria.js)
//
// Ambas consultas operan con el rol `anon` de Supabase, protegidas
// por las políticas RLS que solo exponen productos con disponible=true.
// ────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { productos as productosLocales } from '../data/floreria';

/**
 * Transforma una fila de la tabla `productos` de Supabase
 * al formato que esperan los componentes React existentes
 * (ProductoCard, Modal, CartContext).
 *
 * Ajusta los nombres de campo según TU esquema real en Supabase.
 * Si tus columnas se llaman diferente, modifica SOLO esta función.
 */
function mapRow(row) {
  return {
    id:         row.slug ?? row.id,
    name:       row.nombre ?? row.name,
    short:      row.descripcion_corta ?? row.short ?? '',
    precio:     row.precio_label ?? row.precio ?? '',
    precioNum:  parseFloat(row.precio_num ?? row.precio ?? 0),
    disponible: row.disponible ?? true,
    badge:      row.badge ?? null,
    badgeClass: row.badge_class ?? '',
    imgUrl:     row.imagen_url ?? row.image_url ?? '',
    desc:       row.descripcion ?? row.description ?? '',
    waMsg:      row.wa_mensaje ?? row.wa_message ?? '',
    category:   row.categoria ?? row.category ?? 'general',
  };
}

/**
 * Hook público para consumir el catálogo de una tienda.
 *
 * @param {string} slug - Slug de la tienda (ej. 'flores-del-corazon')
 * @param {Object} [options]
 * @param {string} [options.category] - Filtrar por categoría (ej. 'rosas')
 *
 * @returns {{
 *   productos: Array,
 *   tienda: Object|null,
 *   loading: boolean,
 *   error: string|null,
 *   source: 'supabase'|'local',
 *   refetch: Function
 * }}
 */
export function usePublicCatalog(slug, options = {}) {
  const { category } = options;

  const [productos, setProductos] = useState([]);
  const [tienda, setTienda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('local');

  const fetchCatalog = useCallback(async () => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    try {
      // ── Paso 1: Resolver slug → tienda ────────────────────
      const { data: tiendaData, error: tiendaError } = await supabase
        .from('tiendas')
        .select('*')
        .eq('slug', slug)
        .single();

      if (tiendaError) {
        throw new Error(
          `Tienda con slug "${slug}" no encontrada: ${tiendaError.message}`
        );
      }

      if (cancelled) return;
      setTienda(tiendaData);

      // ── Paso 2: Fetch productos de esa tienda ─────────────
      // RLS ya filtra `disponible = true` a nivel de base de datos,
      // pero aplicamos el filtro aquí también como defensa en profundidad.
      let query = supabase
        .from('productos')
        .select('*')
        .eq('tienda_id', tiendaData.id)
        .eq('disponible', true)
        .order('sort_order', { ascending: true });

      // Filtro opcional por categoría
      if (category) {
        query = query.eq('categoria', category);
      }

      const { data: productosData, error: productosError } = await query;

      if (productosError) {
        throw new Error(
          `Error al cargar productos: ${productosError.message}`
        );
      }

      if (cancelled) return;

      if (productosData && productosData.length > 0) {
        setProductos(productosData.map(mapRow));
        setSource('supabase');
      } else {
        // Tabla vacía para esta tienda — usar fallback
        console.warn(
          `⚠️ [usePublicCatalog] Sin productos en Supabase para "${slug}". Usando datos locales.`
        );
        setProductos(productosLocales);
        setSource('local');
      }
    } catch (err) {
      if (!cancelled) {
        console.warn(
          `⚠️ [usePublicCatalog] Fallback a datos locales. Razón: ${err.message}`
        );
        setProductos(productosLocales);
        setSource('local');
        setError(err.message);
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [slug, category]);

  useEffect(() => {
    const cleanup = fetchCatalog();
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [fetchCatalog]);

  return { productos, tienda, loading, error, source, refetch: fetchCatalog };
}
