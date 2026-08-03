import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../hooks/useAppTheme";
import { GradientScreenBackground } from "./GradientScreenBackground";

type ScreenContainerProps = {
  title: string;
  subtitle?: string;
  headerAction?: ReactNode;
  children?: ReactNode;
};

/**
 * Shared placeholder layout for every screen in this sprint -- gives every
 * screen consistent theme-driven chrome without duplicating boilerplate.
 * Gets replaced screen-by-screen once Base44 UI lands.
 */
export function ScreenContainer({ title, subtitle, headerAction, children }: ScreenContainerProps) {
  const theme = useAppTheme();

  return (
    <View style={{ flex: 1 }}>
      <GradientScreenBackground />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={[styles.content, { padding: theme.spacing.xl }]}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
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
          {headerAction}
        </View>
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
    </View>
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
