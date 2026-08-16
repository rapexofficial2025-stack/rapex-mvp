import { StyleSheet, Text, View } from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { GradientButton } from "../components/buttons/GradientButton";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUpComplete">;

/** Screen 7 -- registration complete. Continue plays the REX welcome video next. Visual only. */
export function SignUpCompleteScreen({ navigation }: Props) {
  return (
    <View style={styles.page}>
      <CheckCircle2 color="#22C55E" size={72} />
      <Text style={styles.heading}>You're All Set!</Text>
      <Text style={styles.subheading}>Your RAPEX account has been created.</Text>

      <GradientButton title="Continue" onPress={() => navigation.replace("WelcomeVideo")} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#100B24", padding: 24, justifyContent: "center", alignItems: "center" },
  heading: { fontSize: 28, fontWeight: "900", color: "#FFFFFF", marginTop: 20, marginBottom: 8, textAlign: "center" },
  subheading: { fontSize: 15, color: "rgba(255,255,255,0.74)", marginBottom: 28, textAlign: "center" },
});
