import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Badge, Button, GlassCard, Input } from "@rapex/ui-native";
import { PILOT_AREAS } from "@rapex/constants";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppTheme } from "../hooks/useAppTheme";
import { getDeliveryAddress, setDeliveryAddress } from "../services/addressStore";

/** Imus, Cavite -- RAPEX's pilot area, matches XanoMerchantRepository's default. */
const DEFAULT_LATITUDE = 14.4297;
const DEFAULT_LONGITUDE = 120.936;

type Props = NativeStackScreenProps<RootStackParamList, "Address">;

export function AddressScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const existing = getDeliveryAddress();
  const [label, setLabel] = useState(existing?.label ?? "Home");
  const [line, setLine] = useState(existing?.line ?? "");
  const [municipality, setMunicipality] = useState(existing?.municipality ?? PILOT_AREAS[0]);

  const canSave = line.trim().length > 0;

  return (
    <ScreenContainer title="Delivery Address" subtitle="Where should your order go?">
      <Badge label="Text entry only — map picker needs a Google Maps API key (UNVERIFIED, not wired in yet)" tone="warning" />

      <Input label="Label" placeholder="Home, Work, etc." value={label} onChangeText={setLabel} />
      <Input label="Street address / house no. / landmark" placeholder="e.g. 123 Rizal St., near the plaza" value={line} onChangeText={setLine} multiline />

      <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>Municipality</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
        {PILOT_AREAS.map((area) => (
          <Pressable
            key={area}
            onPress={() => setMunicipality(area)}
            style={{
              paddingVertical: theme.spacing.xs,
              paddingHorizontal: theme.spacing.md,
              borderRadius: theme.radius.full,
              backgroundColor: municipality === area ? theme.colors.brandPrimary : theme.colors.surfaceAlt,
            }}
          >
            <Text style={{ color: municipality === area ? theme.colors.textInverse : theme.colors.textPrimary, fontSize: theme.typography.fontSize.sm }}>
              {area}
            </Text>
          </Pressable>
        ))}
      </View>

      <GlassCard>
        <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
          Pin location defaults to {municipality} town center until map-based picking is available. This affects delivery fee/ETA
          accuracy for real orders — see packages/ui-native/src/RapexMapView.tsx.
        </Text>
      </GlassCard>

      <Button
        label="Save Address"
        disabled={!canSave}
        onPress={() => {
          setDeliveryAddress({
            label: label.trim() || "Home",
            line: line.trim(),
            municipality,
            latitude: DEFAULT_LATITUDE,
            longitude: DEFAULT_LONGITUDE,
          });
          navigation.goBack();
        }}
      />
    </ScreenContainer>
  );
}
