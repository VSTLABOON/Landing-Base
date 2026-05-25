import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  action?: ToastAction;
  duration?: number; // duration in ms
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (toastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    // Default durations
    let defaultDuration = 3000;
    if (toastProps.type === 'warning') defaultDuration = 5000;
    if (toastProps.type === 'error') defaultDuration = Infinity; // Persist errors

    const duration = toastProps.duration ?? defaultDuration;

    const newToast: Toast = { ...toastProps, id, duration };

    set((state) => {
      // Regla: Max 3 toasts. Si llega un 4to, descartar el más antiguo (FIFO)
      const currentToasts = [...state.toasts, newToast];
      if (currentToasts.length > 3) {
        return { toasts: currentToasts.slice(currentToasts.length - 3) };
      }
      return { toasts: currentToasts };
    });

    if (duration !== Infinity) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

// Helper hooks/functions
export const toast = {
  success: (title: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title'>>) =>
    useToastStore.getState().addToast({ type: 'success', title, ...options }),
  error: (title: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title'>>) =>
    useToastStore.getState().addToast({ type: 'error', title, ...options }),
  warning: (title: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title'>>) =>
    useToastStore.getState().addToast({ type: 'warning', title, ...options }),
  info: (title: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title'>>) =>
    useToastStore.getState().addToast({ type: 'info', title, ...options }),
  dismiss: (id: string) => useToastStore.getState().removeToast(id),
};
