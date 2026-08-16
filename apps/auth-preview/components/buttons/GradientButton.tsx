import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
};

export function GradientButton({ title, onPress, disabled }: Props) {
  return (
    <Pressable onPress={disabled ? undefined : onPress} style={disabled && styles.disabled}>
      <LinearGradient
        colors={["#FF7A00", "#B100FF"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.button}
      >
        <Text style={styles.title}>{title}</Text>
        <View style={styles.circle}>
          <Text style={styles.arrow}>{">"}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center", marginTop: 20 },
  title: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  circle: {
    position: "absolute",
    right: 8,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: { fontSize: 22, color: "#7B3FF2", fontWeight: "900" },
  disabled: { opacity: 0.5 },
});
