import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { logger } from '../lib/logger';

// Pre-instanciar el sonido de notificación una sola vez en el ámbito de módulo
const notificationAudio = typeof Audio !== 'undefined' ? new Audio('/notification.mp3') : null;
if (notificationAudio) {
  notificationAudio.volume = 0.5;
}

export function useNotifications(tenantId?: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<any[]>([]);

  useEffect(() => {
    if (!tenantId) return;
    let active = true;

    // 1. Obtener el conteo inicial de notificaciones no leídas
    const fetchUnread = async () => {
      try {
        const { data, count } = await supabase
          .from('notificaciones')
          .select('*', { count: 'exact' })
          .eq('tienda_id', tenantId)
          .order('created_at', { ascending: false })
          .limit(20);
        if (active) {
          if (count !== null) setUnreadCount((data || []).filter((n: any) => !n.leida).length);
          if (data) setNotifications(data);
        }
      } catch {
        // Tabla puede no existir aún — no es crítico
      }
    };
    fetchUnread();

    // 2. Suscribirse a INSERTS en la tabla notificaciones
    const channel = supabase
      .channel('admin-notificaciones')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones',
          filter: `tienda_id=eq.${tenantId}`,
        },
        (payload) => {
          const newNoti = payload.new;
          logger.info('🔔 [Realtime] Nueva notificación:', newNoti);
          
          if (active) {
            setUnreadCount((prev) => prev + 1);
            setNotifications((prev) => [newNoti, ...prev]);

            // Mostrar un Toast temporal (se oculta tras 6s)
            const toastId = Date.now();
            setToasts((prev) => [...prev, { id: toastId, ...newNoti }]);

            // Reproducir sonido de campanilla ligero (opcional)
            try {
              if (notificationAudio) {
                notificationAudio.currentTime = 0;
                notificationAudio.play().catch(() => {});
              }
            } catch (e) {}

            setTimeout(() => {
              if (active) {
                setToasts((prev) => prev.filter((t) => t.id !== toastId));
              }
            }, 6000);
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [tenantId]);

  const handleMarkAllRead = useCallback(async () => {
    if (!tenantId) return;
    try {
      await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('tienda_id', tenantId)
        .eq('leida', false);
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
    } catch {
      // Non-critical
    }
  }, [tenantId]);

  return {
    notifications,
    unreadCount,
    toasts,
    handleMarkAllRead,
  };
}
