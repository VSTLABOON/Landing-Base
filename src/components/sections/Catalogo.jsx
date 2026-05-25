import { useState, useEffect, useMemo } from 'react';
import { usePublicCatalog } from '../../hooks/usePublicCatalog';
import { useTenant } from '../../context/TenantContext.tsx';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductoCard from '../ui/ProductoCard';
import { fadeUp, staggerContainer, getMotionVariants } from '../../lib/motion';

// ── Slug de la tienda actual ─────────────────────────────────────
// Ahora proviene dinámicamente del TenantContext en lugar de ser
// una constante hardcodeada.

const RANGES = {
  'all':     [0, Infinity],
  '300-500': [300, 500],
  '500-800': [500, 800],
  '800+':    [800, Infinity],
};

export default function Catalogo() {
  const { tenant } = useTenant();
  const { productos, loading, error, source } = usePublicCatalog(tenant.slug);
  const [filtroActivo, setFiltroActivo] = useState('all');
  const shouldReduceMotion = useReducedMotion();

  // Filtrado derivado del estado (no duplicamos el array en otro useState)
  const productosFiltrados = useMemo(() => {
    const [min, max] = RANGES[filtroActivo];
    if (filtroActivo === 'all') return productos;
    return productos.filter(p => p.precioNum >= min && p.precioNum <= max);
  }, [productos, filtroActivo]);

  return (
    <section id="catalogo" className="bg-crema pt-28 px-6 pb-24">
      <div className="text-center mb-[3.5rem]">
        <p className="inline-flex items-center gap-[0.45rem] text-[0.65rem] tracking-[0.28em] uppercase text-verde font-body font-medium mb-[0.9rem]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="11" height="11" aria-hidden="true">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2c-1.5 0-2.8.7-3.6 1.8A3 3 0 0 0 4.2 8C2.7 8.8 2 10.3 2 12c0 1.5.7 2.8 1.8 3.6a3 3 0 0 0 4.2 4.2C8.8 21.3 10.3 22 12 22c1.5 0 2.8-.7 3.6-1.8a3 3 0 0 0 4.2-4.2c1.1-1 1.8-2.5 1.8-4.2 0-1.5-.7-2.8-1.8-3.6a3 3 0 0 0-4.2-4.2C14.8 2.7 13.5 2 12 2z"/>
          </svg>
          Catálogo
        </p>
        <h2 className="font-display text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] tracking-[-0.02em] font-bold text-texto">
          Arreglos que <em className="italic text-rosa not-italic">hablan</em>
        </h2>
        <p className="text-[0.86rem] text-texto-muted tracking-[0.04em] mt-[0.6rem] font-light">
          Toca cualquier arreglo para ver detalles y pedir por WhatsApp
        </p>
      </div>



      {/* Filtros por presupuesto */}
      <div className="max-w-[1180px] mx-auto mb-10 flex items-center gap-4 flex-wrap" role="group" aria-label="Filtrar por presupuesto">
        <span className="text-[0.78rem] tracking-[0.08em] text-texto-muted font-medium whitespace-nowrap">
          ¿Cuánto quieres gastar?
        </span>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: 'Ver todo' },
            { key: '300-500', label: '$300 – $500' },
            { key: '500-800', label: '$500 – $800' },
            { key: '800+', label: '$800+' },
          ].map(btn => (
            <button
              key={btn.key}
              type="button"
              disabled={loading}
              onClick={() => setFiltroActivo(btn.key)}
              className={`py-[0.38rem] px-4 rounded-full border-[1.5px] font-body text-[0.78rem] transition-all duration-200 ease-spring disabled:opacity-40 disabled:cursor-not-allowed
                ${filtroActivo === btn.key 
                  ? 'bg-verde border-verde text-[var(--color-background-primary)] font-semibold scale-[1.04]' 
                  : 'border-verde/[.25] text-texto-muted hover:border-verde hover:text-verde'
                }
              `}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Estado de carga */}
      {loading ? (
        <div className="max-w-[1180px] mx-auto grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-blanco rounded-card overflow-hidden shadow-card animate-pulse">
              <div className="relative aspect-[4/3] bg-[var(--color-border-secondary)]"></div>
              <div className="p-[1.3rem_1.4rem_1.5rem]">
                <div className="h-[1.25rem] bg-[var(--color-border-secondary)] rounded w-3/4 mb-[0.4rem]"></div>
                <div className="h-[0.8rem] bg-[var(--color-border-secondary)] rounded w-full mb-[1rem]"></div>
                <div className="flex items-center justify-between gap-2">
                  <div className="h-[1.4rem] bg-[var(--color-border-secondary)] rounded w-1/3"></div>
                  <div className="h-[32px] w-[80px] bg-[var(--color-border-secondary)] rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : productosFiltrados.length > 0 ? (
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={getMotionVariants(staggerContainer, shouldReduceMotion)}
          className="max-w-[1180px] mx-auto grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6"
        >
          {productosFiltrados.map((prod, i) => (
            <motion.div 
              key={prod.id} 
              variants={getMotionVariants(fadeUp, shouldReduceMotion)}
            >
              <Link to={`/producto/${prod.slug}`} className="block h-full">
                <ProductoCard producto={prod} priority={i < 4} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className="text-center py-12 px-6 text-[0.9rem] text-texto-muted max-w-[500px] mx-auto">
          No hay arreglos en ese rango ahora mismo. <a href="#" className="text-verde underline">Consúltanos por WhatsApp</a> y encontramos algo para ti.
        </p>
      )}

    </section>
  );
}
