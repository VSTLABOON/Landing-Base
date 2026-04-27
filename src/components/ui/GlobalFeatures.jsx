import { useEffect, useRef, useState } from 'react';

export function Cursor() {
  const curRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (curRef.current) {
        curRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      requestAnimationFrame(animateRing);
    };

    window.addEventListener('mousemove', handleMouseMove);
    const rafId = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div 
        ref={curRef} 
        className="fixed top-0 left-0 w-[6px] h-[6px] bg-rosa rounded-full pointer-events-none z-[9999] -ml-[3px] -mt-[3px] hidden md:block" 
        aria-hidden="true" 
      />
      <div 
        ref={ringRef} 
        className="fixed top-0 left-0 w-8 h-8 border border-rosa/60 rounded-full pointer-events-none z-[9998] -ml-4 -mt-4 transition-opacity duration-150 hidden md:block mix-blend-screen" 
        aria-hidden="true" 
      />
    </>
  );
}

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (scrollPx / winHeightPx) * 100;
      setProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 h-[3px] bg-rosa z-[10000] transition-all duration-150 ease-out origin-left" 
      style={{ width: `${progress}%` }}
      role="progressbar" 
      aria-hidden="true"
    />
  );
}

export function CountdownBanner() {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const bannerRef = useRef(null);

  useEffect(() => {
    if (sessionStorage.getItem('cd-closed')) {
      document.documentElement.style.setProperty('--cd-height', '0px');
      return;
    }
    setIsVisible(true);

    const getTarget = () => {
      const now = new Date();
      const year = now.getMonth() < 4 || (now.getMonth() === 4 && now.getDate() <= 10)
        ? now.getFullYear()
        : now.getFullYear() + 1;
      return new Date(`${year}-05-10T08:00:00`);
    };

    const pad = n => String(n).padStart(2, '0');

    const tick = () => {
      const diff = getTarget() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ d: '¡HOY!', h: '--', m: '--', s: '--' });
        return;
      }
      setTimeLeft({
        d: pad(Math.floor(diff / 86400000)),
        h: pad(Math.floor((diff % 86400000) / 3600000)),
        m: pad(Math.floor((diff % 3600000) / 60000)),
        s: pad(Math.floor((diff % 60000) / 1000))
      });
    };

    tick();
    const timer = setInterval(tick, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isVisible && bannerRef.current) {
      const adjustOffset = () => {
        document.documentElement.style.setProperty('--cd-height', `${bannerRef.current.offsetHeight}px`);
      };
      // Short delay to ensure DOM has rendered styles
      setTimeout(adjustOffset, 50);
      window.addEventListener('resize', adjustOffset);
      return () => window.removeEventListener('resize', adjustOffset);
    } else {
      document.documentElement.style.setProperty('--cd-height', '0px');
    }
  }, [isVisible]);

  if (!isVisible || !timeLeft) return null;

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('cd-closed', '1');
  };

  return (
    <div 
      ref={bannerRef}
      className="fixed top-0 left-0 right-0 z-[1000] bg-gradient-to-r from-verde-dark via-rosa to-dorado text-white flex items-center justify-center py-2 pr-12 pl-4 animate-fade-in shadow-md"
    >
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <div className="flex items-center gap-1.5 text-[0.72rem] font-semibold tracking-[0.1em] uppercase whitespace-nowrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          10 de mayo — Día de las Madres
        </div>
        <div className="flex items-center gap-1">
          {[
            { label: 'días', val: timeLeft.d },
            { label: 'hrs', val: timeLeft.h },
            { label: 'min', val: timeLeft.m },
            { label: 'seg', val: timeLeft.s }
          ].map((u, i) => (
            <div key={u.label} className="flex items-center gap-1">
              <div className="flex flex-col items-center bg-white/20 rounded-[6px] px-2 py-1 min-w-[38px]">
                <span className="font-display text-[1.1rem] font-bold leading-none tracking-[0.04em]">{u.val}</span>
                <small className="text-[0.5rem] tracking-[0.12em] uppercase opacity-75 mt-0.5">{u.label}</small>
              </div>
              {i < 3 && <span className="font-bold opacity-50 text-base">:</span>}
            </div>
          ))}
        </div>
      </div>
      <button onClick={handleClose} aria-label="Cerrar banner" className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 text-[0.75rem] text-white flex items-center justify-center transition-colors hover:bg-white/35">
        ✕
      </button>
    </div>
  );
}

export default function GlobalFeatures() {
  return (
    <>
      <ScrollProgress />
      <Cursor />
      <CountdownBanner />
    </>
  );
}
