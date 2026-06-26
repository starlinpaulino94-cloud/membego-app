"use client";
import React from "react";

type Props = { children: React.ReactNode; fallback?: React.ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <p className="text-2xl font-bold text-foreground mb-2">Algo salió mal</p>
            <p className="text-sm text-muted-foreground mb-4">Recarga la página para continuar.</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium">
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
