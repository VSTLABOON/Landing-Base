import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import type { UserRole } from '../../types';
import { supabase } from '../../lib/supabaseClient';

interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
}

export default function RoleProtectedRoute({ allowedRoles, children }: RoleProtectedRouteProps) {
  const { session, profile, isLoading } = useAuth();
  const { tenant, loading: tenantLoading } = useTenant();

  if (isLoading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background-secondary)]">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-verde" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeLinecap="round" />
          </svg>
          <p className="text-[var(--color-text-tertiary)] font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no hay sesión activa, redirigir al login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // 3. Verificar si el usuario tiene el rol permitido Y pertenece a esta tienda específica
  // Excepción 1: superadmin tiene acceso global.
  // Excepción 2: la zona de cliente (/mi-cuenta) es accesible para TODOS los usuarios logueados,
  // ya que el dueño de una tienda puede comprar como cliente en otra.
  const isSuperAdmin = profile?.rol === 'superadmin';
  const isCustomerRoute = allowedRoles.length === 1 && allowedRoles[0] === 'cliente';
  const belongsToThisShop = profile?.tienda_id === tenant?.id;
  
  const hasAccess = 
    isSuperAdmin || 
    isCustomerRoute || 
    (belongsToThisShop && allowedRoles.includes(profile?.rol as UserRole));

  if (!profile || !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background-secondary)] p-6">
        <div className="bg-[var(--color-background-primary)] p-8 rounded-xl shadow-sm border border-red-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Acceso Denegado</h2>
          <p className="text-[var(--color-text-tertiary)] text-sm mb-6">
            {!belongsToThisShop && profile?.rol !== 'superadmin'
              ? 'Este usuario no pertenece a esta florería.'
              : `No tienes los permisos necesarios. Rol actual: ${profile?.rol || 'Ninguno'}`}
          </p>
          <div className="flex flex-col gap-2">
            <a href="/" className="inline-block bg-[var(--color-text-primary)] text-[var(--color-background-primary)] px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--color-text-primary)] transition-colors w-full">
              Volver al inicio
            </a>
            <button
              onClick={async () => {
                try {
                  await supabase.auth.signOut();
                } catch (err) {
                  console.error('Error signing out:', err);
                } finally {
                  window.location.href = '/login';
                }
              }}
              className="inline-block border border-gray-300 text-[var(--color-text-secondary)] px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--color-background-secondary)] transition-colors w-full mt-1"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si todo está bien, renderizar los hijos (si se usa como wrapper) o la salida (si se usa como Layout)
  return children ? <>{children}</> : <Outlet />;
}
