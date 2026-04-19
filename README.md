# Flores del Corazón 🌸

Landing page y plataforma e-commerce (frontend) para negocio local de florería situado en Monterrey, Nuevo León. Este proyecto está diseñado con un enfoque Mobile-First, una arquitectura altamente modular en ecosistema Vanilla (HTML, CSS y JS sin uso excesivo de frameworks de terceros) y una integración transaccional fluida a través de WhatsApp.

## 🚀 Características Principales

- **Carrito de Compras Global:** Sistema de estado asíncrono con integración "Silent Add-to-Cart" que permite agregar productos sin interrupción mediante Notificaciones Tipo Toast.
- **Drawer de Pedido (Checkout):** Panel lateral inteligente en Desktop que se transforma en un 'bottom sheet' interactivo con swipe-down en dispositivos móviles. Funciona como punto central para previsualizar los pedidos.
- **Checkout por WhatsApp:** Generación automática de un ticket estructurado detallado que consolida la información del cliente, los arreglos escogidos, extras/preferencias de flores y detalles de entrega.
- **Data Centralizada:** La información de inventario (catálogo, testimonios, galería) está localizada y es fácil de mantener a través de un simple archivo modular (`js/data/floreria.js`).
- **Arquitectura CSS Modular:** Organizado a través del patrón `@import`, aislando tokens de diseño web moderno, tipografías e hitos de interfaz.
- **Optimización Local:** Metadatos estructurados en JSON-LD (Schema de Florist localBusiness) y Open Graph optimizados para indexación rápida.

---

## 🛠️ Stack Tecnológico

El proyecto se mantiene ligero y con alto rendimiento al utilizar únicamente tecnologías Core nativas:

- **HTML5:** Marcado semántico estructurado con buenas prácticas de SEO.
- **Vanilla CSS:** Variables nativas (`--rosa`, `--verde`), Grid, Flexbox y media queries. Uso exclusivo de CSS Modules organizados en un hub principal (`custom.css`).
- **Vanilla JavaScript:** 
  - Manejo de Eventos (`cart-updated`, Eventos de propagación).
  - Estado Reactivo básico pero robusto usando Patrón Observador (Subscribe / Notify).
  - ES6 Modules para separación de responsabilidades (`export / import`).

---

## 📂 Estructura del Proyecto

\`\`\`text
floreria2/
├── index.html                   # Entry point (Estructura de la landing page)
├── README.md                    # Documentación del código fuente
├── img/                         # Directorio para todos los assets e imágenes locales
│
├── css/
│   ├── custom.css               # Orchestrator principal que enlaza los módulos
│   ├── globals.css              # Variables de color, fuentes y animaciones 
│   ├── components.css           # Estilos de botones, modales y banners aislados 
│   ├── carrito.css              # Estilo exclusivo del Cajón/Drawer, Toast y Badge FAB
│   ├── sections.css             # Estilos de Secciones estándar (Beneficios, Mapa, Nosotros)
│   ├── hero.css                 # Portada principal animada
│   ├── servicioCatalogo.css     # Estilos condicionales de servicios con modales
│   └── seleccion.css            # Opciones de flores extras e UI 
│
└── js/
    ├── main.js                  # Inicializador del sistema y observadores (Intersecciones)
    ├── data/
    │   └── floreria.js          # DB Mock: Exporta productos, textos y configuraciones loc.
    └── modules/
        ├── carrito.js           # Core del Carrito: CartStore, Lógica de UI / Funcionalidad WhatsApp
        ├── map.js               # Opcional si se requiere custom mapping logic.
        ├── modal.js             # Módulo universal de Modales
        ├── progress.js          # Barra de Progreso de lectura del scroll
        ├── renderers.js         # Montadores que mapean el objeto de datos hacia HTML
        ├── seleccion.js         # Interacciones genéricas de elementos
        └── servicio-catalogo.js # Puertos para envío de servicios deferidos a Carrito Global
\`\`\`

---

## 💻 Instalación y Uso de Desarrollo

Ya que todo está construido desde componentes web básicos orientados al "Vanilla Way", para correrlo solo necesitas inicializar un servidor en la carpeta.

1. Abre tu terminal.
2. Navega a \`floreria2/\`.
3. Inicia un servidor local. Algunas opciones:
   - Con VS Code: Clic derecho + "Open with Live Server".
   - Con Python: Ejecutar \`python -m http.server 5500\`.
   - Con Node/npx: Ejecutar \`npx serve .\`.
4. Abre \`http://localhost:5500\` en tu navegador favorito.

---

## 🌿 Gestión de Contenido 

Toda la actualización de textos superficiales como el número de WhatsApp, ubicaciones de entrega (Ej. "Monterrey", "San Pedro"), testimoniales o actualización de nuevos arreglos florales ocurre en \`js/data/floreria.js\`. 

Si necesitas agregar un nuevo ramo:
1. Abre \`js/data/floreria.js\`.
2. Dirígete al arreglo \`productos\`.
3. Duplica uno de los diccionarios `{ ... }` e inserta los nuevos datos asegurando colocar correctamente la ruta a su imagen (\`imgUrl: 'img/nueva_flor.jpeg'\`).
4. Guarda y el front-end detectará y renderizará el nuevo componente automáticamente, con sus tags y enlace al sistema de compras!

