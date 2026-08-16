import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { AuthButton } from "../components/buttons/AuthButton";
import { GradientButton } from "../components/buttons/GradientButton";
import { InputField } from "../components/ui/InputField";
import { SelectField } from "../components/ui/SelectField";
import { ImageCaptureField } from "../components/ui/ImageCaptureField";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUpProfileWallet">;

const PAYMENT_TYPE_OPTIONS = [
  { label: "GCash", value: "gcash" },
  { label: "Bank", value: "bank" },
];

/**
 * Screen 4c -- Profile/Cover Photo + Wallet/Payment, consolidated onto ONE
 * scrollable screen per instruction. Profile/Cover Photo are optional (not
 * core identity documents, unlike ID/Selfie back in SignUpAddressScreen).
 * Payment method is also optional here -- per the discussed business rule,
 * users without a linked wallet can still continue but purchasing is
 * COD-only up to a threshold; that limit is a backend/order-system rule,
 * not something this visual-only screen enforces.
 */
export function SignUpProfileWalletScreen({ navigation }: Props) {
  const [profilePhotoCaptured, setProfilePhotoCaptured] = useState(false);
  const [coverPhotoCaptured, setCoverPhotoCaptured] = useState(false);
  const [paymentType, setPaymentType] = useState<string | null>(null);
  const [accountNumber, setAccountNumber] = useState("");

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.page}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Profile &amp; Payment</Text>

        <Text style={styles.sectionLabel}>Profile Photo (optional)</Text>
        <ImageCaptureField label="Profile Photo" onCaptured={() => setProfilePhotoCaptured(true)} />

        <Text style={styles.sectionLabel}>Cover Photo (optional)</Text>
        <ImageCaptureField label="Cover Photo" onCaptured={() => setCoverPhotoCaptured(true)} />

        <Text style={styles.sectionLabel}>Payment Method (optional)</Text>
        <Text style={styles.sectionHint}>
          Your linked wallet/account for RAPEX transactions. You can still continue without one -- purchasing is
          then limited to Cash on Delivery under the order system's rules.
        </Text>
        <SelectField label="Payment Type" value={paymentType} options={PAYMENT_TYPE_OPTIONS} onChange={setPaymentType} placeholder="Select payment type" />
        {paymentType ? (
          <InputField placeholder="Account Number" value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad" />
        ) : null}

        <GradientButton title="Continue" onPress={() => navigation.navigate("SignUpComplete")} />
        <AuthButton title="Back" onPress={() => navigation.goBack()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#100B24" },
  container: { padding: 24, paddingTop: 40 },
  heading: { fontSize: 28, fontWeight: "900", color: "#FFFFFF", marginBottom: 16 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#C4B5FD",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHint: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 10, lineHeight: 17 },
});
