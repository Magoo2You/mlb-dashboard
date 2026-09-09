import React, {Component} from "react";

export interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export function ErrorBoundaryFallback({ onReset }: { onReset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-slate-100">
      <section className="w-full max-w-lg rounded-2xl border border-amber-700/60 bg-slate-900 p-8 shadow-2xl" role="alert" aria-labelledby="dashboard-error-title">
        <h1 id="dashboard-error-title" className="text-2xl font-black text-white">The dashboard needs a restart</h1>
        <p className="mt-3 text-slate-300">This view could not be displayed. No dashboard data or technical details were exposed.</p>
        <button
          type="button"
          onClick={onReset}
          className="focus-ring mt-6 rounded-xl bg-amber-500 px-5 py-3 font-bold text-slate-950 hover:bg-amber-400"
        >
          Try again
        </button>
      </section>
    </main>
  );
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  declare props: AppErrorBoundaryProps;
  declare setState: (state: AppErrorBoundaryState) => void;
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  private reset = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
      return;
    }
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) return <ErrorBoundaryFallback onReset={this.reset} />;
    return this.props.children;
  }
}
