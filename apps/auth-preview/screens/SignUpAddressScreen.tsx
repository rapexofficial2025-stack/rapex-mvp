import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { AuthButton } from "../components/buttons/AuthButton";
import { GradientButton } from "../components/buttons/GradientButton";
import { InputField } from "../components/ui/InputField";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUpAddress">;

/**
 * Screen 4b -- Address step of the SignUp flow (Basic Info -> Address ->
 * Verification -> Complete -> REX mp4). Plain text fields, not the real
 * Xano-backed cascading picker (that lives only in apps/customer-app, a
 * separate project this standalone preview app can't import from) --
 * purely visual, no backend call.
 */
export function SignUpAddressScreen({ navigation }: Props) {
  const [municipality, setMunicipality] = useState("");
  const [barangay, setBarangay] = useState("");
  const [street, setStreet] = useState("");

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.page}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Your Address</Text>
        <Text style={styles.subheading}>Used to set your delivery address.</Text>

        <InputField placeholder="Municipality / City" value={municipality} onChangeText={setMunicipality} />
        <InputField placeholder="Barangay" value={barangay} onChangeText={setBarangay} />
        <InputField placeholder="Street & House Number" value={street} onChangeText={setStreet} />

        <GradientButton title="Continue" onPress={() => navigation.navigate("MobileOtp")} />
        <AuthButton title="Back" onPress={() => navigation.goBack()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#100B24" },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  heading: { fontSize: 32, fontWeight: "900", color: "#FFFFFF", marginBottom: 12 },
  subheading: { fontSize: 16, color: "rgba(255,255,255,0.74)", marginBottom: 28, lineHeight: 24 },
});
