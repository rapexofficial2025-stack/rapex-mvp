import { Component, type CSSProperties, type ErrorInfo, type ReactNode } from "react";

export type ErrorBoundaryProps = {
  children: ReactNode;
  /** Called with the caught error -- wire real crash reporting here once one exists (e.g. Sentry). Optional so this has zero dependency on any specific service. */
  onError?: (error: Error, info: ErrorInfo) => void;
};

type ErrorBoundaryState = { error: Error | null };

/**
 * Root-level crash safety net -- without this, any unhandled render error
 * anywhere in the app unmounts the whole tree to a blank page with no way
 * back for a real user. Deliberately self-contained (no theme/context
 * dependency, hardcoded colors) since this is exactly the component that
 * must still render correctly when something else in the app has already
 * gone wrong. "Reload Page" does a real full reload (always recovers, since
 * it re-fetches the app from scratch), unlike a local state reset.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={styles.container}>
          <h1 style={styles.title}>Something went wrong</h1>
          <p style={styles.description}>
            RAPEX ran into an unexpected error. Reloading the page will usually fix it -- if it keeps happening,
            please contact support.
          </p>
          <button style={styles.button} onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
    backgroundColor: "#0B0713",
    textAlign: "center",
  },
  title: { fontSize: 22, fontWeight: 800, color: "#FFFFFF", margin: 0 },
  description: { fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.5, maxWidth: 420, margin: 0 },
  button: {
    marginTop: 12,
    padding: "12px 28px",
    borderRadius: 999,
    border: "none",
    background: "#8B5CF6",
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
};
