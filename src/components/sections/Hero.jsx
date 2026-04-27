import { useState, useEffect, useRef } from 'react';
import { meta } from '../../data/floreria';

const SHAPES = [
  c => <svg viewBox="0 0 24 24" fill={c} stroke="none" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  c => <svg viewBox="0 0 20 28" fill={c} stroke="none" aria-hidden="true"><ellipse cx="10" cy="14" rx="7" ry="12" transform="rotate(-15 10 14)"/></svg>,
  c => <svg viewBox="0 0 20 24" fill={c} stroke="none" aria-hidden="true"><path d="M10 2C4 2 2 8 2 13C2 19 6 22 10 22C14 22 18 19 18 13C18 8 16 2 10 2Z"/></svg>
];
const COLS = ['rgba(240,160,180,.7)','rgba(255,255,255,.5)','rgba(217,79,110,.55)','rgba(196,154,60,.4)'];

function Petals() {
  const [petals, setPetals] = useState([]);

  useEffect(() => {
    const newPetals = Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      sz: Math.random() * 13 + 6,
      dur: Math.random() * 7 + 5,
      delay: -(Math.random() * 12),
      col: COLS[Math.floor(Math.random() * COLS.length)],
      sh: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      left: Math.random() * 100,
      opacity: Math.random() * 0.22 + 0.06
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div id="petals-container" className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {petals.map(p => (
        <div 
          key={p.id}
          className="absolute top-0 animate-petal-fall will-change-transform"
          style={{
            width: `${p.sz}px`, 
            height: `${p.sz}px`,
            left: `${p.left}%`,
            opacity: p.opacity,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`
          }}
        >
          {p.sh(p.col)}
        </div>
      ))}
    </div>
  );
}

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let start = 0;
        const duration = 2000;
        const startTime = performance.now();

        const animate = (currentTime) => {
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / duration, 1);
          // Ease out quad
          const easeProgress = progress * (2 - progress);
          setCount(Math.floor(easeProgress * target));

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setCount(target);
          }
        };
        requestAnimationFrame(animate);
        observer.disconnect();
      }
    });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref} className="font-display font-bold text-[clamp(1.8rem,4vw,2.5rem)] text-white">{count}{suffix}</span>;
}

export default function Hero() {
  return (
    <>
      <section id="hero" aria-label="Inicio" className="relative min-h-[100svh] flex flex-col justify-center items-center text-center overflow-hidden pt-[var(--cd-height,0px)]">
        {/* Background */}
        <div id="hero-bg" className="absolute inset-0 z-[-1]">
          <img 
            src="img/stranger-things.jpeg" 
            alt="Arreglo floral de rosas" 
            id="hero-img"
            fetchPriority="high"
            className="w-full h-full object-cover transform scale-105 transition-transform duration-[20s]"
          />
          <div id="hero-overlay" className="absolute inset-0 bg-gradient-to-b from-negro-soft/40 via-negro/60 to-negro" />
        </div>

        <Petals />

        <div className="relative z-10 w-full max-w-[800px] px-6 mt-16">
          <div className="flex items-center justify-center gap-4 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <span className="h-[1px] w-8 bg-rosa/50"></span>
            <span className="text-[0.75rem] font-bold tracking-[0.2em] uppercase text-rosa-light">
              Envíos a domicilio · {meta.ciudad}
            </span>
            <span className="h-[1px] w-8 bg-rosa/50"></span>
          </div>
          
          <h1 className="font-display text-[clamp(3rem,8vw,6rem)] leading-[1] font-bold text-white mb-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <span className="block mb-2">Flores que</span>
            <em className="font-script font-normal text-rosa text-[1.2em] italic pr-4">enamoran</em>
          </h1>
          
          <p className="text-[1rem] md:text-[1.1rem] text-white/70 leading-[1.6] max-w-[500px] mx-auto mb-10 font-light animate-fade-up" style={{ animationDelay: '0.3s' }}>
            Llegamos a toda el {meta.areaMetropolitana} en menos de 3 horas.
          </p>
          
          <div className="animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <a href="#catalogo" className="inline-flex items-center justify-center bg-transparent border-2 border-rosa hover:bg-rosa text-white text-[0.85rem] font-bold tracking-[0.1em] uppercase py-4 px-8 rounded-full transition-all duration-300 ease-spring hover:scale-105">
              Ver catálogo
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="absolute bottom-[4rem] left-0 right-0 z-10 px-6 hidden sm:flex justify-center animate-fade-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center gap-8 md:gap-16 bg-negro/40 backdrop-blur-md border border-white/10 rounded-full py-4 px-10">
            <div className="flex flex-col items-center">
              <AnimatedCounter target={8} suffix="+" />
              <span className="text-[0.65rem] tracking-[0.1em] uppercase text-white/50 mt-1">Años de experiencia</span>
            </div>
            <div className="w-[1px] h-12 bg-white/10" aria-hidden="true"></div>
            <div className="flex flex-col items-center">
              <AnimatedCounter target={2000} suffix="+" />
              <span className="text-[0.65rem] tracking-[0.1em] uppercase text-white/50 mt-1">Entregas realizadas</span>
            </div>
            <div className="w-[1px] h-12 bg-white/10" aria-hidden="true"></div>
            <div className="flex flex-col items-center">
              <AnimatedCounter target={3} suffix="h" />
              <span className="text-[0.65rem] tracking-[0.1em] uppercase text-white/50 mt-1">Entrega express</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-up" style={{ animationDelay: '0.8s' }} aria-hidden="true">
          <div className="w-[1px] h-12 bg-gradient-to-b from-rosa to-transparent animate-[pulse_2s_infinite]"></div>
          <span className="text-[0.6rem] tracking-[0.2em] uppercase text-white/40">scroll</span>
        </div>
      </section>

      {/* Trust Bar (Como región justo después de Hero) */}
      <div id="trust-bar" role="region" aria-label="Nuestras promesas" className="bg-negro border-b border-white/5 py-8 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
          <div className="flex items-center gap-4 flex-1 animate-fade-up">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-8 h-8 text-rosa shrink-0" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <div>
              <strong className="block text-[0.85rem] font-semibold text-white">Entrega en 3 horas</strong>
              <span className="text-[0.75rem] text-white/50">Pedidos express todos los días</span>
            </div>
          </div>
          <div className="hidden md:block w-[1px] h-10 bg-white/10 shrink-0" aria-hidden="true"></div>
          <div className="flex items-center gap-4 flex-1 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-8 h-8 text-rosa shrink-0" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2c-1.5 0-2.8.7-3.6 1.8A3 3 0 0 0 4.2 8C2.7 8.8 2 10.3 2 12c0 1.5.7 2.8 1.8 3.6a3 3 0 0 0 4.2 4.2C8.8 21.3 10.3 22 12 22c1.5 0 2.8-.7 3.6-1.8a3 3 0 0 0 4.2-4.2c1.1-1 1.8-2.5 1.8-4.2 0-1.5-.7-2.8-1.8-3.6a3 3 0 0 0-4.2-4.2C14.8 2.7 13.5 2 12 2z"/></svg>
            <div>
              <strong className="block text-[0.85rem] font-semibold text-white">Flores del día</strong>
              <span className="text-[0.75rem] text-white/50">Cortadas y preparadas frescas</span>
            </div>
          </div>
          <div className="hidden md:block w-[1px] h-10 bg-white/10 shrink-0" aria-hidden="true"></div>
          <div className="flex items-center gap-4 flex-1 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-8 h-8 text-rosa shrink-0" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <div>
              <strong className="block text-[0.85rem] font-semibold text-white">Pago seguro</strong>
              <span className="text-[0.75rem] text-white/50">Transferencia, tarjeta o efectivo</span>
            </div>
          </div>
          <div className="hidden md:block w-[1px] h-10 bg-white/10 shrink-0" aria-hidden="true"></div>
          <div className="flex items-center gap-4 flex-1 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-8 h-8 text-rosa shrink-0" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <div>
              <strong className="block text-[0.85rem] font-semibold text-white">Tarjeta personalizada</strong>
              <span className="text-[0.75rem] text-white/50">Incluida en cada arreglo</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
