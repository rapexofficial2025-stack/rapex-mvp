import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { ShieldCheck } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { GradientButton } from "../components/buttons/GradientButton";
import { InputField } from "../components/ui/InputField";

type Props = NativeStackScreenProps<AuthStackParamList, "ChildConsent">;

/**
 * Screen 2b -- placeholder parent/guardian consent form for under-18 users,
 * reusing the same auth stack/screens rather than a separate app (per
 * product decision). Fields/copy below are a structural stand-in only --
 * final consent requirements (signature, ID upload, legal text) still need
 * to be defined before this is real. No backend call here.
 */
export function ChildConsentScreen({ navigation }: Props) {
  const [guardianName, setGuardianName] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [relationship, setRelationship] = useState("");

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.page}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.iconWrap}>
          <ShieldCheck color="#8B5CF6" size={40} />
        </View>
        <Text style={styles.heading}>Parent / Guardian Consent</Text>
        <Text style={styles.subheading}>
          Since you're under 18, a parent or legal guardian needs to confirm this account before you can continue.
        </Text>

        <InputField placeholder="Parent/Guardian full name" value={guardianName} onChangeText={setGuardianName} />
        <InputField placeholder="Parent/Guardian email" value={guardianEmail} onChangeText={setGuardianEmail} />
        <InputField placeholder="Relationship to user" value={relationship} onChangeText={setRelationship} />

        <Text style={styles.note}>
          Placeholder form -- final fields (signature, ID verification, legal consent text) still need to be defined.
        </Text>

        <GradientButton title="Submit & Continue" onPress={() => navigation.navigate("Login")} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#100B24" },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  iconWrap: { alignSelf: "center", marginBottom: 8 },
  heading: { fontSize: 24, fontWeight: "900", color: "#FFFFFF", marginBottom: 8, textAlign: "center" },
  subheading: { fontSize: 14, color: "rgba(255,255,255,0.74)", marginBottom: 24, textAlign: "center", lineHeight: 20 },
  note: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
    fontStyle: "italic",
  },
});
