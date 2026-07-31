import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { getTheme } from "@rapex/theme";

const theme = getTheme("light");

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>RAPEX Rider App</Text>
      <Text style={styles.subtitle}>Gawang Lokal, Para sa Masa</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold as "700",
    color: theme.colors.brandPrimary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
});
