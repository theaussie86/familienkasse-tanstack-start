import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6">
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
            Etwas ist schiefgelaufen
          </h2>
          <p className="text-sm text-red-600 dark:text-red-300 mb-4">
            Ein unerwarteter Fehler ist aufgetreten. Bitte lade die Seite neu.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="h-9 px-4 text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Seite neu laden
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
