import { beneficios } from '../../data/floreria';

export default function Beneficios() {
  const iconMap = {
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    flower: <path d="M12 2c-1.5 0-2.8.7-3.6 1.8A3 3 0 0 0 4.2 8C2.7 8.8 2 10.3 2 12c0 1.5.7 2.8 1.8 3.6a3 3 0 0 0 4.2 4.2C8.8 21.3 10.3 22 12 22c1.5 0 2.8-.7 3.6-1.8a3 3 0 0 0 4.2-4.2c1.1-1 1.8-2.5 1.8-4.2 0-1.5-.7-2.8-1.8-3.6a3 3 0 0 0-4.2-4.2C14.8 2.7 13.5 2 12 2z"/>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  };

  return (
    <section id="beneficios" className="bg-negro py-28 px-6">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        <div className="relative animate-fade-up">
          <div className="relative rounded-[24px] overflow-hidden aspect-[4/5] bg-verde-dark">
            <img src="img/minecraft.jpeg" alt="Arreglo floral rosa" loading="lazy" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-6 -right-6 lg:-right-10 bg-white text-negro px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="w-12 h-12 rounded-full bg-rosa/20 flex items-center justify-center text-rosa">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-[1.2rem] leading-none mb-1">+2,000</span>
              <span className="text-[0.75rem] text-negro/60 font-medium uppercase tracking-[0.05em]">Entregas</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <p className="inline-flex items-center gap-2 text-[0.65rem] tracking-[0.28em] uppercase text-verde-light font-body font-medium mb-4 animate-fade-up">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="11" height="11" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Por qué elegirnos
          </p>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] font-bold text-white mb-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Lo que nos hace <em className="italic text-rosa not-italic">diferentes</em>
          </h2>
          
          <div className="flex flex-col gap-8">
            {beneficios.map((b, i) => (
              <div key={i} className="flex gap-5 animate-fade-up" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                <div className="w-12 h-12 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-verde-light">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
                    {iconMap[b.icon]}
                  </svg>
                </div>
                <div className="flex flex-col pt-1">
                  <h3 className="text-[1.05rem] font-bold text-white mb-2">{b.title}</h3>
                  <p className="text-[0.9rem] text-white/60 leading-[1.7] font-light">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
