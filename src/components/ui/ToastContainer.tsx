import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore, Toast } from '../../store/toastStore';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, ExternalLink } from 'lucide-react';

const ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 400, damping: 30 }}
      className="bg-[var(--color-background-primary)] rounded-xl shadow-lg border border-[var(--color-border-tertiary)] p-4 w-full max-w-sm flex items-start gap-3 pointer-events-auto"
      role="alert"
    >
      <div className="shrink-0">{ICONS[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{toast.title}</h3>
        {toast.message && (
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">{toast.message}</p>
        )}
        {toast.action && (
          <div className="mt-2">
            {toast.action.href ? (
              <a
                href={toast.action.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  toast.action?.onClick?.();
                  removeToast(toast.id);
                }}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {toast.action.label} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button
                onClick={() => {
                  toast.action?.onClick?.();
                  removeToast(toast.id);
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 p-1 rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-background-tertiary)] transition-colors"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div 
      className="fixed z-[9999] pointer-events-none p-4 flex flex-col gap-3
                 bottom-4 inset-x-4 sm:inset-x-auto sm:bottom-auto sm:top-4 sm:right-4 items-center sm:items-end"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
