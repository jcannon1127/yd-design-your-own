import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-8 text-center">
        <h1 className="font-display text-3xl mb-3">Something went wrong</h1>
        <p className="text-muted-foreground font-body mb-6 max-w-md">
          {this.state.error?.message ?? "An unexpected error occurred."}
        </p>
        <button
          onClick={this.reset}
          className="px-6 py-3 rounded-md bg-primary text-primary-foreground font-body hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }
}
