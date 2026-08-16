import { Linking, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { GradientButton } from "../components/buttons/GradientButton";
import { AuthButton } from "../components/buttons/AuthButton";

type Props = NativeStackScreenProps<AuthStackParamList, "EmailVerification">;

/** Screen 6 -- static "check your email" message, purely visual (no polling here). */
export function EmailVerificationScreen({ navigation }: Props) {
  return (
    <View style={styles.page}>
      <Text style={styles.heading}>Email Verification</Text>
      <Text style={styles.subheading}>
        We sent a verification link to your email. Open your mailbox and tap the link to activate your account.
      </Text>

      <GradientButton title="Continue" onPress={() => navigation.navigate("SignUpComplete")} />
      <AuthButton title="Open Email App" onPress={() => Linking.openURL("mailto:")} />
      <Text style={styles.note}>Not wired to a real backend here -- see the README.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#100B24", padding: 24, justifyContent: "center" },
  heading: { fontSize: 32, fontWeight: "900", color: "#FFFFFF", marginBottom: 16 },
  subheading: { fontSize: 16, color: "rgba(255,255,255,0.78)", lineHeight: 24, marginBottom: 28 },
  note: { marginTop: 16, fontSize: 14, color: "rgba(255,255,255,0.66)", textAlign: "center" },
});
