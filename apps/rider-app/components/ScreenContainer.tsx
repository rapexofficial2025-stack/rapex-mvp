import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../hooks/useAppTheme";

type ScreenContainerProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

export function ScreenContainer({ title, subtitle, children }: ScreenContainerProps) {
  const theme = useAppTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { padding: theme.spacing.xl }]}>
        <Text
          style={[
            styles.title,
            {
              fontSize: theme.typography.fontSize["2xl"],
              color: theme.colors.brandPrimary,
              marginBottom: theme.spacing.xs,
            },
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitle,
              { fontSize: theme.typography.fontSize.base, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
        <View style={{ gap: theme.spacing.sm }}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  title: {
    fontWeight: "700",
  },
  subtitle: {
    fontWeight: "400",
  },
});
