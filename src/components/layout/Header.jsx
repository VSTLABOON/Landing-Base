import { useState, useEffect } from 'react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      style={{ top: 'var(--cd-height, 0px)' }}
      className={`fixed left-0 right-0 z-[900] transition-all duration-400 ease-out border-b
        ${isScrolled 
          ? 'bg-negro/[.88] backdrop-blur-[18px] border-white/[.06]' 
          : 'bg-transparent border-transparent'
        }
      `}
    >
      <div className="max-w-[1200px] mx-auto flex items-center gap-8 py-[1.1rem] px-6">
        <a href="#hero" className="flex items-baseline gap-[0.4rem] mr-auto" aria-label="Inicio">
          <span className="font-display text-[1.2rem] font-bold text-blanco">Flores</span>
          <span className="font-script text-[1.5rem] text-rosa leading-none">del Corazón</span>
        </a>
        
        <nav className="hidden md:flex gap-8" aria-label="Navegación principal">
          {['Catálogo', 'Servicios', 'Cobertura', 'Nosotros'].map((item) => (
            <a 
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-[0.8rem] tracking-[0.12em] uppercase text-white/[.55] hover:text-blanco transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </nav>

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex flex-col justify-center gap-[5px] w-[36px] h-[36px] p-[6px]" 
          aria-label="Abrir menú" 
          aria-expanded={isMenuOpen}
        >
          <span className={`block h-[1.5px] bg-crema rounded-[2px] transition-all duration-300 ${isMenuOpen ? 'translate-y-[6.5px] rotate-45' : ''}`}></span>
          <span className={`block h-[1.5px] bg-crema rounded-[2px] transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block h-[1.5px] bg-crema rounded-[2px] transition-all duration-300 ${isMenuOpen ? '-translate-y-[6.5px] -rotate-45' : ''}`}></span>
        </button>
      </div>

      <nav 
        className={`md:hidden flex flex-col bg-negro/[.97] backdrop-blur-[20px] border-t border-white/[.05] transition-all duration-400 ease-out overflow-hidden
          ${isMenuOpen ? 'max-h-[400px] py-2 pb-6' : 'max-h-0 py-0'}
        `}
        aria-label="Menú móvil" 
        aria-hidden={!isMenuOpen}
      >
        {['Catálogo', 'Servicios', 'Cobertura', 'Nosotros'].map((item) => (
          <a 
            key={item}
            href={`#${item.toLowerCase()}`}
            onClick={() => setIsMenuOpen(false)}
            className="py-[0.85rem] px-6 text-[0.9rem] tracking-[0.06em] text-white/[.65] hover:text-white hover:bg-white/[.04] transition-colors duration-200"
          >
            {item}
          </a>
        ))}
      </nav>
    </header>
  );
}
