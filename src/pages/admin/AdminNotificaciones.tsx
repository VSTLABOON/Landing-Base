import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, ShieldAlert, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import { subscribeToPushNotifications } from '../../lib/pushNotifications';
import { toast } from '../../store/toastStore';
import { CARD } from './components/config/SharedUI';

export default function AdminNotificaciones() {
  const { tenant } = useTenant();
  const { profile } = useAuth();
  const tenantColor = tenant.color_primario || '#1a7f5a';

  // Configuración de canales (Email/WhatsApp simulado)
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(false);
  
  // Push Notifications (Integración real)
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushStatus, setPushStatus] = useState<NotificationPermission>('default');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPushStatus(Notification.permission);
      setPushEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handlePushToggle = async (checked: boolean) => {
    if (!('Notification' in window)) {
      toast.error('Navegador no compatible', {
        message: 'Tu navegador no es compatible con las notificaciones push.',
      });
      return;
    }

    if (!profile?.id || !tenant?.id) {
      toast.error('Sesión no válida', {
        message: 'No se pudo resolver la sesión actual.',
      });
      return;
    }

    if (checked) {
      setSubscribing(true);
      try {
        const success = await subscribeToPushNotifications(profile.id, tenant.id);
        setPushStatus(Notification.permission);
        if (success) {
          setPushEnabled(true);
          toast.success('Notificaciones activadas', {
            message: 'Este dispositivo recibirá alertas automáticas ante nuevos pedidos.',
          });
        } else {
          setPushEnabled(false);
          toast.warning('Permiso denegado', {
            message: 'Por favor habilita las notificaciones en los ajustes de tu navegador.',
          });
        }
      } catch (err) {
        setPushEnabled(false);
      } finally {
        setSubscribing(false);
      }
    } else {
      // Nota: El navegador no provee API directa para revocar permisos.
      // Le informamos al usuario cómo hacerlo manualmente.
      setPushEnabled(false);
      toast.info('Para desactivar por completo', {
        message: 'Puedes revocar el permiso de notificaciones haciendo clic en el candado al lado de la URL de tu navegador.',
      });
    }
  };

  const handleSaveConfig = () => {
    toast.success('Preferencias guardadas', {
      message: 'Tus canales de notificaciones se actualizaron correctamente.',
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">Centro de Notificaciones</h1>
        <p className="text-sm text-[var(--color-text-tertiary)]">
          Configura cómo y dónde quieres recibir las alertas de nuevos pedidos y reportes diarios.
        </p>
      </div>

      {/* Tarjeta de Canales */}
      <div className={`${CARD} p-6 space-y-6`}>
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--color-border-tertiary)]">
          <Bell className="w-5 h-5" style={{ color: tenantColor }} />
          <h2 className="text-base font-bold text-[var(--color-text-primary)]">Canales de Alerta</h2>
        </div>

        <div className="space-y-5">
          {/* Canales: Browser Push */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5">
                Notificaciones Push en Navegador
                {pushStatus === 'granted' && (
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5" /> Activo
                  </span>
                )}
              </span>
              <p className="text-xs text-[var(--color-text-tertiary)] max-w-md">
                Recibe alertas instantáneas en tu barra de notificaciones del sistema operativo ante cada nuevo pedido, incluso si tienes la pestaña cerrada.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={pushEnabled}
                disabled={subscribing}
                onChange={(e) => handlePushToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--color-background-tertiary)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--color-background-primary)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-background-primary)] after:border-[var(--color-border-secondary)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Canales: WhatsApp */}
          <div className="flex items-start justify-between gap-4 pt-4 border-t border-[var(--color-border-tertiary)]/50">
            <div className="space-y-1">
              <span className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5">
                Alertas vía WhatsApp
                <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  Nivel 2
                </span>
              </span>
              <p className="text-xs text-[var(--color-text-tertiary)] max-w-md">
                Envía notificaciones automáticas con los detalles de compra directo al número del negocio.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--color-background-tertiary)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--color-background-primary)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-background-primary)] after:border-[var(--color-border-secondary)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Canales: Email */}
          <div className="flex items-start justify-between gap-4 pt-4 border-t border-[var(--color-border-tertiary)]/50">
            <div className="space-y-1">
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">Alertas vía Correo Electrónico</span>
              <p className="text-xs text-[var(--color-text-tertiary)] max-w-md">
                Recibe resúmenes diarios de venta e informes semanales a tu cuenta registrada: <code className="text-[var(--color-text-primary)]">{profile?.email || 'admin@botaniq.com'}</code>.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--color-background-tertiary)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--color-background-primary)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-background-primary)] after:border-[var(--color-border-secondary)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Nota Explicativa */}
      {pushStatus === 'denied' && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 dark:border-amber-500/15 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300">Permisos bloqueados</h4>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
              Las notificaciones de navegador están denegadas en este dispositivo. Para recibirlas, debes restablecer los permisos haciendo clic en el icono del candado en la barra de direcciones de tu navegador y cambiar a "Permitir".
            </p>
          </div>
        </div>
      )}

      {/* Guardar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSaveConfig}
          style={{ backgroundColor: tenantColor, color: '#fff' }}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-97 transition-all shadow-sm focus:outline-none"
        >
          Guardar Preferencias
        </button>
      </div>
    </div>
  );
}
