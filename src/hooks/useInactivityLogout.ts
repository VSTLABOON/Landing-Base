import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { logger } from '../lib/logger';
import { useAuth } from '../context/AuthContext';

export function useInactivityLogout(timeoutMs: number = 15 * 60 * 1000) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Only run inactivity logout if user is logged in
    if (!profile) return;

    const resetTimer = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(async () => {
        try {
          logger.info('User logged out due to inactivity');
          await supabase.auth.signOut();
          navigate('/login?reason=inactivity');
        } catch (error) {
          logger.error('Error logging out on inactivity', error as Error);
        }
      }, timeoutMs);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    
    // Initial start
    resetTimer();

    // Attach listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [profile, navigate, timeoutMs]);
}
