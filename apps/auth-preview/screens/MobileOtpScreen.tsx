import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { GradientButton } from "../components/buttons/GradientButton";

type Props = NativeStackScreenProps<AuthStackParamList, "MobileOtp">;

/** Screen 5 -- 6-digit OTP entry, purely visual (no backend call here). */
export function MobileOtpScreen({ navigation }: Props) {
  const [code, setCode] = useState("");

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.page}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Mobile Verification</Text>
        <Text style={styles.subheading}>Enter the 6-digit OTP sent to your phone number.</Text>

        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="Enter OTP"
          keyboardType="number-pad"
          maxLength={6}
          style={styles.codeInput}
          placeholderTextColor="#999"
        />

        <GradientButton title="Verify Code" onPress={() => navigation.navigate("EmailVerification")} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#100B24" },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  heading: { fontSize: 32, fontWeight: "900", color: "#FFFFFF", marginBottom: 12 },
  subheading: { fontSize: 16, color: "rgba(255,255,255,0.76)", marginBottom: 28, lineHeight: 24 },
  codeInput: {
    height: 64,
    borderRadius: 18,
    paddingHorizontal: 20,
    fontSize: 24,
    letterSpacing: 16,
    color: "#FFF",
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 28,
  },
});
