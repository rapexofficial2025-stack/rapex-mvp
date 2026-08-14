import { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type ErrorBoundaryProps = {
  children: ReactNode;
  /** Called with the caught error -- wire real crash reporting here once one exists (e.g. Sentry). Optional so this has zero dependency on any specific service. */
  onError?: (error: Error, info: ErrorInfo) => void;
};

type ErrorBoundaryState = { error: Error | null };

/**
 * Root-level crash safety net -- without this, any unhandled render error
 * anywhere in the app (a null property access, a malformed API response
 * shape, etc.) unmounts the whole tree to a blank white screen with no way
 * back for a real user. Deliberately self-contained (no theme/context
 * dependency, hardcoded colors) since this is exactly the component that
 * must still render correctly when something else in the app has already
 * gone wrong. "Try Again" resets local state and re-renders the tree fresh
 * -- recovers from most transient errors (a bad navigation param, a
 * one-off null from a response); an error that's deterministic given
 * current app state will reappear, which is expected and still better than
 * a permanent blank screen.
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
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.description}>
            RAPEX ran into an unexpected error. Tapping below will try to recover -- if it keeps happening, please
            contact support.
          </Text>
          <Pressable style={styles.button} onPress={() => this.setState({ error: null })}>
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
    backgroundColor: "#0B0713",
  },
  title: { fontSize: 20, fontWeight: "800", color: "#FFFFFF", textAlign: "center" },
  description: { fontSize: 13, color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 20 },
  button: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 999,
    backgroundColor: "#8B5CF6",
  },
  buttonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
});
