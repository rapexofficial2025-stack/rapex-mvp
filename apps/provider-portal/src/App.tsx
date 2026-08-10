import { useTheme, ThemeToggle } from "@rapex/ui-web";

function App() {
  const theme = useTheme();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.background,
        padding: theme.spacing.xl,
        fontFamily: "system-ui, sans-serif",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: theme.spacing.lg, right: theme.spacing.lg }}>
        <ThemeToggle />
      </div>
      <h1
        style={{
          fontSize: theme.typography.fontSize["2xl"],
          fontWeight: theme.typography.fontWeight.bold as React.CSSProperties["fontWeight"],
          color: theme.colors.brandPrimary,
          marginBottom: theme.spacing.sm,
        }}
      >
        RAPEX Provider Portal
      </h1>
      <p style={{ fontSize: theme.typography.fontSize.base, color: theme.colors.textSecondary }}>Gawang Lokal, Para sa Masa</p>
    </div>
  );
}

export default App;
