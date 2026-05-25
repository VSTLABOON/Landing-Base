// ─── HERO ROUTER — Selector dinámico de variante Hero ───────────
// Lee tenant.secciones.hero.hero_style y renderiza el componente
// correspondiente. Si no se especifica, usa el Hero clásico.
//
// Estilos disponibles:
//   'classic'      → Hero.jsx         (Pétalos + Trust Bar oscuro)
//   'cinematic'    → HeroCinematic.jsx (Video + Editorial blanco)
//   'glassmorphic' → HeroGlassmorphic.jsx (Video + Liquid Glass oscuro)
//
// Para agregar un nuevo estilo de Hero:
//   1. Crear el componente en /components/sections/
//   2. Agregar el lazy import aquí
//   3. Registrar la clave en HERO_VARIANTS
//   4. Añadir la opción al selector en ContenidoTab.tsx
// ────────────────────────────────────────────────────────────────

import { lazy, Suspense } from 'react';
import { useTenant } from '../../context/TenantContext.tsx';

// Eager: el clásico (above the fold, LCP critical)
import HeroClassic from './Hero.jsx';

// Lazy: los alternativos (code-split)
const HeroCinematic = lazy(() => import('./HeroCinematic.jsx'));
const HeroGlassmorphic = lazy(() => import('./HeroGlassmorphic.jsx'));

const HERO_VARIANTS = {
  classic: HeroClassic,
  cinematic: HeroCinematic,
  glassmorphic: HeroGlassmorphic,
};

export default function HeroRouter() {
  const { tenant } = useTenant();
  const heroStyle = tenant.secciones?.hero?.hero_style || 'classic';

  const HeroComponent = HERO_VARIANTS[heroStyle] || HeroClassic;

  // El hero clásico no necesita Suspense (eager loaded)
  if (heroStyle === 'classic') {
    return <HeroComponent />;
  }

  // Los demás se cargan con code-splitting
  return (
    <Suspense
      fallback={
        <div
          className="min-h-[100svh] flex items-center justify-center"
          style={{ backgroundColor: heroStyle === 'cinematic' ? '#FFFFFF' : '#000000' }}
        >
          <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin opacity-30" />
        </div>
      }
    >
      <HeroComponent />
    </Suspense>
  );
}
