import { useState } from 'react';
import CategorySlider from '../ui/CategorySlider';

// ── Data de servicios con sub-catálogos ─────────────────────────
// En una futura fase, esto vendría del hook usePublicCatalog
// filtrando por la categoría de cada servicio.
const SERVICES_DATA = [
  {
    id: 'fechas',
    title: 'Fechas Especiales',
    desc: 'Aniversarios, cumpleaños y el Día de las Madres. Diseños florales exclusivos que dejan una huella imborrable en esa persona especial.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    imgUrl: 'https://images.unsplash.com/photo-1582791618318-7f41e54a360d?auto=format&fit=crop&q=80&w=800',
    catalog: [
      { name: 'Ramos Buchones', priceRange: 'Desde $950', img: 'https://images.unsplash.com/photo-1591016254581-2292fa1f7a08?auto=format&fit=crop&q=80&w=400' },
      { name: 'Cajas Premium', priceRange: 'Desde $800', img: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=400' },
      { name: 'Girasoles y Rosas', priceRange: 'Desde $650', img: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&q=80&w=400' },
      { name: 'Arreglo Imperial', priceRange: 'Desde $1,100', img: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=400' },
    ]
  },
  {
    id: 'bodas',
    title: 'Bodas y Eventos',
    desc: 'Decoración floral completa para el día más importante de tu vida. Diseñamos con atención al mínimo detalle para crear atmósferas mágicas.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    imgUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800',
    catalog: [
      { name: 'Ramos de Novia', priceRange: 'Desde $1,200', img: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=400' },
      { name: 'Centros de Mesa', priceRange: 'Desde $450', img: 'https://images.unsplash.com/photo-1528650772276-8800927dfa60?auto=format&fit=crop&q=80&w=400' },
      { name: 'Arcos Florales', priceRange: 'Desde $3,500', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400' },
      { name: 'Iglesia Completa', priceRange: 'Desde $5,000', img: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=400' },
    ]
  },
  {
    id: 'condolencias',
    title: 'Condolencias y Homenajes',
    desc: 'Expresa tus respetos y acompaña a los tuyos con elegancia y solemnidad. Entregas puntuales y garantizadas en funerarias o domicilios.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    imgUrl: 'https://images.unsplash.com/photo-1600810166299-a1b73cb3773a?auto=format&fit=crop&q=80&w=800',
    catalog: [
      { name: 'Coronas Fúnebres', priceRange: 'Desde $1,800', img: 'https://images.unsplash.com/photo-1572620573934-8b9a2dfd64e9?auto=format&fit=crop&q=80&w=400' },
      { name: 'Arreglos de Cruz', priceRange: 'Desde $1,500', img: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=400' },
      { name: 'Cubre Cajas', priceRange: 'Desde $2,200', img: 'https://images.unsplash.com/photo-1542360562-5b927e6992d9?auto=format&fit=crop&q=80&w=400' },
    ]
  }
];

export default function Servicios() {
  const [openCatalogId, setOpenCatalogId] = useState(null);

  const toggleCatalog = (e, id) => {
    e.preventDefault();
    setOpenCatalogId(prev => prev === id ? null : id);
  };

  return (
    <section id="servicios" className="bg-negro-soft pt-[7rem] px-6 pb-[6rem]">
      <div className="text-center mb-16 animate-fade-up">
        <p className="inline-flex items-center gap-2 text-[0.65rem] tracking-[0.28em] uppercase text-verde-light font-body font-medium mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="11" height="11" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Ocasiones especiales
        </p>
        <h2 className="font-display text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] font-bold text-white mb-2">
          Flores para <em className="italic text-rosa-light not-italic">cada momento</em>
        </h2>
      </div>

      <div className="max-w-[1100px] mx-auto flex flex-col gap-8">
        {SERVICES_DATA.map((serv, i) => {
          const isOpen = openCatalogId === serv.id;
          
          return (
            <div 
              key={serv.id} 
              className="group flex flex-col bg-negro border border-white/5 rounded-[20px] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:border-white/10 animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* ── Tarjeta Principal ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 min-h-auto md:min-h-[400px]">
                
                {/* Imagen (Alternada en desktop) */}
                <div className={`relative overflow-hidden bg-verde-dark h-[260px] md:h-auto ${i % 2 !== 0 ? 'md:order-2' : ''}`}>
                  <img 
                    src={serv.imgUrl} 
                    alt={serv.title} 
                    loading="lazy" 
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-negro-soft/60 to-transparent mix-blend-multiply" />
                </div>
                
                {/* Contenido */}
                <div className={`p-8 md:p-12 lg:p-16 flex flex-col justify-center transition-colors duration-500 group-hover:bg-verde/5 ${i % 2 !== 0 ? 'md:order-1' : ''}`}>
                  <div className="w-12 h-12 text-rosa mb-6 shrink-0 transition-transform duration-300 group-hover:scale-110">
                    {serv.icon}
                  </div>
                  
                  <h3 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-bold text-white leading-[1.1] mb-4">
                    {serv.title}
                  </h3>
                  
                  <p className="text-[0.95rem] text-white/60 leading-[1.7] mb-8 font-light">
                    {serv.desc}
                  </p>

                  {/* Contador de arreglos + Botón */}
                  <div className="flex items-center gap-4">
                    <button 
                      type="button"
                      onClick={(e) => toggleCatalog(e, serv.id)}
                      className="group/btn inline-flex items-center gap-3 text-[0.8rem] tracking-[0.15em] uppercase font-bold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rosa rounded-md px-2 py-1 -ml-2
                        ${isOpen ? 'text-rosa' : 'text-verde-light hover:text-rosa'}"
                      aria-expanded={isOpen}
                      aria-controls={`slider-${serv.id}`}
                    >
                      {isOpen ? 'Ocultar' : 'Ver arreglos'}
                      <svg 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        width="16" 
                        height="16" 
                        className={`transition-transform duration-500 ease-spring ${isOpen ? 'rotate-180' : 'group-hover/btn:translate-y-0.5'}`}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>

                    <span className="text-[0.7rem] text-white/25 tracking-[0.06em] font-medium">
                      {serv.catalog.length} opciones
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Carrusel Horizontal (Reemplaza el acordeón vertical) ── */}
              <CategorySlider
                id={`slider-${serv.id}`}
                items={serv.catalog}
                isOpen={isOpen}
                categoryTitle={serv.title}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
