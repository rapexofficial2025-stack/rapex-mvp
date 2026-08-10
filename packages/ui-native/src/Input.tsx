import { useState } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { useTheme } from "./useTheme";

export type InputProps = TextInputProps & {
  label?: string;
  errorMessage?: string;
};

export function Input({ label, errorMessage, onFocus, onBlur, ...inputProps }: InputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = errorMessage ? theme.colors.error : isFocused ? theme.colors.brandPrimary : theme.colors.border;

  return (
    <View style={{ gap: theme.spacing.xs }}>
      {label ? (
        <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={theme.colors.textDisabled}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        style={[
          styles.input,
          {
            borderColor,
            borderRadius: theme.radius.md,
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg,
            fontSize: theme.typography.fontSize.base,
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.surface,
          },
        ]}
        {...inputProps}
      />
      {errorMessage ? (
        <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.error }}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
  },
});
