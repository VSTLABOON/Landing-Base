// ─── STRUCTURED LOGGER ──────────────────────────────────────────
// Reemplaza todos los console.log/warn/error del proyecto.
//
// Comportamiento:
//   • Desarrollo: console output con colores y formato legible
//   • Producción: JSON estructurado, errores → tabla system_logs
//
// SEGURIDAD: Nunca loggear passwords, tokens, datos de tarjeta,
// ni datos personales completos (teléfonos, emails).
// ────────────────────────────────────────────────────────────────

import { supabase } from './supabaseClient';

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  nivel: LogLevel;
  timestamp: string;
  evento: string;
  usuarioId?: string;
  tenantId?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

const IS_PROD = typeof import.meta !== 'undefined' && import.meta.env?.PROD === true;

// ── Colores para desarrollo ──────────────────────────────────────
const DEV_STYLES: Record<LogLevel, string> = {
  info:  'color: #10b981; font-weight: bold;',
  warn:  'color: #f59e0b; font-weight: bold;',
  error: 'color: #ef4444; font-weight: bold;',
};

const DEV_PREFIXES: Record<LogLevel, string> = {
  info:  'ℹ️',
  warn:  '⚠️',
  error: '❌',
};

// ── Sanitización de datos sensibles ──────────────────────────────
function sanitize(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!metadata) return undefined;

  const SENSITIVE_KEYS = ['password', 'token', 'secret', 'key', 'tarjeta', 'card', 'cvv', 'pin'];
  const sanitized = { ...metadata };

  for (const k of Object.keys(sanitized)) {
    if (SENSITIVE_KEYS.some(sk => k.toLowerCase().includes(sk))) {
      sanitized[k] = '[REDACTED]';
    }
    // Redactar emails parcialmente
    if (k.toLowerCase().includes('email') && typeof sanitized[k] === 'string') {
      const email = sanitized[k] as string;
      const [local, domain] = email.split('@');
      if (domain) {
        sanitized[k] = `${local.slice(0, 2)}***@${domain}`;
      }
    }
    // Redactar teléfonos parcialmente
    if (k.toLowerCase().includes('phone') || k.toLowerCase().includes('telefono')) {
      if (typeof sanitized[k] === 'string') {
        const phone = sanitized[k] as string;
        sanitized[k] = phone.slice(0, 4) + '****' + phone.slice(-2);
      }
    }
  }
  return sanitized;
}

// ── Persistencia de errores en producción ────────────────────────
async function persistError(entry: LogEntry): Promise<void> {
  try {
    await supabase.from('system_logs').insert({
      nivel: entry.nivel,
      evento: entry.evento,
      usuario_id: entry.usuarioId ?? null,
      tenant_id: entry.tenantId ?? null,
      metadata: entry.metadata ?? null,
      error_message: entry.error ?? null,
      created_at: entry.timestamp,
    });
  } catch {
    // Silently fail — logging should never break the app
  }
}

// ── API Pública ──────────────────────────────────────────────────

function log(
  level: LogLevel,
  evento: string,
  options?: {
    metadata?: Record<string, unknown>;
    error?: Error | string;
    usuarioId?: string;
    tenantId?: string;
  }
): void {
  const entry: LogEntry = {
    nivel: level,
    timestamp: new Date().toISOString(),
    evento,
    usuarioId: options?.usuarioId,
    tenantId: options?.tenantId,
    metadata: sanitize(options?.metadata),
    error: options?.error instanceof Error ? options.error.message : options?.error,
  };

  if (!IS_PROD) {
    // ── Desarrollo: output legible con colores ──────────────────
    const prefix = DEV_PREFIXES[level];
    const style = DEV_STYLES[level];
    const parts: unknown[] = [`%c${prefix} [${evento}]`, style];

    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      parts.push(entry.metadata);
    }
    if (entry.error) {
      parts.push(`\n   Error: ${entry.error}`);
    }

    if (level === 'error') {
      console.error(...parts);
    } else if (level === 'warn') {
      console.warn(...parts);
    } else {
      console.log(...parts);
    }
  } else {
    // ── Producción: JSON estructurado ────────────────────────────
    const jsonStr = JSON.stringify(entry);
    if (level === 'error') {
      console.error(jsonStr);
      // Persist errors to system_logs table
      persistError(entry);
    } else if (level === 'warn') {
      console.warn(jsonStr);
    }
    // info logs are silenced in production
  }
}

export const logger = {
  info: (evento: string, metadata?: Record<string, unknown>) =>
    log('info', evento, { metadata }),

  warn: (evento: string, metadata?: Record<string, unknown>) =>
    log('warn', evento, { metadata }),

  error: (
    evento: string,
    error?: Error | string,
    metadata?: Record<string, unknown>
  ) => log('error', evento, { error, metadata }),

  /** Variant with full context (userId, tenantId) */
  withContext: (context: { usuarioId?: string; tenantId?: string }) => ({
    info: (evento: string, metadata?: Record<string, unknown>) =>
      log('info', evento, { ...context, metadata }),
    warn: (evento: string, metadata?: Record<string, unknown>) =>
      log('warn', evento, { ...context, metadata }),
    error: (evento: string, error?: Error | string, metadata?: Record<string, unknown>) =>
      log('error', evento, { ...context, error, metadata }),
  }),
};
