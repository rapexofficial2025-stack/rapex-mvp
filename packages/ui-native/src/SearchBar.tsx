import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "./useTheme";

export type SearchBarProps = {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  /** If provided, the bar renders as a tappable, non-editable trigger (e.g. Home -> Marketplace) instead of a live text input. */
  onPress?: () => void;
};

export function SearchBar({ placeholder = "Search RAPEX", value, onChangeText, onPress }: SearchBarProps) {
  const theme = useTheme();

  const containerStyle = [
    styles.container,
    {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: theme.radius.full,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
  ];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={containerStyle}>
        <Text style={{ fontSize: theme.typography.fontSize.base }}>🔍</Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.base }}>
          {value || placeholder}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={containerStyle}>
      <Text style={{ fontSize: theme.typography.fontSize.base }}>🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textDisabled}
        style={{ flex: 1, fontSize: theme.typography.fontSize.base, color: theme.colors.textPrimary }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
});
