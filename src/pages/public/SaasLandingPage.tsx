import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { 
  Rocket, ArrowRight, CheckCircle2, ChevronDown, 
  Instagram, Twitter, Globe, ArrowUpRight, Lock, 
  Sparkles, Check, ChevronLeft, ChevronRight, Flower
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { HERO, PLAN_FEATURES, PRICING, TESTIMONIALS, SAFETY, FAQS } from './landingData';

/* ── Liquid Glass Card Component ── */
const GlassCard = ({ children, className = '', ...props }: any) => (
  <div className={`liquid-glass rounded-3xl ${className}`} {...props}>
    {children}
  </div>
);

/* ── Custom Video Component with Smooth Fade In/Out Loop ── */
function CrossfadeVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animFrame: number;
    
    const fadeIn = () => {
      let start: number | null = null;
      const duration = 500;
      
      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        setOpacity(progress);
        if (progress < 1) {
          animFrame = requestAnimationFrame(animate);
        }
      };
      animFrame = requestAnimationFrame(animate);
    };

    const fadeOut = () => {
      let start: number | null = null;
      const duration = 500;
      const initialOpacity = video.style.opacity ? parseFloat(video.style.opacity) : 1;
      
      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        setOpacity(initialOpacity * (1 - progress));
        if (progress < 1) {
          animFrame = requestAnimationFrame(animate);
        }
      };
      animFrame = requestAnimationFrame(animate);
    };

    const handleCanPlay = () => {
      video.play().catch(() => {});
      fadeIn();
    };

    const handleTimeUpdate = () => {
      const remaining = video.duration - video.currentTime;
      if (remaining <= 0.55 && opacity === 1) {
        fadeOut();
      }
    };

    const handleEnded = () => {
      setOpacity(0);
      setTimeout(() => {
        if (video) {
          video.currentTime = 0;
          video.play().catch(() => {});
          fadeIn();
        }
      }, 100);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-opacity duration-300"
      style={{ opacity }}
      muted
      autoPlay
      playsInline
      preload="auto"
    />
  );
}

/* ── FAQ Accordion Item ── */
function AccordionItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true }} 
      transition={{ delay: index * 0.08 }}
      className="liquid-glass rounded-2xl overflow-hidden mb-3"
    >
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-6 text-left">
        <span className="text-sm md:text-base font-semibold text-white/95 pr-4">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            transition={{ duration: 0.25 }}
          >
            <div className="px-6 pb-6 text-xs md:text-sm text-white/50 leading-relaxed border-t border-white/5 pt-4">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── About Component ── */
function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative bg-black pt-32 md:pt-44 pb-14 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(217,79,110,0.03)_0%,_transparent_70%)] pointer-events-none" />
      <div className="max-w-6xl mx-auto">
        <motion.span 
          animate={isInView ? { opacity: 0.4, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="block text-white/40 text-xs tracking-widest uppercase mb-6"
        >
          Propósito & Visión
        </motion.span>
        <motion.h2 
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-3xl md:text-5xl lg:text-6xl text-white leading-[1.15] tracking-tight font-light"
        >
          Operar con precisión en cada ramo, <br />
          <em className="font-serif italic text-white/60">de la Central a tu local</em> para mentes <br className="hidden md:block" />
          <em className="font-serif italic text-white/60">que crean, diseñan y transmiten emociones.</em>
        </motion.h2>
      </div>
    </section>
  );
}

/* ── Featured Video Component ── */
function FeaturedVideoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="bg-black py-16 md:py-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.9 }}
          className="relative rounded-3xl overflow-hidden min-h-[480px] md:min-h-0 md:aspect-video w-full border border-white/5 shadow-2xl"
        >
          <video 
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4"
            className="w-full h-full object-cover"
            muted autoPlay loop playsInline preload="auto"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <GlassCard className="p-6 md:p-8 max-w-md border border-white/5">
              <span className="text-white/50 text-[10px] tracking-widest uppercase mb-3 block">El Proceso</span>
              <p className="text-white text-xs md:text-sm leading-relaxed">
                Creemos que la tranquilidad operativa comienza al asegurar tus cobros. Cada flor tiene su tiempo; tu rentabilidad no debería depender de promesas informales.
              </p>
            </GlassCard>
            <motion.a 
              href="#precios"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="liquid-glass rounded-full px-8 py-3.5 text-white text-xs md:text-sm font-semibold hover:bg-white/5 transition-all shadow-lg border border-white/10"
            >
              Comenzar ahora
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Philosophy Section ── */
function PhilosophySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="bg-black py-20 md:py-32 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl text-white tracking-tight mb-16 md:mb-24"
        >
          Organización <em className="font-serif italic text-white/40">x</em> Margen
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          <motion.div 
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl overflow-hidden aspect-[4/3] relative border border-white/5 shadow-xl"
          >
            <video 
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
              className="w-full h-full object-cover"
              muted autoPlay loop playsInline preload="auto"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#D94F6E]/10 to-transparent mix-blend-screen pointer-events-none" />
          </motion.div>

          <motion.div 
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 md:space-y-12"
          >
            <div className="space-y-4">
              <span className="text-white/40 text-[10px] tracking-widest uppercase block">La Realidad B2B</span>
              <p className="text-white/70 text-sm md:text-base leading-relaxed">
                El desperdicio en floristerías tradicionales alcanza hasta el 30% por arreglos no reclamados o mala estimación de stock. BotaniQ automatiza la captación y el pago previo para que cada astromelia o tulipán que compres ya tenga un destino garantizado.
              </p>
            </div>
            <div className="w-full h-px bg-white/10" />
            <div className="space-y-4">
              <span className="text-white/40 text-[10px] tracking-widest uppercase block">San Valentín & 10 de Mayo</span>
              <p className="text-white/70 text-sm md:text-base leading-relaxed">
                Soporta picos de ventas de más de 300 pedidos simultáneos en un solo día sin sobrecargar tu WhatsApp ni confundir las direcciones de entrega de tus clientes.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── Services Section (What We Do) ── */
function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="bg-black py-20 md:py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.01)_0%,_transparent_60%)] pointer-events-none" />
      <div className="max-w-6xl mx-auto">
        <motion.div 
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="flex items-end justify-between mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-light text-white tracking-tight">Especialidades</h2>
          <span className="text-white/40 text-xs hidden md:block uppercase tracking-widest">Nuestra Tecnología</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <motion.div 
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="group"
          >
            <GlassCard className="h-full border border-white/5 flex flex-col justify-between">
              <div className="aspect-video relative overflow-hidden rounded-t-3xl">
                <video 
                  src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
                  className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-[1.02]"
                  muted autoPlay loop playsInline preload="auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="uppercase tracking-widest text-white/40 text-[10px]">Cero Fricción</span>
                  <div className="liquid-glass rounded-full p-2.5 text-white border border-white/10 group-hover:bg-white/5 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-white text-lg md:text-xl font-semibold mb-2 tracking-tight">Catálogo Instantáneo</h3>
                <p className="text-white/50 text-xs md:text-sm leading-relaxed">
                  Tus clientes eligen opciones, configuran fecha de entrega y dedicatoria directamente. Toda la información consolidada en un solo lugar.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="group"
          >
            <GlassCard className="h-full border border-white/5 flex flex-col justify-between">
              <div className="aspect-video relative overflow-hidden rounded-t-3xl">
                <video 
                  src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4"
                  className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-[1.02]"
                  muted autoPlay loop playsInline preload="auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="uppercase tracking-widest text-white/40 text-[10px]">Protección</span>
                  <div className="liquid-glass rounded-full p-2.5 text-white border border-white/10 group-hover:bg-white/5 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-white text-lg md:text-xl font-semibold mb-2 tracking-tight">Price Hardening</h3>
                <p className="text-white/50 text-xs md:text-sm leading-relaxed">
                  Seguridad server-side que verifica la integridad de tus precios. Imposible inyectar montos o hackear cobros durante la pasarela.
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function SaasLandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState<'basico' | 'pro' | 'premium'>('pro');
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-[#D94F6E]/30 selection:text-[#D94F6E]/90 overflow-hidden font-sans">
      
      {/* ── NAVBAR ── */}
      <motion.nav 
        initial={{ y: -100 }} 
        animate={{ y: 0 }} 
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 py-4 px-6 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between liquid-glass rounded-full px-6 py-3 border border-white/5">
          <div className="flex items-center gap-2">
            <Flower className="w-5 h-5 text-[#D94F6E] animate-pulse" />
            <span className="font-bold text-base tracking-tight font-serif italic">BotaniQ</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-white/70">
            <a href="#proposito" className="hover:text-white transition-colors">Propósito</a>
            <a href="#como-funciona" className="hover:text-white transition-colors">Características</a>
            <a href="#precios" className="hover:text-white transition-colors">Precios</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-white/75 hover:text-white transition-colors">
              Ingresar
            </Link>
            <Link 
              to="/login?mode=register&plan=basico" 
              className="liquid-glass rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest text-white border border-white/10 hover:bg-white/5 transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-screen flex flex-col justify-between pt-32 pb-12 px-6 overflow-hidden">
        {/* Background Loop Video */}
        <div className="absolute inset-0 z-0">
          <CrossfadeVideo src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4" />
          <div className="absolute inset-0 bg-black/60 z-10 pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8 px-4 py-1.5 liquid-glass rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#D94F6E] border border-white/5"
          >
            {HERO.badge}
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-5xl md:text-7xl lg:text-8xl font-light text-white tracking-tight mb-8 font-serif leading-none"
          >
            Saberlo todo <br className="hidden md:block" />
            <em className="font-serif italic text-white/50">antes del corte.</em>
          </motion.h1>

          {/* Email Newsletter Input Pill */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="max-w-md w-full liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3 border border-white/10 mb-6"
          >
            <input 
              type="email" 
              placeholder="Ingresa tu correo" 
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="bg-transparent border-none outline-none flex-1 text-sm text-white placeholder:text-white/30"
            />
            <Link 
              to={`/login?mode=register&plan=basico&email=${encodeURIComponent(emailInput)}`}
              className="bg-white text-black rounded-full p-2.5 hover:scale-105 transition-transform"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="text-white/40 text-xs max-w-sm leading-relaxed mb-8"
          >
            No comprometas tu materia prima. Automatiza cobros con tarjetas y transferencias en un clic.
          </motion.p>

          <motion.a 
            href="#precios"
            className="liquid-glass rounded-full px-8 py-3 text-white text-xs uppercase tracking-widest font-bold hover:bg-white/5 transition-all border border-white/10"
          >
            Ver Planes & Tarifas
          </motion.a>
        </div>

        {/* Hero Footer */}
        <div className="relative z-20 flex justify-center gap-4 mt-auto">
          <a 
            href="https://instagram.com" target="_blank" rel="noopener noreferrer"
            className="liquid-glass rounded-full p-3.5 text-white/80 hover:text-white hover:bg-white/5 transition-all border border-white/5"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <a 
            href="https://twitter.com" target="_blank" rel="noopener noreferrer"
            className="liquid-glass rounded-full p-3.5 text-white/80 hover:text-white hover:bg-white/5 transition-all border border-white/5"
          >
            <Twitter className="w-4 h-4" />
          </a>
          <a 
            href="#" 
            className="liquid-glass rounded-full p-3.5 text-white/80 hover:text-white hover:bg-white/5 transition-all border border-white/5"
          >
            <Globe className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ── PROPÓSITO ── */}
      <div id="proposito">
        <AboutSection />
        <FeaturedVideoSection />
        <PhilosophySection />
        <ServicesSection />
      </div>

      {/* ── FEATURES POR PLAN ── */}
      <section id="como-funciona" className="py-20 md:py-32 px-6 relative z-10 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light text-white mb-6">Tranquilidad Operativa</h2>
            <p className="text-white/40 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
              Tú decides cómo interactúa tu tienda. WhatsApp directo para el básico, o pasarelas completas automatizadas para escalar.
            </p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="inline-flex liquid-glass p-1.5 rounded-full border border-white/5">
              <button 
                onClick={() => setActiveFeatureTab('basico')} 
                className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all ${activeFeatureTab === 'basico' ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}
              >
                Esencia
              </button>
              <button 
                onClick={() => setActiveFeatureTab('pro')} 
                className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all ${activeFeatureTab === 'pro' ? 'bg-white/10 text-white border border-white/10' : 'text-white/50 hover:text-white'}`}
              >
                Alquimia
              </button>
              <button 
                onClick={() => setActiveFeatureTab('premium')} 
                className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all ${activeFeatureTab === 'premium' ? 'bg-white/10 text-white border border-white/10' : 'text-white/50 hover:text-white'}`}
              >
                Edén
              </button>
            </div>
          </div>

          {/* Features cards layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLAN_FEATURES[activeFeatureTab].map((feat, i) => (
              <GlassCard key={i} className="p-8 border border-white/5 flex flex-col justify-between min-h-[220px]">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  {feat.icon && (() => {
                    const Icon = feat.icon;
                    return <Icon className="w-4 h-4 text-[#D94F6E]" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-2 tracking-tight">{feat.title}</h3>
                  <p className="text-xs md:text-sm text-white/50 leading-relaxed">{feat.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section className="py-20 md:py-32 px-6 relative z-10 bg-black border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#D94F6E] uppercase tracking-widest text-[10px] font-bold block mb-4">Testimonios</span>
            <h2 className="text-3xl md:text-5xl font-light text-white">Casos Reales</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <GlassCard key={i} className="p-8 border border-white/5 hover:bg-white/[0.02] transition-colors">
                <p className="text-white/70 text-xs md:text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white border border-white/10`}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{t.name}</div>
                    <div className="text-[10px] text-white/40">{t.city}</div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="precios" className="py-20 md:py-32 px-6 relative z-10 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light text-white mb-6">Planes Claros</h2>
            <div className="inline-flex items-center gap-1 liquid-glass p-1 rounded-full border border-white/5">
              <button 
                onClick={() => setIsAnnual(false)} 
                className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${!isAnnual ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}
              >
                Mensual
              </button>
              <button 
                onClick={() => setIsAnnual(true)} 
                className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 ${isAnnual ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}
              >
                Anual <span className="text-[9px] font-bold bg-[#D94F6E] text-white px-2 py-0.5 rounded-full">Ahorra</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {PRICING.map((plan, i) => (
              <GlassCard 
                key={i} 
                className={`p-8 border border-white/5 flex flex-col justify-between relative ${plan.popular ? 'md:scale-105 z-10 border-[#D94F6E]/40' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-8 transform -translate-y-1/2">
                    <span className="bg-[#D94F6E] text-white text-[9px] font-bold uppercase tracking-widest py-1 px-3 rounded-full">
                      Recomendado
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">{plan.level}</span>
                  <h3 className="text-xl font-bold text-white mb-4">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-black text-white">{isAnnual ? plan.yearPrice : plan.price}</span>
                    <span className="text-xs text-white/30">{isAnnual ? '/año' : plan.period}</span>
                  </div>
                  <p className="text-xs text-white/50 mb-8 leading-relaxed min-h-[48px]">{plan.desc}</p>
                  
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feat, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#D94F6E] shrink-0 mt-0.5" />
                        <span className="text-xs text-white/70">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link 
                  to={`/login?mode=register&plan=${plan.key}`} 
                  className={`w-full py-3 rounded-full text-xs font-bold uppercase tracking-widest text-center transition-all block ${
                    plan.popular 
                      ? 'bg-white text-black hover:bg-gray-100' 
                      : 'liquid-glass text-white hover:bg-white/5 border border-white/10'
                  }`}
                >
                  Adquirir {plan.name}
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── SAFETY NET ── */}
      <section className="py-20 md:py-32 px-6 relative z-10 bg-black">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#D94F6E] uppercase tracking-widest text-[10px] font-bold block mb-4">Garantía</span>
            <h2 className="text-2xl md:text-3xl font-light text-white mb-4">{SAFETY.title}</h2>
            <p className="text-white/40 text-xs md:text-sm">{SAFETY.sub}</p>
          </div>
          <div className="space-y-3">
            {SAFETY.items.map((item, i) => <AccordionItem key={i} q={item.q} a={item.a} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 md:py-32 px-6 relative z-10 bg-black border-y border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-light text-white mb-4">Preguntas Frecuentes</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => <AccordionItem key={i} q={faq.q} a={faq.a} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <footer className="relative py-24 md:py-32 px-6 text-center bg-black">
        <div className="max-w-3xl mx-auto z-10 relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-6 tracking-tight leading-tight">
            Tu florería merece operar con precisión digital.
          </h2>
          <p className="text-xs md:text-sm text-white/40 mb-10 max-w-md mx-auto leading-relaxed">
            Configura tu catálogo en 10 minutos y prepárate para dominar tus ventas de temporada alta.
          </p>
          <Link 
            to="/login?mode=register" 
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest text-white bg-gradient-to-r from-[#D94F6E] to-purple-600 hover:scale-105 transition-all shadow-[0_0_40px_rgba(217,79,110,0.2)]"
          >
            Crear mi tienda
          </Link>
          <p className="text-[10px] text-white/30 mt-8">
            Diseñado para floristas que valoran su tiempo y producto.
          </p>
        </div>
      </footer>
    </div>
  );
}
