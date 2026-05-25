import { z } from 'zod';
import DOMPurify from 'dompurify';

// ── Helpers ────────────────────────────────────────────────────────

// Limpia el HTML para prevenir XSS antes de que entre a la base de datos
const safeString = z.string().transform((val) => DOMPurify.sanitize(val));
const safeStringMinMax = (min: number, max: number, minMsg?: string, maxMsg?: string) => 
  z.string().min(min, minMsg).max(max, maxMsg).transform((val) => DOMPurify.sanitize(val));
const safeStringMin = (min: number, minMsg?: string) => 
  z.string().min(min, minMsg).transform((val) => DOMPurify.sanitize(val));

const mxPhoneRegex = /^[0-9]{10}$/;

// ── Schemas de Dominio ───────────────────────────────────────────

export const TenantConfigSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  nombre: safeString.refine((s) => s.length > 0 && s.length <= 100),
  color_primario: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  color_secundario: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  color_acento: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  ciudad: safeString,
  estado: safeString,
  area_metropolitana: safeString,
  currency: z.enum(['mxn', 'usd']).default('mxn'),
  whatsapp_number: z.string().regex(mxPhoneRegex).optional().or(z.literal('')),
  instagram_url: z.string().url().optional().or(z.literal('')),
  facebook_url: z.string().url().optional().or(z.literal('')),
  subscription_level: z.number().int().min(0).max(3).default(1), // Referencia: SubscriptionLevel Enum (0=Blocked, 1=Básico, 2=Pro, 3=Premium)
  secciones: z.object({
    hero: z.object({
      titulo: safeString,
      subtitulo: safeString,
      trust_bar: safeString,
    }).optional(),
    // otros configuraciones se pueden agregar aquí
  }).optional(),
  eventos: z.object({
    fecha_fin: z.string().datetime({ offset: true }).optional(), // ISO 8601 with timezone
    texto: safeString.optional(),
    activo: z.boolean().default(false),
  }).optional(),
});

export const ProductoItemSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().nullable().optional(),
  quantity: z.number().int().positive(),
});

export const PedidoEnvioSchema = z.object({
  recipientName: safeStringMin(2, "El nombre debe tener al menos 2 caracteres"),
  customMessage: safeStringMinMax(0, 300, undefined, "El mensaje no puede exceder 300 caracteres").optional(),
  deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido"), // YYYY-MM-DD
  address: safeStringMin(10, "Proporciona una dirección completa"),
});

export const PedidoCheckoutSchema = z.object({
  tenant_id: z.string().uuid(),
  items: z.array(ProductoItemSchema).min(1, "El carrito no puede estar vacío"),
  success_url: z.string().url(),
  cancel_url: z.string().url(),
});

// Infered Types
export type TenantConfigType = z.infer<typeof TenantConfigSchema>;
export type PedidoEnvioType = z.infer<typeof PedidoEnvioSchema>;
export type PedidoCheckoutType = z.infer<typeof PedidoCheckoutSchema>;
