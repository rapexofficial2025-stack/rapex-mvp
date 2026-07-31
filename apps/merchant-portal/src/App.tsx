import { getTheme } from "@rapex/theme";

const theme = getTheme("light");

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
    fontFamily: "system-ui, sans-serif",
  },
  title: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold as React.CSSProperties["fontWeight"],
    color: theme.colors.brandPrimary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
};

function App() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>RAPEX Merchant Portal</h1>
      <p style={styles.subtitle}>Gawang Lokal, Para sa Masa</p>
    </div>
  );
}

export default App;
