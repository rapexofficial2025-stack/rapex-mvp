import { Text, View } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";

type PromoBannerProps = {
  title: string;
  subtitle: string;
};

/** Static marketing content -- no promotions repository/data exists yet. */
export function PromoBanner({ title, subtitle }: PromoBannerProps) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        marginHorizontal: theme.spacing.lg,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.brandPrimary,
        gap: theme.spacing.xxs,
        ...theme.shadows.md.native,
      }}
    >
      <Text style={{ fontSize: theme.typography.fontSize.lg, fontWeight: "700", color: theme.colors.textInverse }}>
        {title}
      </Text>
      <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textInverse, opacity: 0.9 }}>
        {subtitle}
      </Text>
    </View>
  );
}
