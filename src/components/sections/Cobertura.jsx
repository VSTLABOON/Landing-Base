import { meta } from '../../data/floreria';

export default function Cobertura() {
  const colonias = meta.colonias || [`${meta.ciudad} Centro`, 'Zona Norte', 'Zona Sur', 'Zona Este', 'Zona Oeste'];

  return (
    <section id="cobertura" className="bg-crema pt-[7rem] px-6 pb-[7rem]">
      <div className="max-w-[1180px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        <div className="flex flex-col">
          <p className="inline-flex items-center gap-[0.45rem] text-[0.65rem] tracking-[0.28em] uppercase text-verde font-body font-medium mb-[0.9rem]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="11" height="11" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            Zona de cobertura
          </p>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] font-bold text-texto mb-6">
            Llegamos <em className="italic text-rosa not-italic">a tu puerta</em>
          </h2>
          <p className="text-[0.9rem] leading-[1.75] text-texto-muted mb-[1.6rem]">
            Costo de envío <strong>$50 MXN</strong> en toda la zona metropolitana.<br/>
            Pedidos express en menos de 3 horas.
          </p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {colonias.map(c => (
              <span key={c} className="bg-verde/10 text-verde border border-verde/20 px-3 py-1.5 rounded-full text-[0.75rem] tracking-[0.04em] font-body transition-colors hover:bg-verde/20">
                {c}
              </span>
            ))}
          </div>
          
          <p className="text-[0.78rem] mt-4 text-texto-muted/70">
            ¿Tu colonia no aparece? Consúltanos por WhatsApp.
          </p>
        </div>
        
        <div className="rounded-[18px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.12)] h-[400px] border border-black/5 bg-crema-dark">
          <iframe 
            src={meta.mapaUrl}
            width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`Mapa área de cobertura ${meta.ciudad}`}>
          </iframe>
        </div>
      </div>
    </section>
  );
}
