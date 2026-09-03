import { useState } from "react";
import { Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import { Button, Badge, ErrorState } from "@rapex/ui-native";
import type { RootStackParamList } from "../../types/navigation";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useAppTheme } from "../../hooks/useAppTheme";
import { updateRegistrationDraft, useRegistrationDraft } from "../../services/registrationStore";

type Props = NativeStackScreenProps<RootStackParamList, "RegisterLocation">;

/**
 * Optional, reachable later from Profile's "Delivery Address" checklist row
 * (not part of the mandatory registration flow -- the real account is
 * already created by RegisterAccountScreen by the time a user gets here).
 * Captures raw GPS coordinates only; there is no confirmed Xano field/
 * endpoint to store them against yet, so they are kept locally and shown as
 * the pre-filled starting point if the user picks "Use This Location" ->
 * "Yes" and skips manual address entry.
 */
export function RegisterLocationScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const draft = useRegistrationDraft();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasLocation = draft.gpsLatitude !== null && draft.gpsLongitude !== null;

  async function captureLocation() {
    setLoading(true);
    setError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setError("Location access is required to set your delivery address automatically. You can still continue and enter your address manually.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      updateRegistrationDraft({ gpsLatitude: position.coords.latitude, gpsLongitude: position.coords.longitude });
    } catch {
      setError("Couldn't get your location. Check that location services are enabled and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer title="Your Location" subtitle="Used to set your delivery address">
      {!hasLocation ? (
        <>
          <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
            RAPEX uses your location to help set your delivery address and find nearby stores.
          </Text>
          {error ? <ErrorState description={error} onRetry={captureLocation} /> : null}
          <Button label="Use This Location" loading={loading} onPress={captureLocation} />
          <Button label="Skip -- Enter Address Manually" variant="secondary" onPress={() => {
            updateRegistrationDraft({ useGpsAsHomeAddress: false });
            navigation.navigate("Address", { fromRegistration: true });
          }} />
        </>
      ) : (
        <>
          <Badge label="Location captured" tone="success" />
          <View style={{ gap: theme.spacing.xxs }}>
            <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
              {draft.gpsLatitude!.toFixed(5)}, {draft.gpsLongitude!.toFixed(5)}
            </Text>
          </View>
          <Text style={{ fontSize: theme.typography.fontSize.base, color: theme.colors.textPrimary, fontWeight: "600" }}>
            Use this as your home address?
          </Text>
          <Button
            label="Yes"
            onPress={() => {
              updateRegistrationDraft({ useGpsAsHomeAddress: true });
              navigation.navigate("Profile");
            }}
          />
          <Button
            label="No -- Enter Manually"
            variant="secondary"
            onPress={() => {
              updateRegistrationDraft({ useGpsAsHomeAddress: false });
              navigation.navigate("Address", { fromRegistration: true });
            }}
          />
        </>
      )}
    </ScreenContainer>
  );
}
