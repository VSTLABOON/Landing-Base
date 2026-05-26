import { z } from 'zod';

// ── Helpers ────────────────────────────────────────────────────────

const safeString = z.string().trim();
const safeStringMinMax = (min: number, max: number, minMsg?: string, maxMsg?: string) => 
  z.string().trim().min(min, minMsg).max(max, maxMsg);
const safeStringMin = (min: number, minMsg?: string) => 
  z.string().trim().min(min, minMsg);

const mxPhoneRegex = /^[0-9]{10}$/;

// ── Google Maps Allowlist Validation ─────────────────────────────
const isValidGoogleMapsUrl = (url: string): boolean => {
  if (!url) return true; // Permite vacío si no es obligatorio
  const lower = url.toLowerCase().trim();
  return lower.startsWith('https://maps.google.com/') ||
         lower.startsWith('https://www.google.com/maps/') ||
         lower.startsWith('https://google.com/maps/') ||
         lower.startsWith('https://goo.gl/maps/');
};

// ── Schemas de Dominio ───────────────────────────────────────────

export const TenantConfigSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  nombre: safeStringMinMax(1, 100, "El nombre de la tienda es requerido", "El nombre no puede exceder 100 caracteres"),
  color_primario: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Formato de color primario inválido"),
  color_secundario: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Formato de color secundario inválido"),
  color_acento: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Formato de color acento inválido"),
  font_family: z.string().optional().default('Inter'),
  texto_nosotros: z.string().max(1000, "El texto de Nosotros no puede exceder los 1000 caracteres").optional().or(z.literal('')),
  anio_fundacion: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  firma: z.string().max(100, "La firma no puede exceder 100 caracteres").optional().or(z.literal('')),
  mapa_url: z.string().url("URL de mapa inválida").refine(isValidGoogleMapsUrl, {
    message: "El enlace del mapa debe ser una dirección válida de Google Maps (https://maps.google.com, https://www.google.com/maps, etc.)"
  }).optional().or(z.literal('')),
  direccion: z.string().max(200, "La dirección no puede exceder 200 caracteres").optional().or(z.literal('')),
  meta_title: z.string().max(60, "El título de pestaña no puede exceder los 60 caracteres").optional().or(z.literal('')),
  zonas_envio: z.array(
    z.object({
      nombre: z.string().trim().min(1, "El nombre de la zona es obligatorio"),
      costo: z.number().nonnegative("El costo de la zona debe ser mayor o igual a 0")
    })
  ).optional(),
});

export const ProductoItemSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().nullable().optional(),
  quantity: z.number().int().positive(),
});

export const PedidoEnvioSchema = z.object({
  recipientName: z.string().trim().min(2, "El nombre del destinatario debe tener al menos 2 caracteres").max(100),
  recipientPhone: z.string().trim().regex(/^[0-9\s+-]{10,15}$/, "El teléfono debe tener entre 10 y 15 dígitos"),
  deliveryAddress: z.string().trim().min(10, "Proporciona una dirección de entrega completa (mínimo 10 caracteres)").max(300),
  deliveryDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (debe ser YYYY-MM-DD)"),
  customMessage: z.string().trim().max(120, "El mensaje de la tarjeta no puede exceder 120 caracteres").optional().or(z.literal('')),
  zonaEnvio: z.string().trim().optional(),
});

export const PedidoCheckoutSchema = z.object({
  tenant_id: z.string().uuid(),
  items: z.array(ProductoItemSchema).min(1, "El carrito no puede estar vacío"),
  success_url: z.string().url(),
  cancel_url: z.string().url(),
});

// Inferred Types
export type TenantConfigType = z.infer<typeof TenantConfigSchema>;
export type PedidoEnvioType = z.infer<typeof PedidoEnvioSchema>;
export type PedidoCheckoutType = z.infer<typeof PedidoCheckoutSchema>;

