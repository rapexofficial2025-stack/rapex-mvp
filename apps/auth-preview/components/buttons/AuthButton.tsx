import { Image, ImageSourcePropType, Pressable, StyleSheet, Text } from "react-native";

type Props = {
  title: string;
  onPress?: () => void;
  icon?: ImageSourcePropType;
  variant?: "primary" | "outline" | "glass";
};

export function AuthButton({ title, onPress, icon, variant = "primary" }: Props) {
  return (
    <Pressable
      style={[styles.button, variant === "outline" && styles.outlineButton, variant === "glass" && styles.glassButton]}
      onPress={onPress}
    >
      {icon && <Image source={icon} style={styles.icon} resizeMode="contain" />}
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 58,
    borderRadius: 28,
    backgroundColor: "#7B3FF2",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 12,
    marginBottom: 14,
  },
  icon: { width: 22, height: 22, marginRight: 12 },
  text: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  outlineButton: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: "#8B5CF6" },
  glassButton: { backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.20)" },
});
