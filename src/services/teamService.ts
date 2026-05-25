// ─── TEAM SERVICE — CAPA DE SERVICIO PARA GESTIÓN DE STAFF ──────
// Operaciones CRUD del equipo de trabajo vinculado a una tienda.
//
// ARQUITECTURA SEGURA:
//   - fetchTeamMembers:    SELECT perfiles WHERE tienda_id (anon key, RLS)
//   - createTeamMember:    ➜ Edge Function `create-team-member` (service_role
//                            encapsulada en el servidor; RBAC validado server-side)
//   - deactivateTeamMember: DELETE perfiles (anon key, RLS)
//
// La clave `service_role` NUNCA se expone al cliente. La Edge Function
// recibe el JWT del dueño y verifica el RBAC antes de crear el usuario.
// ────────────────────────────────────────────────────────────────

import { supabase } from '../lib/supabaseClient';
import type { UserRole } from '../types';

// ── Interfaces del módulo ────────────────────────────────────────

export interface TeamMember {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  avatar_url: string | null;
  created_at: string;       // ISO 8601
  is_active: boolean;
}

export interface CreateMemberPayload {
  nombre: string;
  email: string;
  tempPassword: string;
  rol: UserRole;
}

// ── Funciones del servicio ───────────────────────────────────────

/**
 * Obtiene la lista de miembros del equipo de una tienda.
 * Consulta la tabla `perfiles` filtrada por tienda_id.
 */
export async function fetchTeamMembers(tiendaId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('id, nombre_completo, rol, avatar_url, updated_at')
    .eq('tienda_id', tiendaId)
    .order('updated_at', { ascending: true });

  if (error) throw error;

  // Mapear columnas de BD al tipo TeamMember.
  // 'email' no está en la tabla perfiles (vive en auth.users).
  // Para mostrarlo se necesitaría una RPC o un JOIN server-side.
  return (data || []).map((row) => ({
    id: row.id,
    nombre: row.nombre_completo || 'Sin nombre',
    email: '',
    rol: row.rol as UserRole,
    avatar_url: row.avatar_url,
    created_at: row.updated_at || new Date().toISOString(),
    is_active: true,
  }));
}

/**
 * Crea un nuevo miembro del equipo vía la Edge Function `create-team-member`.
 *
 * FLUJO SEGURO:
 *   1. Obtiene el JWT del dueño autenticado desde la sesión activa.
 *   2. Envía el payload a la Edge Function (no al cliente Auth de Supabase).
 *   3. La Edge Function verifica RBAC (el solicitante debe ser dueño de la
 *      tienda), crea el usuario con `auth.admin` (service_role) y vincula
 *      el perfil.
 *   4. La service_role key NUNCA sale del servidor.
 */
export async function createTeamMember(
  tiendaId: string,
  payload: CreateMemberPayload,
): Promise<TeamMember> {
  // Validación client-side básica (el servidor vuelve a validar)
  if (!payload.email.includes('@')) {
    throw new Error('Email inválido.');
  }
  if (payload.tempPassword.length < 6) {
    throw new Error('La contraseña temporal debe tener al menos 6 caracteres.');
  }

  // Obtener el JWT del dueño para autenticar la llamada a la Edge Function
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('No hay una sesión activa. Por favor, inicia sesión.');
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const functionUrl = `${supabaseUrl}/functions/v1/create-team-member`;

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      tienda_id: tiendaId,
      nombre: payload.nombre,
      email: payload.email,
      password: payload.tempPassword,
      rol: payload.rol,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Propagar el mensaje de error del servidor
    throw new Error(data.error || `Error ${response.status} al crear el miembro.`);
  }

  return {
    id: data.id,
    nombre: data.nombre,
    email: data.email,
    rol: data.rol as UserRole,
    avatar_url: null,
    created_at: new Date().toISOString(),
    is_active: true,
  };
}

/**
 * Desactiva (soft-delete) un miembro del equipo.
 * Elimina su fila de perfiles (el usuario Auth sigue existiendo
 * pero no tendrá perfil asociado a la tienda).
 */
export async function deactivateTeamMember(memberId: string): Promise<void> {
  const { error } = await supabase
    .from('perfiles')
    .delete()
    .eq('id', memberId);

  if (error) throw error;
}
