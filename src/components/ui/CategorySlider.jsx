import { useRef, useState, useEffect, useCallback } from 'react';
import { meta } from '../../data/floreria';

/**
 * CategorySlider — Carrusel horizontal tipo app nativa.
 *
 * Recibe un array de productos filtrados por categoría y los muestra
 * en un contenedor de scroll horizontal con snap points.
 *
 * Props:
 * @param {Array}   items      - Productos de la categoría ({ name, priceRange, img })
 * @param {boolean} isOpen     - Controla la expansión/colapso
 * @param {string}  categoryTitle - Nombre de la categoría para el heading
 * @param {string}  id         - ID único para aria-controls
 */
export default function CategorySlider({ items, isOpen, categoryTitle, id }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // ── Detectar posición de scroll para habilitar/deshabilitar flechas ──
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);

    // Calcular índice activo basado en snap point
    const cardWidth = el.firstElementChild?.offsetWidth || 280;
    const gap = 24; // gap-6 = 1.5rem = 24px
    setActiveIndex(Math.round(scrollLeft / (cardWidth + gap)));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isOpen) return;

    // Resetear scroll al abrir
    el.scrollLeft = 0;
    // Pequeño delay para que el DOM termine de expandir
    const timer = setTimeout(checkScroll, 100);
    
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [isOpen, checkScroll]);

  // ── Scroll programático con las flechas ──
  const scrollBy = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.offsetWidth || 280;
    const gap = 24;
    el.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: 'smooth'
    });
  };

  // ── Generar enlace de WhatsApp para cotizar ──
  const handleCotizar = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const msg = encodeURIComponent(
      `Hola! 🌸 Me interesa cotizar *${item.name}* (${item.priceRange}) de la categoría "${categoryTitle}". ¿Tienen disponibilidad?`
    );
    window.open(`${meta.waBase}?text=${msg}`, '_blank', 'noopener');
  };

  return (
    <div
      id={id}
      className={`grid transition-[grid-template-rows,opacity] duration-500 ease-spring ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      <div className="overflow-hidden">
        <div className="px-8 md:px-10 pt-8 pb-10 border-t border-white/5 bg-negro/50">
          
          {/* Header con flechas de navegación */}
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-white/90 font-display text-[1.2rem] md:text-[1.4rem] font-bold flex items-center gap-3">
              Catálogo de {categoryTitle}
              <span className="hidden sm:block h-[1px] w-16 bg-white/10"></span>
              <span className="text-[0.7rem] font-body font-normal text-white/30 tracking-[0.1em] uppercase hidden sm:inline">
                {items.length} arreglo{items.length !== 1 ? 's' : ''}
              </span>
            </h4>

            {/* Flechas (solo si hay overflow) */}
            {items.length > 2 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollBy(-1)}
                  disabled={!canScrollLeft}
                  aria-label="Anterior"
                  className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60 transition-all duration-200 hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-white/5"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button
                  type="button"
                  onClick={() => scrollBy(1)}
                  disabled={!canScrollRight}
                  aria-label="Siguiente"
                  className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60 transition-all duration-200 hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-white/5"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
            )}
          </div>

          {/* ── Carrusel Horizontal ── */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4 -mx-2 px-2"
            role="list"
            aria-label={`Arreglos de ${categoryTitle}`}
          >
            {items.map((item, idx) => (
              <div
                key={idx}
                role="listitem"
                className="group/card snap-start shrink-0 w-[260px] sm:w-[280px] md:w-[300px] flex flex-col cursor-pointer"
              >
                {/* Imagen */}
                <div className="relative w-full aspect-[3/4] rounded-[16px] overflow-hidden mb-4 bg-verde-dark shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-shadow duration-300 group-hover/card:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                  <img
                    src={item.img}
                    alt={item.name}
                    loading="lazy"
                    draggable="false"
                    className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover/card:scale-110 select-none"
                  />
                  {/* Gradient overlay bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

                  {/* Hover CTA */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300">
                    <button
                      type="button"
                      onClick={(e) => handleCotizar(e, item)}
                      className="bg-rosa hover:bg-rosa-light text-white text-[0.72rem] font-bold uppercase tracking-[0.12em] px-6 py-2.5 rounded-full transform translate-y-6 group-hover/card:translate-y-0 transition-all duration-400 ease-spring shadow-[0_4px_16px_rgba(217,79,110,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <span className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        Cotizar
                      </span>
                    </button>
                  </div>

                  {/* Price badge */}
                  <div className="absolute top-4 right-4 bg-negro/70 backdrop-blur-sm text-verde-light text-[0.7rem] font-bold tracking-[0.06em] px-3 py-1 rounded-full border border-white/10">
                    {item.priceRange}
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col px-1">
                  <span className="text-white font-semibold text-[1rem] leading-tight mb-1 group-hover/card:text-rosa transition-colors duration-200">
                    {item.name}
                  </span>
                  <span className="text-white/40 text-[0.75rem] tracking-[0.04em]">
                    {categoryTitle}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Dot Indicators ── */}
          {items.length > 2 && (
            <div className="flex items-center justify-center gap-1.5 mt-4" aria-hidden="true">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const el = scrollRef.current;
                    if (!el) return;
                    const cardWidth = el.firstElementChild?.offsetWidth || 280;
                    el.scrollTo({ left: idx * (cardWidth + 24), behavior: 'smooth' });
                  }}
                  className={`rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? 'w-6 h-2 bg-rosa'
                      : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Ir a arreglo ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
