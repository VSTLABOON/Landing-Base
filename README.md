# 🌸 Flores del Corazón | E-commerce Frontend Architecture

![React](https://img.shields.io/badge/React-18.3-blue.svg?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF.svg?style=flat&logo=vite)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4.svg?style=flat&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Multi--tenant-3ECF8E.svg?style=flat&logo=supabase)

**Flores del Corazón** es una plataforma e-commerce (SPA) diseñada para el sector floral de lujo en Monterrey. Arquitectura multi-tenant con Supabase, doble flujo de checkout (WhatsApp + Pago formal) y feature flags controlados por variables de entorno.

---

## 🏗 Arquitectura y Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18 + Vite |
| **Estilos** | Tailwind CSS v4 (`@theme` en `index.css`) |
| **Estado** | React Context API (`CartContext.jsx`) |
| **Backend** | Supabase (PostgreSQL + Edge Functions + RLS) |
| **Checkout** | Dual: Edge Function `procesar-venta` + WhatsApp directo |
| **Multi-tenant** | Aislamiento por `tienda_id` con Row Level Security |

### Estructura de Directorios

```text
floreria2/
├── src/
│   ├── components/
│   │   ├── layout/         # Header, Footer
│   │   ├── sections/       # Hero, Catalogo, Servicios, Testimonios,
│   │   │                   # Beneficios, Flores, Cobertura, Nosotros,
│   │   │                   # Galeria, InstagramFeed
│   │   └── ui/             # CartDrawer, Modal, ProductoCard,
│   │                       # CategorySlider, BotonCheckout, GlobalFeatures
│   ├── context/            # CartContext (estado del carrito)
│   ├── hooks/              # usePublicCatalog (fetch multi-tenant)
│   ├── lib/                # supabaseClient.js
│   ├── data/               # floreria.js (fallback local)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css           # Tailwind v4 @theme + keyframes + utilidades
├── supabase/
│   ├── config.toml         # Configuración local de Supabase CLI
│   ├── schema.sql          # RLS para tiendas y productos
│   ├── instagram_cache.sql # Tabla de caché de Instagram + tokens
│   └── functions/
│       ├── procesar-venta/ # Edge Function de checkout
│       └── sync-instagram/ # Edge Function de caché de Instagram
├── .env.example            # Template de variables de entorno
├── .gitignore              # Protección de .env y node_modules
└── README.md               # Este archivo
```

---

## ⚡ Inicio Rápido

```bash
# 1. Clonar e instalar
git clone <tu-repo>
cd floreria2
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase y feature flags

# 3. Ejecutar en desarrollo
npm run dev
```

> **Nota:** Vite necesita reiniciarse cada vez que se modifica el `.env`.

---

## 🎛 Configuración de Despliegue y Feature Flags

El `CartDrawer` (panel lateral de pedidos) soporta **dos flujos de checkout independientes** que se controlan sin tocar código, directamente desde el archivo `.env`:

### Variables de Entorno

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `VITE_SUPABASE_URL` | string | — | URL de tu proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | string | — | Clave anónima pública de Supabase |
| `VITE_ENABLE_CHECKOUT` | `"true"` / `"false"` | `"false"` | Habilita el botón "Pagar ahora" (Edge Function) |
| `VITE_ENABLE_WHATSAPP` | `"true"` / `"false"` | `"false"` | Habilita el botón "Pedido por WhatsApp" |
| `VITE_STORE_SLUG` | string | `"flores-del-corazon"` | Slug de la tienda para consultas multi-tenant |
| `VITE_STORE_CITY` | string | `"Monterrey"` | Ciudad donde opera la florería |
| `VITE_STORE_STATE` | string | `"Nuevo León"` | Estado/Provincia de la florería |
| `VITE_STORE_METRO_AREA` | string | `"área metropolitana de Monterrey"` | Texto para describir el área de cobertura |
| `VITE_STORE_MAP_URL` | string | URL | Link (embed) de Google Maps para la sección Cobertura |

### Escenarios de Despliegue

#### Escenario 1: Solo WhatsApp (Negocio nuevo sin pasarela de pago)
```env
VITE_ENABLE_CHECKOUT=false
VITE_ENABLE_WHATSAPP=true
```
El drawer mostrará **un solo botón** verde sólido de WhatsApp. Ideal para florerías que recién arrancan y manejan todo por chat.

#### Escenario 2: Solo Checkout (Negocio automatizado)
```env
VITE_ENABLE_CHECKOUT=true
VITE_ENABLE_WHATSAPP=false
```
El drawer mostrará solo el botón "Pagar ahora" que invoca la Edge Function `procesar-venta`. El flujo de WhatsApp queda completamente oculto.

#### Escenario 3: Ambos activos (Recomendado)
```env
VITE_ENABLE_CHECKOUT=true
VITE_ENABLE_WHATSAPP=true
```
El drawer muestra ambos botones con un separador visual "o" entre ellos. El checkout formal aparece como botón principal (verde sólido) y WhatsApp como secundario (outline). Permite al cliente elegir según su preferencia.

### ⚠️ Cómo Funciona Internamente

Vite expone las variables `VITE_*` como **strings** (no booleanos) en `import.meta.env`. El archivo `CartDrawer.jsx` las parsea así:

```js
const features = {
  enableCheckout: import.meta.env.VITE_ENABLE_CHECKOUT === 'true',
  enableWhatsApp: import.meta.env.VITE_ENABLE_WHATSAPP === 'true',
};
```

Si una variable **no existe** en el `.env`, `import.meta.env.VITE_ENABLE_X` es `undefined`, y `undefined === 'true'` da `false`. Esto garantiza un **"apagado seguro"**: si olvidas configurar el `.env`, ningún flujo se activa por accidente.

---

## 🛡️ Blindaje Técnico y Seguridad (QA)

| Riesgo | Solución Implementada |
|---|---|
| **Z-Index Wars** | Jerarquía estricta: Modal (`10000`) > CartDrawer (`9991`) > Header (`900`) |
| **Memory Leaks** | Cleanup de `setInterval` y event listeners en `useEffect` |
| **Token Exposure** | Tokens (Stripe, IG) viven en Edge Functions o DB con RLS, **nunca** en el cliente. El `.env` está en `.gitignore`. |
| **CORS Abierto** | Edge Function `procesar-venta` restringida por dominios válidos vía variable secreta `ALLOWED_ORIGIN`. |
| **Invocación no autorizada** | Edge Function verifica el JWT (`Authorization: Bearer anon_key`), rechaza peticiones sin token. |
| **Manipulación de Precios** | El frontend solo envía IDs. El backend **recalcula el total** consultando los precios reales en la base de datos (evita hackeo de precio a $1). |

---

## 🏢 Flujo Multi-tenant: ¿Cómo vender esto a múltiples florerías?

Esta arquitectura está diseñada **específicamente** para que puedas vender la misma aplicación a diferentes clientes sin tener que crear una base de datos nueva para cada uno. Todo vive en un solo proyecto de Supabase.

### 1. El Modelo de Datos Central
En Supabase, tienes una tabla principal llamada `tiendas`:
- `id`: UUID (ej. `123e4567-e89b-12d3...`)
- `slug`: TEXT (ej. `flores-del-corazon`, `floreria-la-rosa`, `boutique-floral-mty`)
- `nombre`: TEXT

Y una tabla de `productos`:
- `id`: UUID
- `tienda_id`: UUID (Llave foránea hacia `tiendas.id`)
- `nombre`, `precio`, `imagen`, etc.

### 2. Despliegue para un Cliente Nuevo (El flujo del Vendedor)
Cuando le vendes la página a una nueva florería (ej. "Boutique Floral Mty"), este es tu proceso:

1. **En Supabase:** 
   Agregas una fila en `tiendas` con el slug `boutique-floral-mty`.
   Agregas sus productos vinculados a ese `tienda_id`.
   Configuras sus credenciales de Instagram/Stripe usando el `tienda_id`.

2. **En Vercel/Netlify (Despliegue del Frontend):**
   Clonas este repositorio. Configuras las variables de entorno de ese despliegue:
   ```env
   # Backend Maestro
   VITE_SUPABASE_URL=https://TU-PROYECTO-UNICO.supabase.co
   VITE_SUPABASE_ANON_KEY=TU-CLAVE-ANON-UNICA
   
   # Aislamiento de datos
   VITE_STORE_SLUG=boutique-floral-mty
   
   # Localización (La magia del SaaS)
   VITE_STORE_CITY="Monterrey"
   VITE_STORE_STATE="Nuevo León"
   VITE_STORE_METRO_AREA="área metropolitana de Monterrey"
   VITE_STORE_MAP_URL="<link-embed-google-maps>"
   ```
   *Nota: Vite inyectará la ciudad automáticamente en el `<title>` de la página, en los metadatos SEO y en todos los textos de la plataforma.*

### 3. ¿Qué Credenciales Van en Dónde?

- **Variables de Entorno Frontend (`.env`):**
  **TODOS tus clientes usan el MISMO `VITE_SUPABASE_URL` y la MISMA `VITE_SUPABASE_ANON_KEY`.**
  Estas claves son "públicas" y solo sirven para leer. El verdadero aislamiento ocurre gracias a que cada despliegue tiene un `VITE_STORE_SLUG` diferente. El código hace: "Dame el catálogo de los productos donde la tienda tenga este slug".

- **Secretos del Servidor (Supabase Secrets):**
  Las claves maestras (`STRIPE_SECRET_KEY`, etc.) se guardan usando el CLI de Supabase:
  `npx supabase secrets set STRIPE_SECRET_KEY=sk_live...`
  Estos secretos **nunca** se ponen en el `.env` del frontend. Las Edge Functions leen estos secretos y procesan las ventas de forma segura.

### Ventajas de este Modelo:
1. **Mantenimiento Centralizado:** Si arreglas un bug en el carrito, haces `git push` y se actualiza para todas tus florerías.
2. **Costos Reducidos:** Solo pagas un servidor de base de datos (Supabase), no uno por cliente.
3. **Escalabilidad:** Puedes tener 100 florerías operando; los datos de una nunca se mezclarán con los de otra gracias al Row Level Security (RLS) que ya configuramos.

---

## 🔐 Supabase Edge Functions

### Desplegar funciones
```bash
npx supabase functions deploy procesar-venta
npx supabase functions deploy sync-instagram --no-verify-jwt
```

### Guardar secretos de servidor (NO para el .env del frontend)
```bash
npx supabase secrets set ALLOWED_ORIGIN=https://tu-dominio.com
npx supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
```

---

## 🚀 Próximos Pasos

1. **Stripe:** Integrar `paymentIntents` dentro de `procesar-venta` usando la llave secreta.
2. **PWA:** `vite-plugin-pwa` para instalación nativa en móviles.
3. **SEO:** `react-helmet-async` para metadatos dinámicos por tienda.
4. **Panel de Admin:** Crear un dashboard interno para que tú o tus clientes gestionen sus catálogos.
