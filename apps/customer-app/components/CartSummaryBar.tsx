import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { formatPeso } from "@rapex/utils";
import { useAppTheme } from "../hooks/useAppTheme";

type CartSummaryBarProps = {
  itemCount: number;
  subtotal: number;
  buttonLabel?: string;
  onProceed: () => void;
};

/** Converted from the Glide fixed-bottom cart-summary CSS reference. */
export function CartSummaryBar({ itemCount, subtotal, buttonLabel = "Proceed", onProceed }: CartSummaryBarProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={["rgba(259,24,255,0.09)", "rgba(25,24,255,0.09)"]}
        style={styles.gradient}
      >
        <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
        <View style={[styles.row, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.itemsLabel, { color: theme.colors.textSecondary }]}>
              {itemCount} Item{itemCount === 1 ? "" : "s"} Selected
            </Text>
            <Text style={[styles.total, { color: theme.colors.brandPrimaryHover }]}>{formatPeso(subtotal)}</Text>
            <Text style={[styles.subtotalLabel, { color: theme.colors.textDisabled }]}>ITEMS SUBTOTAL</Text>
          </View>

          <Pressable onPress={onProceed} disabled={itemCount === 0}>
            <LinearGradient
              colors={["#7C3AED", "#9333EA", "#C026D3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.button, { borderRadius: theme.radius.full, opacity: itemCount === 0 ? 0.5 : 1 }]}
            >
              <Text style={styles.buttonText}>{buttonLabel}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.6)",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  gradient: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemsLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  total: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 2,
  },
  subtotalLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 26,
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
});
