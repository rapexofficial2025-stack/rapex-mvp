import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { AuthButton } from "../components/buttons/AuthButton";
import { GradientButton } from "../components/buttons/GradientButton";
import { InputField } from "../components/ui/InputField";
import { setSignUpFullName } from "../services/signUpDraftStore";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

/** Screen 4 -- registration form, purely visual (no backend call here). */
export function SignUpScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.page}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Create your RAPEX account</Text>
        <Text style={styles.subheading}>Register with name, email, mobile number, and password.</Text>

        <InputField placeholder="Full name" value={name} onChangeText={setName} />
        <InputField placeholder="Email" value={email} onChangeText={setEmail} />
        <InputField placeholder="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <InputField placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

        <GradientButton
          title="Continue"
          onPress={() => {
            setSignUpFullName(name);
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
  heading: { fontSize: 32, fontWeight: "900", color: "#FFFFFF", marginBottom: 12 },
  subheading: { fontSize: 16, color: "rgba(255,255,255,0.74)", marginBottom: 28, lineHeight: 24 },
});
