import { nosotros } from '../../data/floreria';

export default function Nosotros() {
  return (
    <section id="nosotros" className="bg-negro pt-[8rem] px-6 pb-[8rem]">
      <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-[140px_1fr] gap-10 md:gap-20 items-start">
        
        <div className="hidden md:flex relative items-center justify-center pt-4">
          <div className="absolute rounded-full border border-verde/30 w-[120px] h-[120px] animate-[spin_18s_linear_infinite]" />
          <div className="absolute rounded-full border border-rosa/20 w-[90px] h-[90px] animate-[spin_12s_linear_infinite_reverse]" />
          <svg className="w-12 h-12 text-verde-light/40 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="3"/><path d="M12 2c-1.5 0-2.8.7-3.6 1.8A3 3 0 0 0 4.2 8C2.7 8.8 2 10.3 2 12c0 1.5.7 2.8 1.8 3.6a3 3 0 0 0 4.2 4.2C8.8 21.3 10.3 22 12 22c1.5 0 2.8-.7 3.6-1.8a3 3 0 0 0 4.2-4.2c1.1-1 1.8-2.5 1.8-4.2 0-1.5-.7-2.8-1.8-3.6a3 3 0 0 0-4.2-4.2C14.8 2.7 13.5 2 12 2z"/></svg>
        </div>

        <div className="flex flex-col">
          <p className="inline-flex items-center gap-[0.45rem] text-[0.65rem] tracking-[0.28em] uppercase text-verde-light font-body font-medium mb-[0.9rem]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="11" height="11" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Sobre nosotros
          </p>
          <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] font-bold text-white mb-6">
            8 años llevando <em className="italic text-verde-light not-italic">felicidad a {meta.ciudad}</em>
          </h2>
          
          <div className="mt-2 flex flex-col gap-4">
            {nosotros.texto.split('\n\n').map((p, idx) => (
              <p key={idx} className="text-[0.92rem] text-white/60 leading-[1.85] font-light">
                {p}
              </p>
            ))}
          </div>
          
          <div className="font-script text-[2rem] text-verde-light mt-8 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="var(--color-rosa)" stroke="none" width="18" height="18" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            {nosotros.firma}
          </div>
        </div>

      </div>
    </section>
  );
}
