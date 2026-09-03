import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { AuthButton } from "../components/buttons/AuthButton";
import { GradientButton } from "../components/buttons/GradientButton";
import { InputField } from "../components/ui/InputField";
import { setSignUpFullName } from "../services/signUpDraftStore";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

const GENDER_OPTIONS: Array<"Male" | "Female" | "Other"> = ["Male", "Female", "Other"];

/**
 * Screen 4 -- Basic Information step. Gender and Username are collected
 * here (per spec) but NOT submitted anywhere -- the real Xano
 * /auth/signup contract doesn't accept either field yet. Kept as local
 * state only, same "collect now, wire up once the backend supports it"
 * approach as apps/customer-app's registrationStore.ts. No backend call
 * in this preview app regardless.
 */
export function SignUpScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other" | null>(null);
  const [username, setUsername] = useState("");

  const canContinue =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0 &&
    password === confirmPassword;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.page}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Create your RAPEX account</Text>
        <Text style={styles.subheading}>Basic Information</Text>

        <View style={styles.row}>
          <View style={styles.flex1}>
            <InputField placeholder="First name" value={firstName} onChangeText={setFirstName} />
          </View>
          <View style={styles.flex1}>
            <InputField placeholder="Last name" value={lastName} onChangeText={setLastName} />
          </View>
        </View>

        <InputField placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <InputField placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <InputField placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.chipRow}>
            {GENDER_OPTIONS.map((option) => (
              <Pressable key={option} onPress={() => setGender(option)} style={[styles.chip, gender === option && styles.chipActive]}>
                <Text style={styles.chipText}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <InputField placeholder="Username (optional, for your profile)" value={username} onChangeText={setUsername} autoCapitalize="none" />

        <GradientButton
          title="Continue"
          disabled={!canContinue}
          onPress={() => {
            setSignUpFullName(`${firstName} ${lastName}`.trim());
            navigation.navigate("SignUpAddress");
          }}
        />
        <AuthButton title="Back to login" onPress={() => navigation.goBack()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#100B24" },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  heading: { fontSize: 32, fontWeight: "900", color: "#FFFFFF", marginBottom: 4 },
  subheading: { fontSize: 14, color: "#C4B5FD", fontWeight: "800", textTransform: "uppercase", letterSpacing: 1, marginBottom: 24 },
  row: { flexDirection: "row", gap: 10 },
  flex1: { flex: 1 },
  fieldWrap: { gap: 6, marginBottom: 14 },
  fieldLabel: { fontSize: 10, fontWeight: "800", color: "rgba(255,255,255,0.7)", textTransform: "uppercase" },
  chipRow: { flexDirection: "row", gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  chipActive: { backgroundColor: "#8B5CF6", borderColor: "#F97316" },
  chipText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
});
