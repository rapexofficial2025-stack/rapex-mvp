import { Pressable, Text, View } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";

type CategoryCardProps = {
  iconLabel: string;
  name: string;
  onPress: () => void;
};

export function CategoryCard({ iconLabel, name, onPress }: CategoryCardProps) {
  const theme = useAppTheme();

  return (
    <Pressable onPress={onPress} style={{ alignItems: "center", width: 72, gap: theme.spacing.xxs }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.colors.surfaceAlt,
          alignItems: "center",
          justifyContent: "center",
          ...theme.shadows.sm.native,
        }}
      >
        <Text style={{ fontSize: theme.typography.fontSize.xl }}>{iconLabel}</Text>
      </View>
      <Text
        numberOfLines={1}
        style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textPrimary, textAlign: "center" }}
      >
        {name}
      </Text>
    </Pressable>
  );
}
