import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, CheckCircle2 } from "lucide-react-native";

type Props = {
  label: string;
  onCaptured?: (uri: string) => void;
};

/** Live camera capture only (no gallery picker) -- matches "no ordinary uploaded selfie/ID" intent for verification assets. */
export function ImageCaptureField({ label, onCaptured }: Props) {
  const [uri, setUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function capture() {
    setError(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError("Camera access is required to capture this.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setUri(result.assets[0].uri);
      onCaptured?.(result.assets[0].uri);
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={capture} style={styles.box}>
        {uri ? (
          <Image source={{ uri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Camera color="rgba(255,255,255,0.6)" size={22} />
            <Text style={styles.placeholderText}>Take Photo</Text>
          </View>
        )}
        {uri ? (
          <View style={styles.capturedBadge}>
            <CheckCircle2 color="#22C55E" size={16} />
          </View>
        ) : null}
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, marginBottom: 14 },
  label: { fontSize: 10, fontWeight: "800", color: "rgba(255,255,255,0.7)", textTransform: "uppercase" },
  box: {
    height: 110,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(0,0,0,0.35)",
    overflow: "hidden",
  },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6 },
  placeholderText: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "700" },
  preview: { width: "100%", height: "100%" },
  capturedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 3,
  },
  error: { color: "#FCA5A5", fontSize: 11 },
});
