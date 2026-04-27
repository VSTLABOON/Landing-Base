import { testimonios } from '../../data/floreria';

export default function Testimonios() {
  return (
    <section id="testimonios" className="bg-negro-soft pt-28 px-6 pb-24">
      <div className="text-center mb-16 animate-fade-up">
        <p className="inline-flex items-center gap-2 text-[0.65rem] tracking-[0.28em] uppercase text-rosa-light font-body font-medium mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="11" height="11" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          Testimonios
        </p>
        <h2 className="font-display text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] tracking-[-0.02em] font-bold text-white">
          Flores que <em className="italic text-rosa not-italic">dejan huella</em>
        </h2>
      </div>

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonios.map((t, i) => (
          <div key={i} className="bg-negro p-8 rounded-[16px] border border-white/5 transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex gap-1 text-dorado mb-6">
              {[...Array(t.estrellas)].map((_, j) => (
                <svg key={j} viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              ))}
            </div>
            <p className="text-[0.95rem] text-white/80 leading-[1.7] mb-8 font-light">"{t.cita}"</p>
            <div className="flex items-center gap-4 mt-auto">
              <div className="w-10 h-10 rounded-full bg-verde flex items-center justify-center text-white font-display font-bold text-[1.1rem]">
                {t.inicial}
              </div>
              <div className="flex flex-col">
                <strong className="text-[0.9rem] text-white font-medium">{t.nombre}</strong>
                <span className="text-[0.7rem] text-white/40 tracking-[0.04em]">{t.ubicacion}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
