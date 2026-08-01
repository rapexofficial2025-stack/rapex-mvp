import { Pressable, Text, View } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.sm,
      }}
    >
      <Text style={{ fontSize: theme.typography.fontSize.lg, fontWeight: "700", color: theme.colors.textPrimary }}>
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction}>
          <Text style={{ fontSize: theme.typography.fontSize.sm, fontWeight: "600", color: theme.colors.accent }}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
