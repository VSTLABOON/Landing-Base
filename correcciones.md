# Auditoría General de Funcionalidades — Bug Fix Sprint

Este archivo documenta el progreso de la resolución de bugs críticos.

## [X] BUG 1 — Error al dar de alta un producto (CRÍTICO)
- **Diagnóstico:** El frontend fallaba al hacer POST a `/rest/v1/productos` con un error 400 (Bad Request) y RLS bloqueaba inserts.
- **Causa Raíz:** 
  1. La columna `slug` de la tabla `productos` no existía remotamente porque su migración fue omitida por CLI (no tenía prefijo numérico).
  2. Las políticas RLS de `productos` y `variantes` hacían referencia a una columna `owner_id` inexistente en la tabla `tiendas` en lugar de validar a través de la tabla `perfiles`.
- **Fix Aplicado:** 
  1. Se renombraron las migraciones y se forzó su despliegue, añadiendo la columna `slug` (con `IF NOT EXISTS`).
  2. Se creó la migración `20260511000007_fix_productos_rls.sql` con políticas RLS reescritas usando un JOIN a `perfiles`.
- **Estado:** ✅ Resuelto. El catálogo ahora guarda correctamente.

---
## [X] BUG 2 — Alertas nativas del navegador en lugar de Toasts
- **Diagnóstico:** Se encontraron ocurrencias de `window.alert` y `window.confirm` en `CartDrawer`, `SuperadminSuscripciones`, `AdminEquipo`, y `AdminProductos`.
- **Fix Aplicado:** 
  1. Se creó el componente `<ConfirmDialog />` accesible y animado con Framer Motion.
  2. Se reemplazaron todas las alertas nativas con `toast.error` y `toast.success`.
  3. Se reemplazaron todas las confirmaciones con el nuevo estado y componente `ConfirmDialog`.
- **Estado:** ✅ Resuelto. Todo usa el sistema de notificaciones.

---
## [X] BUG 3 — Preview en tiempo real no refleja cambios
- **Diagnóstico:** El Store Builder (`AdminConfiguracion.tsx`) no tenía implementado un iframe de vista previa en tiempo real.
- **Fix Aplicado:** 
  1. Se añadió un `<iframe id="preview-iframe" src="/?preview=true">` estructurado a la derecha en pantallas grandes (`xl:w-[400px]`).
  2. Se añadió un `useEffect` que intercepta los cambios del draft y manda `postMessage({ type: 'UPDATE_PREVIEW', payload })`.
  3. Se añadió un `window.addEventListener('message')` en `TenantContext.tsx` que aplica las actualizaciones optimistas a la variable de contexto sin tocar la base de datos.
- **Estado:** ✅ Resuelto. La landing page se actualiza en tiempo real mientras se edita.

---
## [X] BUG 4 — Botón de WhatsApp no funciona
- **Diagnóstico:** Múltiples problemas encontrados:
  1. `CartDrawer` usaba `tenant.whatsapp` (número crudo), mientras `ProductDetailPage`, `CategorySlider`, `Modal` y `Footer` usaban `tenant.wa_base` (URL completa). Los dos campos podían desincronizarse.
  2. El fallback `0000000000` provocaba que se abriera una URL inválida de WhatsApp sin feedback al usuario.
  3. Ningún componente validaba que el número fuera real antes de intentar abrir el enlace.
- **Fix Aplicado:**
  1. Todos los componentes ahora derivan la URL `https://wa.me/{número}` directamente de `tenant.whatsapp`, eliminando la dependencia de `wa_base` en la capa de UI.
  2. Se limpian caracteres no numéricos con `.replace(/\D/g, '')` antes de construir el enlace.
  3. Se valida que el número no sea el fallback y tenga ≥10 dígitos. Si falla: `CartDrawer` y `ProductDetailPage` muestran `toast.error`, `CategorySlider` ignora silenciosamente, `Modal` oculta el botón, `Footer` no renderiza el link.
- **Archivos:** `CartDrawer.jsx`, `ProductDetailPage.tsx`, `CategorySlider.jsx`, `Modal.jsx`, `Footer.jsx`
- **Estado:** ✅ Resuelto.

---
## [X] BUG 5 — Botón de pago no funciona
- **Diagnóstico:** Múltiples desalineaciones entre el código y la base de datos:
  1. **Webhook** insertaba `cliente_id` en `pedidos`, pero la columna real es `usuario_id`. Todos los pagos fallarían silenciosamente.
  2. **Edge Function** (`create-checkout-session`) consultaba `precio_modificador` en `producto_variantes`, pero la columna real es `modificador_precio`. Las variantes no aplicarían su sobreprecio.
  3. **RLS** de `pedidos` usaba `rol = 'owner'` (inglés) en vez de `'dueño'` (español). Los dueños no podían actualizar el estado de los pedidos.
  4. **Notificaciones** insertaban un campo `metadata` JSONB que no existía en la tabla.
  5. **CustomerAccountPage** consultaba `.eq('cliente_id')` en vez de `.eq('usuario_id')`. Los clientes nunca verían sus pedidos.
  6. **CartDrawer** seteaba `checkoutError` en estado pero nunca lo mostraba al usuario (sin toast).
- **Fix Aplicado:**
  1. Webhook: `cliente_id` → `usuario_id`.
  2. Edge Function: `precio_modificador` → `modificador_precio`.
  3. Migración `20260511200000_fix_pedidos_rls_role.sql`: recrea la política con `rol IN ('dueño', 'superadmin')`.
  4. Migración añade `ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS metadata JSONB`.
  5. CustomerAccountPage: `.eq('cliente_id')` → `.eq('usuario_id')`.
  6. CartDrawer: añadido `toast.error()` en catch del checkout.
- **Estado:** ✅ Resuelto.

---
## [X] BUG 6 — Bugs en el Hero
- **Diagnóstico:**
  1. Imagen de fondo hardcodeada a `img/stranger-things.jpeg` — un placeholder de desarrollo que no es dinámico por tenant.
  2. `AnimatedCounter` para "Años de experiencia" hacía `getFullYear() - tenant.anio_fundacion` sin guard, produciendo `NaN` si el campo era `null/undefined`.
- **Fix Aplicado:**
  1. El Hero ahora usa `tenant.secciones.hero.imagen_fondo` como fuente de la imagen. Si no existe, muestra un gradiente atractivo `from-verde-dark via-negro to-rosa/20` como fallback.
  2. Se añadió `Math.max(0, ...)` y fallback `|| new Date().getFullYear()` para proteger contra `NaN`.
- **Estado:** ✅ Resuelto.

---
## 🔴 ESTADO ACTUAL: AUDITORÍA GENERAL
## [X] AUDITORÍA GENERAL — Checklist de funcionalidades
- **Frontend / Storefront:**
  - `StorefrontPage` audita dinámicamente las secciones de acuerdo al `config_ui`
  - Componentes estáticos protegidos contra crash de null properties (`Nosotros.jsx`, `Hero.jsx`)
  - Enlaces de WhatsApp con fallback y validación en todos los módulos
  - `ProductoCard` formateando precios dinámicamente según la tabla `productos` del Tenant.
- **Admin Panel:**
  - Layout y Routing: OK (RoleProtectedRoute controla acceso correctamente)
  - `AdminDashboardPage`: Maneja tolerancias de fallback para campos vacíos (ej. `cliente_nombre`)
  - `AdminPedidos`: Tolerante a nulls/undefs en campos y fallback en `datos_envio`.
  - `AdminEquipo`: Flujo estable. (Nota técnica: requiere service_role en el backend para auth.users real).
- **Backend / Auth:**
  - Webhooks de Stripe configurados a base de id correcta (`usuario_id`)
  - `LoginPage`: OK, controlando navegación cruzada entre Tenant Owner/Customer
- **Estado Global:** ✅ Resuelto. ¡Plataforma lista!
