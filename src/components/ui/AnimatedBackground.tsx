import { useState, useEffect } from 'react';
import { useThemeContext } from '../../context/ThemeContext';

export default function AnimatedBackground() {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    // Desactivar animaciones en dispositivos móviles, pantallas táctiles o si el usuario prefiere movimiento reducido
    const isMobile = window.matchMedia('(max-width: 768px)').matches || 
                     (navigator.maxTouchPoints > 0) ||
                     (window.navigator && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent));
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    setShouldAnimate(!isMobile && !prefersReduced);
  }, []);

  // Adaptación de los colores usando las variables del sistema de diseño
  const colors = {
    bg: isDark ? 'var(--color-background-primary)' : '#f9fafb',
    orb1: isDark ? '#3b82f6' : '#60a5fa', // Azul vibrante
    orb2: isDark ? 'var(--color-primario)' : '#f472b6', // Color primario dinámico
    orb3: isDark ? 'var(--color-secundario)' : '#34d399', // Color secundario dinámico
  };

  return (
    <div 
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{ 
        backgroundColor: colors.bg,
        transition: 'background-color 0.8s cubic-bezier(0.22, 1, 0.36, 1)'
      }}
    >
      {shouldAnimate && (
        <style>{`
          @keyframes floatXY {
            0% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30vw, 20vh) scale(1.2); }
            66% { transform: translate(-20vw, 40vh) scale(0.8); }
            100% { transform: translate(0, 0) scale(1); }
          }
          @keyframes floatReverse {
            0% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(-30vw, -20vh) rotate(180deg); }
            100% { transform: translate(0, 0) rotate(360deg); }
          }
          @keyframes pulseSlow {
            0% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.5); }
            100% { opacity: 0.3; transform: scale(1); }
          }
        `}</style>
      )}

      {/* CAPA DE ORBES */}
      <div className="absolute inset-0 opacity-80" style={{ filter: 'blur(80px)' }}>
        {/* Orbe 1 */}
        <div 
          className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full opacity-[0.55] mix-blend-multiply dark:mix-blend-screen"
          style={{
            backgroundColor: colors.orb1,
            animation: shouldAnimate ? 'floatXY 28s ease-in-out infinite alternate' : 'none',
            transition: 'background-color 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: shouldAnimate ? 'transform' : 'auto'
          }}
        />
        {/* Orbe 2 */}
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full opacity-50 mix-blend-multiply dark:mix-blend-screen"
          style={{
            backgroundColor: colors.orb2,
            animation: shouldAnimate ? 'floatReverse 32s linear infinite' : 'none',
            transition: 'background-color 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: shouldAnimate ? 'transform' : 'auto'
          }}
        />
        {/* Orbe 3 */}
        <div 
          className="absolute top-[40%] left-[40%] w-[40vw] h-[40vw] rounded-full opacity-40 mix-blend-overlay dark:mix-blend-screen"
          style={{
            backgroundColor: colors.orb3,
            animation: shouldAnimate ? 'pulseSlow 12s ease-in-out infinite' : 'none',
            transition: 'background-color 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: shouldAnimate ? 'transform' : 'auto'
          }}
        />
      </div>

      {/* Textura Granulada (Noise) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
}
