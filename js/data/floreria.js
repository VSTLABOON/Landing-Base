// ─── FLORES DEL CORAZÓN — DATA ──────────────────────────────────

export const meta = {
  nombre: 'Flores del Corazón',
  whatsapp: '528182223344', // ← reemplazar con número real de MTY
  waBase: 'https://wa.me/528182223344',
}

// ── PRODUCTOS ────────────────────────────────────────────────────
export const productos = [
  {
    id: 'rocio',
    name: 'Rocío de Amor',
    short: 'Rosas rojas y lilas',
    precio: '$450',
    precioNum: 450,
    disponible: true,
    badge: 'Más pedido',
    badgeClass: 'especial',
    imgUrl: 'img/rocio.jpeg',
    desc: 'Rosas rojas de tallo largo combinadas con lilas y follaje verde fresco. El clásico que nunca falla.\n\nPerfecto para cumpleaños, aniversarios o para decirle a alguien que la quieres sin necesidad de palabras. Incluye moño de listón y tarjeta personalizada.\n\nDuración estimada: 10–14 días.',
    waMsg: 'Hola! Me interesa el arreglo *Rocío de Amor* ($450 MXN). ¿Tienen disponibilidad hoy?',
  },
  {
    id: 'amanecer',
    name: 'Amanecer Rosa',
    short: 'Rosas rosadas y girasoles',
    precio: '$520',
    precioNum: 520,
    disponible: true,
    badge: null,
    imgUrl: 'img/amanecer.jpeg',
    desc: 'Rosas rosadas premium con girasoles frescos y eucalipto plateado. La combinación perfecta de dulzura y alegría.\n\nIdeal para el Día de las Madres, graduaciones y detalles de amistad. Cada arreglo transmite calidez y energía positiva.\n\nDuración estimada: 8–12 días.',
    waMsg: 'Hola! Me interesa el arreglo *Amanecer Rosa* ($520 MXN). ¿Tienen disponibilidad hoy?',
  },
  {
    id: 'terciopelo',
    name: 'Noche de Terciopelo',
    short: 'Rosas borgoña y callas blancas',
    precio: '$680',
    precioNum: 680,
    disponible: false,
    badge: 'Premium',
    badgeClass: '',
    imgUrl: 'img/terciopelo.jpeg',
    desc: 'Rosas borgoña de temporada con flores de calla blancas y follaje oscuro. Elegancia pura para momentos que merecen lo mejor.\n\nUn arreglo de alto impacto visual que no pasará desapercibido. Viene en caja premium con papel de seda y tarjeta personalizada.\n\nDuración estimada: 10–14 días.',
    waMsg: 'Hola! Me interesa el arreglo *Noche de Terciopelo* ($680 MXN). ¿Tienen disponibilidad hoy?',
  },
  {
    id: 'primavera',
    name: 'Primavera Eterna',
    short: 'Mezcla de temporada',
    precio: '$390',
    precioNum: 390,
    disponible: true,
    badge: null,
    imgUrl: 'img/primavera.jpeg',
    desc: 'Una mezcla alegre de flores de temporada: margaritas, rosas mini, alstroemeria y lavanda. Cada arreglo es único porque usamos lo mejor del día.\n\nPerfecto para regalar sin necesidad de una ocasión especial. La sorpresa más auténtica y fresca.\n\nDuración estimada: 7–10 días.',
    waMsg: 'Hola! Me interesa el arreglo *Primavera Eterna* ($390 MXN). ¿Tienen disponibilidad hoy?',
  },
  {
    id: 'sol',
    name: 'Sol de Mayo',
    short: 'Girasoles y rosas amarillas',
    precio: '$480',
    precioNum: 480,
    disponible: true,
    badge: '10 de Mayo',
    badgeClass: 'especial',
    imgUrl: 'img/sol.jpeg',
    desc: 'Girasoles grandes y frescos combinados con rosas amarillas y pompones. El arreglo favorito para el Día de las Madres.\n\nTransmite alegría, gratitud y el cariño más sincero. Disponible con globo metálico sin costo adicional durante el Día de las Madres.\n\nDuración estimada: 8–12 días.',
    waMsg: 'Hola! Me interesa el arreglo *Sol de Mayo* ($480 MXN). ¿Tienen disponibilidad hoy?',
  },
  {
    id: 'nupcial',
    name: 'Bouquet Nupcial',
    short: 'Bodas y eventos especiales',
    precio: 'Desde $1,200',
    precioNum: 1200,
    disponible: true,
    badge: 'A medida',
    badgeClass: '',
    imgUrl: 'img/nupcial.jpeg',
    desc: 'Bouquets nupciales diseñados a medida con flores de temporada o importadas.\n\nTrabajamos contigo para crear el arreglo que siempre imaginaste. Consulta disponibilidad y coordina tu cita personalizada con nuestros diseñadores florales.\n\nSolicitamos coordinación con al menos 2 semanas de anticipación.',
    waMsg: 'Hola! Me interesa cotizar un *Bouquet Nupcial* para mi evento. ¿Podemos agendar una consulta?',
  },
]

// ── SERVICIOS ─────────────────────────────────────────────────────
// catalogIds: IDs de productos a mostrar en el catálogo de ese servicio,
// en el orden deseado. Si está presente, el clic en "Conocer más" abre
// el panel de catálogo horizontal en lugar del modal genérico.
export const servicios = [
  {
    title: 'Día de las Madres',
    desc: 'El 10 de mayo haz que tu mamá se sienta la más especial del mundo.',
    icon: 'heart',
    imgUrl: 'img/mom.jpeg',
    longDesc: 'El 10 de mayo es nuestra fecha más importante del año.\n\nPreparamos arreglos especiales con las flores más hermosas de la temporada. Abrimos desde las 7:00 AM y hacemos envíos hasta las 9:00 PM para que ninguna mamá se quede sin sus flores.\n\nRecomendamos hacer tu pedido con 24 horas de anticipación para garantizar disponibilidad.',
    waMsg: 'Hola! Quisiera hacer un pedido para el Día de las Madres. ¿Qué arreglos tienen disponibles?',
    // Arreglos especiales para esta fecha
    catalogIds: ['sol', 'amanecer', 'rocio', 'primavera'],
  },
  {
    title: 'Bodas y Eventos',
    desc: 'Decoración floral completa para el día más importante de tu vida.',
    icon: 'ribbon',
    imgUrl: 'img/boda.jpeg',
    longDesc: 'Hacemos realidad la visión floral de tu evento.\n\nDesde bouquets de novia hasta centros de mesa, arcos florales y decoración de iglesia o salón. Coordinamos directamente contigo para entender tu estilo y presupuesto.\n\nAgenda una consulta sin costo con nuestros diseñadores florales. Trabajamos con 2 semanas mínimo de anticipación para eventos.',
    waMsg: 'Hola! Me interesa cotizar decoración floral para una boda/evento. ¿Podemos agendar una consulta?',
    // Opciones premium para eventos
    catalogIds: ['nupcial', 'terciopelo', 'amanecer', 'rocio'],
  },
  {
    title: 'Envíos a Domicilio',
    desc: 'Express en menos de 3 horas a cualquier parte de la zona metropolitana.',
    icon: 'zap',
    imgUrl: 'img/domicilio.jpeg',
    longDesc: 'Cubrimos toda la zona metropolitana de Monterrey.\n\nMonterrey Centro, San Pedro Garza García, San Nicolás, Cumbres, Carretera Nacional, Contry, Santa Catarina y Guadalupe.\n\nHorario de envíos: Lunes a Domingo de 8:00 AM a 8:00 PM. El costo de envío es de $50 MXN dentro de la zona metropolitana.',
    waMsg: 'Hola! Quisiera hacer un pedido con envío a domicilio. ¿Cuál es su cobertura y tiempo de entrega?',
    // Todos los disponibles para envío inmediato
    catalogIds: ['rocio', 'amanecer', 'primavera', 'sol', 'nupcial'],
  },
]

// ── TESTIMONIOS ───────────────────────────────────────────────────
export const testimonios = [
  {
    nombre: 'Ana Martínez',
    inicial: 'A',
    ubicacion: 'Monterrey Centro · Día de las Madres',
    estrellas: 5,
    cita: 'Pedí a las 10 AM y llegó antes del mediodía, hermosísimo. Mi mamá lloró de emoción. Los recomiendo al 100%.',
    largo: 'Pedí un arreglo para mi mamá a las 10 de la mañana y llegó antes del mediodía, hermosísimo y muy fresco.\n\nMi mamá lloró de emoción. Definitivamente volveré a pedir con ellos para cada ocasión especial.',
  },
  {
    nombre: 'Carlos Reyes',
    inicial: 'C',
    ubicacion: 'San Pedro · Aniversario',
    estrellas: 5,
    cita: 'No sé nada de flores y me ayudaron a elegir el arreglo perfecto para mi esposa. Ella quedó encantada.',
    largo: 'Quería sorprender a mi esposa en su aniversario y no sé nada de flores. Les expliqué el presupuesto y me ayudaron a elegir el arreglo perfecto.\n\nElla quedó encantada. El servicio es muy personalizado y el precio muy justo.',
  },
  {
    nombre: 'Sofía Herrera',
    inicial: 'S',
    ubicacion: 'Cumbres · Cumpleaños',
    estrellas: 5,
    cita: 'Las flores llegaron en perfectas condiciones y duran muchísimo. Ya van más de 10 días y siguen preciosas.',
    largo: 'Las flores llegaron en perfectas condiciones y duran muchísimo. Ya van más de 10 días y siguen preciosas.\n\nEl empaque es muy cuidado, con papel de seda y listón. Se nota que les importa la presentación tanto como las flores mismas.',
  },
  {
    nombre: 'Laura Domínguez',
    inicial: 'L',
    ubicacion: 'San Nicolás · Graduación',
    estrellas: 5,
    cita: 'Con pocas horas de anticipación y llegaron puntualísimas, con los colores exactos que pedí. Muy atentos en WhatsApp.',
    largo: 'Pedí flores para la graduación de mi hija con solo unas horas de anticipación y no tuve ningún problema. Llegaron puntualísimas.\n\nEl arreglo fue exactamente lo que pedí, con los colores de su carrera. Muy atentos en el WhatsApp.',
  },
  {
    nombre: 'Miguel Torres',
    inicial: 'M',
    ubicacion: 'Carretera Nacional · Boda',
    estrellas: 5,
    cita: 'Contratamos la decoración floral completa para nuestra boda. El resultado superó todas las expectativas.',
    largo: 'Contratamos la decoración floral completa para nuestra boda. El resultado superó todas las expectativas.\n\nEl equipo es muy profesional, llega a tiempo y trabaja con mucho cuidado. Los precios son honestos para la calidad que ofrecen.',
  },
]

// ── BENEFICIOS ─────────────────────────────────────────────────────
export const beneficios = [
  {
    title: 'Entrega Express',
    desc: 'Pedidos en menos de 3 horas en toda la zona metropolitana de Monterrey.',
    icon: 'zap',
    largo: 'Sabemos que los mejores momentos no siempre se planean con anticipación.\n\nPor eso ofrecemos envío express: realizas tu pedido por WhatsApp y en menos de 3 horas tienes el arreglo en la puerta.\n\nCobertura en Monterrey Centro, San Pedro, San Nicolás, Cumbres, Carretera y toda la zona metropolitana.',
  },
  {
    title: 'Flores del día',
    desc: 'Cada arreglo se prepara con flores recibidas ese mismo día o el anterior.',
    icon: 'flower',
    largo: 'No tenemos flores en bodega esperando semanas.\n\nTrabajamos directamente con productores locales y mercados especializados para garantizar la máxima frescura.\n\nNuestras flores duran entre 7 y 14 días si las cuidas correctamente — y te decimos exactamente cómo hacerlo.',
  },
  {
    title: 'Pago sin complicaciones',
    desc: 'Transferencia SPEI, tarjeta o efectivo a la entrega. Tú eliges.',
    icon: 'shield',
    largo: 'Múltiples formas de pago para tu comodidad.\n\nTransferencia bancaria (SPEI), tarjeta de crédito o débito vía link de pago seguro, o efectivo al momento de la entrega.\n\nNo pedimos anticipo para pedidos menores a $600 MXN. Para pedidos especiales y bodas, solo solicitamos un 50% al confirmar.',
  },
  {
    title: 'Personalización total',
    desc: 'Tarjeta con mensaje personalizado incluida en cada arreglo, sin costo.',
    icon: 'message',
    largo: 'Los detalles hacen la diferencia.\n\nTodos nuestros arreglos incluyen una tarjeta de regalo con el mensaje que tú elijas, sin costo adicional. También podemos agregar globos, chocolates, peluches o vino a tu arreglo.\n\nConsúltanos sobre paquetes especiales para el Día de las Madres, San Valentín, bodas y quinceañeras.',
  },
]

// ── TIPOS DE FLORES ──────────────────────────────────────────────
export const flores = [
  { name: 'Rosas',     sub: '12 colores',    gradient: 'linear-gradient(135deg,#8B1A2A,#C0392B,#E74C3C)' },
  { name: 'Girasoles', sub: 'Todo el año',   gradient: 'linear-gradient(135deg,#A05F0A,#F39C12,#F9C74F)' },
  { name: 'Lilis',     sub: 'Con fragancia', gradient: 'linear-gradient(135deg,#5B2C6F,#8E44AD,#BB8FCE)' },
  { name: 'Tulipanes', sub: 'Temporada',     gradient: 'linear-gradient(135deg,#9B0E58,#E91E8C,#FF80C0)' },
  { name: 'Callas',    sub: 'Elegantes',     gradient: 'linear-gradient(135deg,#1A252F,#2E4053,#566573)' },
  { name: 'Mixtos',    sub: 'Lo mejor del día', gradient: 'linear-gradient(135deg,#145A32,#27AE60,#82E0AA)' },
]

// ── SOBRE NOSOTROS ───────────────────────────────────────────────
export const nosotros = {
  texto: `En Flores del Corazón llevamos más de 8 años llevando felicidad a cada rincón de Monterrey. Lo que empezó como un pequeño local hoy es una florería con envíos a domicilio en toda la zona metropolitana.

Creemos que las flores no son solo un regalo — son un idioma. Dicen lo que a veces las palabras no pueden: "te quiero", "estoy aquí", "lo lograste", "lo siento".

Cada arreglo sale de nuestras manos con el mismo cuidado de siempre: flores frescas, presentación impecable y el detalle personalizado que hace la diferencia.`,
  firma: 'Flores del Corazón',
}

// ── GALERÍA DE ENTREGAS REALES ───────────────────────────────────
export const galeria = [
  { imgUrl: 'img/rosas.jpeg', alt: 'Entrega de rosas rojas en Monterrey Centro', autor: '@ana.mty' },
  { imgUrl: 'img/rosasrosadas.jpeg', alt: 'Arreglo de rosas rosadas y girasoles', autor: '@carlos_r' },
  { imgUrl: 'img/callas.jpeg', alt: 'Flores calla blancas entregadas', autor: '@sofia_hg' },
  { imgUrl: 'img/mixto.jpeg', alt: 'Bouquet mixto de temporada', autor: '@laura.d' },
  { imgUrl: 'img/girasoles.jpeg', alt: 'Girasoles frescos entregados en Cumbres', autor: '@miguelt_mty' },
  { imgUrl: 'img/nup.jpeg', alt: 'Bouquet nupcial boda en Monterrey', autor: '@fernanda_wb' },
  { imgUrl: 'img/madres.jpeg', alt: 'Día de las Madres arreglo especial', autor: '@pao.flores' },
  { imgUrl: 'img/evento.jpeg', alt: 'Decoración floral evento en San Pedro', autor: '@wedding.spgg' },
]