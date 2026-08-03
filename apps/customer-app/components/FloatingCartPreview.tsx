import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import type { CartLine } from "@rapex/api-client";
import { useAppTheme } from "../hooks/useAppTheme";

type FloatingCartPreviewProps = {
  lines: CartLine[];
  imageLabelByProductId: Record<string, string>;
};

/** Floating glass strip previewing the products just added to cart, per the Glide "Express Cart" reference. */
export function FloatingCartPreview({ lines, imageLabelByProductId }: FloatingCartPreviewProps) {
  const theme = useAppTheme();

  if (lines.length === 0) return null;

  return (
    <View style={[styles.wrapper, { borderRadius: theme.radius.full }]}>
      <BlurView intensity={25} tint="light" style={StyleSheet.absoluteFill} />
      <Text style={[styles.label, { color: theme.colors.brandPrimaryHover }]}>⚡ EXPRESS CART ⚡</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.xs }}>
        {lines.map((line) => (
          <View
            key={line.productId}
            style={[styles.thumb, { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md }]}
          >
            <Text style={{ fontSize: 22 }}>{imageLabelByProductId[line.productId] ?? "🛍️"}</Text>
            {line.quantity > 1 ? (
              <View style={[styles.qtyBadge, { backgroundColor: theme.colors.brandPrimary }]}>
                <Text style={styles.qtyBadgeText}>{line.quantity}</Text>
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  thumb: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  qtyBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
});
