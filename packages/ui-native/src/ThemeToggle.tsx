import { Switch, Text, View } from "react-native";
import { useTheme } from "./useTheme";
import { useThemeMode } from "./ThemeProvider";

export function ThemeToggle() {
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === "dark";

  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize.base }}>
        {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
      </Text>
      <Switch
        value={isDark}
        onValueChange={toggleMode}
        trackColor={{ false: theme.colors.surfaceAlt, true: theme.colors.brandPrimary }}
        thumbColor={theme.colors.surface}
      />
    </View>
  );
}
