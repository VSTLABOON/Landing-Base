import {
  CreditCard, Clock, Zap, Globe, Users, Truck,
  BarChart3, BellRing, MessageSquareOff, type LucideIcon,
} from 'lucide-react';

// ── HERO ──
export const HERO = {
  badge: 'Más de 120 florerías en México ya cobran sus arreglos antes de armar',
  headline: ['Que no se te quede ni un clavel', 'esta temporada de graduaciones.'],
  sub: 'De la Central de Abastos a tu local: organiza tus pedidos de San Valentín y el 10 de Mayo sin perder un solo peso en flores marchitas. Cobra por tarjeta, SPEI o Mercado Pago antes de que la flor salga de la cámara.',
  cta: 'Crear mi tienda',
  ctaSecondary: 'Ver una tienda de florería real →',
  trust: ['Sin plazos forzosos', 'Lista en 10 minutos', 'Tú controlas tus precios'],
};

// ── FEATURES PER PLAN (carousel inside each plan) ──
export type PlanFeature = { icon: LucideIcon; title: string; desc: string };

export const PLAN_FEATURES: Record<string, PlanFeature[]> = {
  basico: [
    { icon: Globe, title: 'Tu catálogo digital para el 14 de Febrero', desc: 'Sube tus bouquets de 12 o 24 rosas y comparte el link por WhatsApp. Deja de mandar fotos una por una en plena temporada.' },
    { icon: MessageSquareOff, title: 'Menos preguntas, más armado de ramos', desc: 'Tus clientes ven los precios de las coronas y arreglos fúnebres al instante. Tú te enfocas en que el diseño de los lirios quede perfecto.' },
    { icon: BellRing, title: 'Adiós a los pedidos perdidos en el chat', desc: 'Cada encargo llega con nombre, calle y dedicatoria. No más confusiones de si el cliente quería astromelias o gerberas.' },
  ],
  pro: [
    { icon: CreditCard, title: 'Cobra el anticipo antes de tocar la tijera', desc: 'Tus clientes pagan con Tarjeta o SPEI al momento. Se acabó eso de armar un arreglo de $1,200 para que nunca pasen por él y la flor termine en el bote de basura.' },
    { icon: Clock, title: 'Encargos de última hora bajo control', desc: 'Alguien olvida un aniversario a medianoche. Tu tienda recibe el pago de las rosas y tú solo llegas a armar el bouquet en la mañana.' },
    { icon: Zap, title: 'Aguanta el caos del 10 de Mayo', desc: 'Recibe 50 pedidos de tulipanes en una hora sin que tu WhatsApp se trabe. Todo organizado por hora de entrega en tu panel.' },
    { icon: Users, title: 'Tu equipo sabe qué flores comprar', desc: 'Tus ayudantes ven desde su celular cuántas docenas de rosas se necesitan para los compromisos del fin de semana. Menos vueltas a la Central.' },
    { icon: BarChart3, title: 'Invierte en la flor que sí se vende', desc: '¿Se venden más los girasoles o los arreglos mixtos? Mira tus ventas reales y deja de tirar dinero comprando flor que nadie pide.' },
  ],
  premium: [
    { icon: Truck, title: 'Rastreo de envíos para el Día de Muertos', desc: 'Asigna las rutas de tus repartidores. Tus clientes ven por dónde va su corona de flores en tiempo real. Menos llamadas de "¿ya mero llega?".' },
    { icon: Globe, title: 'Tu marca propia: www.tufloreria.com', desc: 'Eleva el ticket promedio de tus arreglos de Navidad y Bodas con un dominio personalizado que dé confianza absoluta a clientes de ticket alto.' },
  ],
};

// ── PRICING ──
export const PRICING = [
  {
    key: 'basico', level: 'Nivel 1', name: 'BotaniQ Esencia', price: '$400', period: '/mes',
    yearPrice: '$4,000', yearSave: '$800',
    desc: 'Ideal para florerías locales que quieren dejar de mandar PDFs por WhatsApp cada que cambia el precio de la docena.',
    roi: 'Asegura que tus clientes vean tus arreglos de temporada actualizados sin que tú tengas que enviar fotos todo el día.',
    features: ['Catálogo con fotos reales', 'Pedidos directos a WhatsApp', 'Panel de control de pedidos', 'Sin comisiones por venta'],
    color: 'from-gray-500/20 to-gray-400/5', accent: 'text-gray-300', border: 'border-white/5',
    glow: 'group-hover:shadow-[0_0_40px_rgba(156,163,175,0.15)]',
  },
  {
    key: 'pro', level: 'Nivel 2', name: 'BotaniQ Alquimia', price: '$900', period: '/mes',
    yearPrice: '$9,000', yearSave: '$1,800',
    desc: 'Perfecto para asegurar tus ventas de graduaciones y XV años cobrando por adelantado con tarjeta o transferencia.',
    roi: 'Evita que la flor se eche a perder: si el cliente ya pagó su arreglo de $1,500, tu ganancia ya está en el banco.',
    features: ['Todo lo del Básico', 'Cobro con Tarjeta y SPEI [3.6% + $3 MXN]', 'Notificaciones de pago al instante', 'Gestión de hasta 3 ayudantes', 'Soporte para picos del 10 de mayo'],
    color: 'from-violet-500/30 to-fuchsia-500/10', accent: 'text-violet-400', border: 'border-violet-500/30',
    glow: 'group-hover:shadow-[0_0_60px_rgba(139,92,246,0.25)]', popular: true,
  },
  {
    key: 'premium', level: 'Nivel 3', name: 'BotaniQ Edén', price: '$1,300', period: '/mes',
    yearPrice: '$13,000', yearSave: '$2,600',
    desc: 'Para florerías con alto volumen de pedidos a domicilio y eventos corporativos de fin de año.',
    roi: 'Optimiza tus rutas de entrega en San Valentín y ahorra en gasolina y tiempo de tus repartidores.',
    features: ['Todo lo del Pro', 'App para tus propios repartidores', 'GPS para rastreo de rutas', 'Dominio personalizado incluido', 'Comisión preferencial [DATO PENDIENTE]'],
    color: 'from-amber-500/30 to-orange-500/10', accent: 'text-amber-400', border: 'border-amber-500/20',
    glow: 'group-hover:shadow-[0_0_60px_rgba(245,158,11,0.2)]',
  },
];

// ── TESTIMONIALS ──
export const TESTIMONIALS = [
  { 
    name: 'Martha Elena Ruiz', 
    city: 'CDMX', 
    quote: 'El 14 de febrero pasado fue el primero que no terminé llorando de coraje. Otros años me quedaban hasta 20 bouquets de rosas rojas armados que nunca pasaban a recoger. Con la página, cada arreglo de $850 ya estaba pagado antes de que yo siquiera comprara la flor en la Central.', 
    color: 'bg-fuchsia-600' 
  },
  { 
    name: 'Guadalupe Santos', 
    city: 'Monterrey, N.L.', 
    quote: 'Me daba miedo que mis señoras de siempre no quisieran usar la página, pero les encanta porque pueden pagar con SPEI y mandarme el comprobante ahí mismo. En la temporada de Cempasúchil vendí 40 coronas más porque no perdí tiempo contestando precios por WhatsApp.', 
    color: 'bg-violet-600' 
  },
  { 
    name: 'Javier Méndez', 
    city: 'Guadalajara, Jal.', 
    quote: 'Para las graduaciones de junio, el panel me salvó la vida. Podía ver cuántos centros de mesa teníamos para cada salón y cuánto nos faltaba por cobrar. Dejé de anotar pedidos en libretas mojadas que luego ni se entendían.', 
    color: 'bg-emerald-600' 
  },
];

// ── SAFETY NET ──
export const SAFETY = {
  title: '¿Y si no llega el dinero?',
  sub: 'Tu dinero es sagrado para nosotros. Sabemos lo que cuesta cada tallo.',
  items: [
    { q: '¿Qué pasa si mi cliente dice que sí pagó pero no aparece en mi panel?', a: 'Revisamos el folio de Mercado Pago o la transferencia SPEI al momento. Si el banco del cliente rechazó la tarjeta por falta de fondos, te avisamos de inmediato para que no gastes flor ni tiempo en un pedido que no está firme.' },
    { q: '¿Y si se cae la página justo el 10 de Mayo?', a: 'Nuestros servidores están preparados para recibir miles de visitas simultáneas. Tu tienda va a aguantar el tráfico pesado de las fechas fuertes mejor que cualquier grupo de WhatsApp.' },
    { q: '¿Cómo sé que el pago por tarjeta es seguro?', a: 'Usamos Stripe, el mismo sistema que usan las empresas grandes. El dinero de tus arreglos va directo de la tarjeta de tu cliente a tu cuenta bancaria en 48 horas.' },
    { q: '¿Qué hago si un cliente me reclama un reembolso?', a: 'Tú tienes el control total. Desde tu panel puedes hacer devoluciones parciales o totales si, por ejemplo, no hubo la flor específica que el cliente quería y acordaron un cambio.' },
  ],
};

// ── FAQS ──
export const FAQS = [
  { q: '¿Cuánto me cobran por cada venta con tarjeta?', a: 'En el plan Pro y Premium, la comisión es de [3.6% + $3 MXN] más IVA por cada transacción exitosa. No hay cargos por pedidos rechazados o cancelados. El dinero llega a tu banco automáticamente.' },
  { q: '¿Puedo aceptar pedidos personalizados o solo productos fijos?', a: 'Ambos. Puedes subir ramos con opciones (ej: 12, 24 o 36 rosas) o dejar un botón de "Pedido Especial" donde tú acuerdas el precio final con el cliente por WhatsApp antes de que él pague en la página.' },
  { q: '¿Aguanta el tráfico del 10 de mayo?', a: 'Totalmente. Está diseñada para que entren 200 pedidos en una mañana sin que tú tengas que anotar nada. Los pedidos se organizan solitos por hora de entrega y zona.' },
  { q: '¿Mis clientes que prefieren pagar en efectivo al recibir pueden seguir haciéndolo?', a: 'Sí. Puedes dejar activa la opción de "Pedido por WhatsApp" para esos clientes de toda la vida que prefieren pagarte en el local o al momento de la entrega.' },
  { q: '¿Qué pasa si subo mal el precio de un arreglo?', a: 'Lo corriges desde tu celular en 5 segundos. Si el precio de la nube o el follaje subió hoy en la Central, entras a tu panel y actualizas tus precios al instante para no perder margen.' },
  { q: '¿Qué pasa si mi cliente quiere pagar por SPEI?', a: 'El sistema le da tus datos de transferencia automáticamente. En cuanto el dinero cae, el pedido se marca como "Pagado" en tu panel para que empieces a armar el arreglo con confianza.' },
];
