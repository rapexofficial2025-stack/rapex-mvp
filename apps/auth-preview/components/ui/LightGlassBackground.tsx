import { ImageBackground, StyleSheet } from "react-native";

/**
 * Shared light background for AgeGate + Login ("1 background only" for
 * both, per instruction). The image itself (pastel purple/pink + glass
 * shard decorations) is generated externally (Base44) and dropped in here
 * -- not drawn in code -- so this is just a thin ImageBackground wrapper,
 * same "placeholder now, swap the real asset in later" pattern as every
 * other image in this app.
 */
export function LightGlassBackground() {
  return <ImageBackground source={require("../../assets/backgrounds/agegate-login-light.png")} resizeMode="cover" style={StyleSheet.absoluteFill} />;
}
