import { meta } from '../../data/floreria';

export default function Footer() {
  return (
    <footer id="footer" className="bg-negro-soft border-t border-white/[.04]">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-8 sm:gap-16 pt-16 px-6 pb-12">
        
        <div className="flex flex-col gap-[0.3rem]">
          <div className="flex items-baseline gap-[0.4rem]">
            <span className="font-display text-[1.6rem] font-bold text-white/[.8]">Flores</span>
            <span className="font-script text-[2rem] text-rosa leading-none">del Corazón</span>
          </div>
          <p className="text-[0.7rem] tracking-[0.15em] uppercase text-white/[.25] mt-[0.6rem]">
            Flores frescas · {meta.ciudad} · Desde 2016
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div className="flex flex-col">
            <h4 className="text-[0.64rem] tracking-[0.2em] uppercase text-white/[.25] mb-[0.9rem]">Horario</h4>
            <p className="text-[0.82rem] text-white/[.45] leading-[1.9] block transition-colors duration-200">Lunes a Domingo</p>
            <p className="text-[0.82rem] text-white/[.45] leading-[1.9] block transition-colors duration-200">8:00 AM – 8:00 PM</p>
            <p className="text-[0.78rem] text-rosa-light mt-[0.3rem] leading-[1.9] block transition-colors duration-200">10 de mayo: 7 AM – 9 PM</p>
          </div>

          <div className="flex flex-col">
            <h4 className="text-[0.64rem] tracking-[0.2em] uppercase text-white/[.25] mb-[0.9rem]">Contacto</h4>
            <a href="#" className="text-[0.82rem] text-white/[.45] hover:text-rosa-light leading-[1.9] block transition-colors duration-200" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href="https://instagram.com/floresdel-corazon" className="text-[0.82rem] text-white/[.45] hover:text-rosa-light leading-[1.9] block transition-colors duration-200" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://facebook.com/floresdel-corazon" className="text-[0.82rem] text-white/[.45] hover:text-rosa-light leading-[1.9] block transition-colors duration-200" target="_blank" rel="noopener noreferrer">Facebook</a>
          </div>

          <div className="flex flex-col">
            <h4 className="text-[0.64rem] tracking-[0.2em] uppercase text-white/[.25] mb-[0.9rem]">Navegación</h4>
            <a href="#catalogo" className="text-[0.82rem] text-white/[.45] hover:text-rosa-light leading-[1.9] block transition-colors duration-200">Catálogo</a>
            <a href="#servicios" className="text-[0.82rem] text-white/[.45] hover:text-rosa-light leading-[1.9] block transition-colors duration-200">Servicios</a>
            <a href="#cobertura" className="text-[0.82rem] text-white/[.45] hover:text-rosa-light leading-[1.9] block transition-colors duration-200">Cobertura</a>
            <a href="#nosotros" className="text-[0.82rem] text-white/[.45] hover:text-rosa-light leading-[1.9] block transition-colors duration-200">Nosotros</a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[.04] py-4 px-6 flex items-center justify-between flex-wrap gap-2 text-[0.7rem] tracking-[0.08em] text-white/[.2]">
        <span>© 2025 {meta.nombre} · {meta.ciudad}, {meta.estado}</span>
        <a href="#" className="text-white/[.2] hover:text-white/[.45] transition-colors duration-200">Aviso de Privacidad</a>
      </div>
    </footer>
  );
}
