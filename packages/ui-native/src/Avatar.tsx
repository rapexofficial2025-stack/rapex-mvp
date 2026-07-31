import { Image, StyleSheet, Text, View } from "react-native";
import { useTheme } from "./useTheme";

export type AvatarSize = "sm" | "md" | "lg";

export type AvatarProps = {
  uri?: string;
  name: string;
  size?: AvatarSize;
};

const DIMENSION: Record<AvatarSize, number> = { sm: 32, md: 48, lg: 72 };

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function Avatar({ uri, name, size = "md" }: AvatarProps) {
  const theme = useTheme();
  const dimension = DIMENSION[size];

  if (uri) {
    return (
      <Image
        source={{ uri }}
        accessibilityLabel={name}
        style={[styles.image, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: theme.colors.brandPrimary,
        },
      ]}
    >
      <Text style={{ color: theme.colors.textInverse, fontSize: dimension * 0.38, fontWeight: "700" }}>
        {initialsFrom(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: "cover",
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
});
