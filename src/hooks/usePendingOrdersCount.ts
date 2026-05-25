import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function usePendingOrdersCount(tenantId?: string): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!tenantId) return;
    let active = true;

    const fetchCount = () => {
      supabase
        .from('pedidos')
        .select('id', { count: 'exact', head: true })
        .eq('tienda_id', tenantId)
        .in('estado', ['pendiente', 'preparando'])
        .then(({ count: result }) => {
          if (active && result !== null) setCount(result);
        });
    };

    fetchCount();

    // Suscribirse a cambios en tiempo real en la tabla pedidos para este tenant (inserciones, actualizaciones, eliminaciones)
    const channel = supabase
      .channel(`pending-orders-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pedidos',
          filter: `tienda_id=eq.${tenantId}`,
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [tenantId]);

  return count;
}
