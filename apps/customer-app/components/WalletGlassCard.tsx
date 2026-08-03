import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { formatPeso } from "@rapex/utils";
import { useAppTheme } from "../hooks/useAppTheme";

type WalletGlassCardProps = {
  balance: number;
  ownerLabel: string;
};

/** Converted from the Glide "Digital Wallet" glass-card CSS reference -- purple gradient + blur + glow blob. */
export function WalletGlassCard({ balance, ownerLabel }: WalletGlassCardProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.wrapper, { borderRadius: theme.radius.lg }]}>
      <LinearGradient
        colors={["rgba(124,58,237,0.30)", "rgba(168,85,247,0.18)", "rgba(255,255,255,0.08)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { borderRadius: theme.radius.lg, padding: theme.spacing.lg }]}
      >
        <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.glow} pointerEvents="none" />

        <View style={styles.header}>
          <Text style={[styles.label, { color: theme.colors.brandPrimaryHover }]}>DIGITAL WALLET</Text>
          <Text style={{ fontSize: 24 }}>💎</Text>
        </View>

        <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary, marginTop: theme.spacing.md }]}>
          Available Balance
        </Text>
        <Text style={[styles.balance, { color: theme.colors.textPrimary }]}>{formatPeso(balance)}</Text>

        <View style={[styles.footer, { marginTop: theme.spacing.sm }]}>
          <Text style={[styles.footerText, { color: theme.colors.brandPrimaryHover }]}>{ownerLabel}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
    shadowColor: "#A855F7",
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  gradient: {
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(192,132,252,0.35)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    letterSpacing: 3,
    fontWeight: "700",
  },
  balanceLabel: {
    fontSize: 13,
  },
  balance: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  footerText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
