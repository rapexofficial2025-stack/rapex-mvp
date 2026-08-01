import { Pressable, Text, View } from "react-native";
import { Badge } from "@rapex/ui-native";
import { useAppTheme } from "../hooks/useAppTheme";

type ComingSoonCardProps = {
  iconLabel: string;
  title: string;
  description: string;
  onPress?: () => void;
};

export function ComingSoonCard({ iconLabel, title, description, onPress }: ComingSoonCardProps) {
  const theme = useAppTheme();
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      style={{
        width: 160,
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        gap: theme.spacing.xxs,
        opacity: onPress ? 1 : 0.7,
      }}
    >
      <Text style={{ fontSize: theme.typography.fontSize.xl }}>{iconLabel}</Text>
      <Text style={{ fontSize: theme.typography.fontSize.sm, fontWeight: "700", color: theme.colors.textPrimary }}>
        {title}
      </Text>
      <Text numberOfLines={2} style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
        {description}
      </Text>
      <Badge label="Coming Soon" tone="accent" />
    </Wrapper>
  );
}
