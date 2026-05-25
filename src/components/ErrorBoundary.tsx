import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { logger } from '../lib/logger';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Uncaught error:', error, errorInfo as unknown as Record<string, unknown>);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100svh] w-full bg-[var(--color-background-secondary)] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[var(--color-background-primary)] rounded-2xl shadow-xl border border-[var(--color-border-tertiary)] p-8 text-center animate-fade-in">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Algo salió mal
            </h1>
            
            <p className="text-[var(--color-text-tertiary)] text-sm mb-8">
              Ocurrió un error inesperado al cargar esta pantalla. 
              Por favor, intenta recargar la página.
            </p>

            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)] text-[var(--color-background-primary)] font-medium py-3 px-4 rounded-xl transition-colors active:scale-[0.98]"
            >
              <RefreshCcw className="w-4 h-4" />
              Recargar página
            </button>

            {import.meta.env.DEV && this.state.error && (
              <div className="mt-8 text-left bg-[var(--color-background-secondary)] p-4 rounded-lg overflow-x-auto text-xs text-red-600 font-mono border border-red-100">
                {this.state.error.toString()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
