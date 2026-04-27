import { useEffect } from 'react';
import { meta } from '../../data/floreria';

export default function Modal({ isOpen, onClose, producto }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !producto) return null;

  const waHref = `${meta.waBase}?text=${encodeURIComponent(producto.waMsg)}`;
  const descParagraphs = producto.desc.split('\n\n').filter(p => p.trim());

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-[10px] z-[10000] transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title-text"
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(640px,calc(100vw-2rem))] max-h-[90svh] bg-blanco rounded-[20px] shadow-lg-custom z-[10001] flex flex-col overflow-hidden text-texto animate-fade-up max-sm:left-0 max-sm:top-auto max-sm:bottom-0 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:w-full max-sm:rounded-t-[20px] max-sm:rounded-b-none"
      >
        <button 
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-[0.9rem] right-[0.9rem] z-[1] w-[32px] h-[32px] rounded-full bg-black/5 hover:bg-black/10 hover:scale-110 flex items-center justify-center transition-all duration-200"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {producto.imgUrl && (
          <div className="relative shrink-0 h-[220px] bg-crema-dark overflow-hidden">
            <img 
              src={producto.imgUrl} 
              alt={producto.name} 
              loading="lazy" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute bottom-[0.9rem] right-[0.9rem] bg-verde text-white font-display text-[1.3rem] font-bold py-[0.35rem] px-[0.9rem] rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
              {producto.precio}
            </div>
          </div>
        )}

        <div className="p-[1.6rem_1.8rem_2rem] overflow-y-auto overscroll-contain">
          <h2 id="modal-title-text" className="font-display text-[1.8rem] font-bold text-texto leading-[1.1] mb-[0.4rem]">
            {producto.name}
          </h2>
          
          <div className="w-[36px] h-[2px] bg-gradient-to-r from-verde to-rosa rounded-[2px] mb-[1rem]" />

          {descParagraphs.map((p, idx) => (
            <p key={idx} className="text-[0.88rem] leading-[1.8] text-texto-muted mb-[0.6rem]">
              {p.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < p.split('\n').length - 1 && <br />}
                </span>
              ))}
            </p>
          ))}

          <a 
            href={waHref}
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-[1.4rem] w-full p-[0.9rem] bg-[#25D366] hover:bg-[#1EBA57] text-white rounded-[12px] font-body text-[0.88rem] font-bold flex items-center justify-center gap-[0.7rem] transition-all duration-200 ease-spring hover:scale-[1.02]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Pedir este arreglo
          </a>
        </div>
      </div>
    </>
  );
}
