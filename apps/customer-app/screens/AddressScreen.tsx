import { useState } from "react";
import { Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Badge, Button, GlassCard, Input } from "@rapex/ui-native";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { CascadingAddressPicker, EMPTY_CASCADING_ADDRESS, type CascadingAddressValue } from "../components/CascadingAddressPicker";
import { useAppTheme } from "../hooks/useAppTheme";
import { getDeliveryAddress, setDeliveryAddress } from "../services/addressStore";
import { updateRegistrationDraft, useRegistrationDraft } from "../services/registrationStore";

/** Imus, Cavite -- RAPEX's pilot area, matches XanoMerchantRepository's default. Used only when no GPS fix exists. */
const DEFAULT_LATITUDE = 14.4297;
const DEFAULT_LONGITUDE = 120.936;

type Props = NativeStackScreenProps<RootStackParamList, "Address">;

/**
 * `fromRegistration` means "reached from the post-registration onboarding
 * path" (Profile's Delivery Address checklist row / RegisterLocationScreen)
 * -- the real account already exists by the time anyone gets here
 * (RegisterAccountScreen creates it), so this only ever saves the address
 * locally and returns to Profile. No signup call happens on this screen.
 */
export function AddressScreen({ navigation, route }: Props) {
  const theme = useAppTheme();
  const fromRegistration = route.params?.fromRegistration ?? false;
  const registrationDraft = useRegistrationDraft();
  const existing = getDeliveryAddress();

  const [label, setLabel] = useState(existing?.label ?? "Home");
  const [address, setAddress] = useState<CascadingAddressValue>(EMPTY_CASCADING_ADDRESS);
  const [subdivision, setSubdivision] = useState(existing?.subdivision ?? "");
  const [street, setStreet] = useState(existing?.street ?? "");
  const [block, setBlock] = useState(existing?.block ?? "");
  const [lot, setLot] = useState(existing?.lot ?? "");
  const [phase, setPhase] = useState(existing?.phase ?? "");
  const [building, setBuilding] = useState(existing?.building ?? "");
  const [floor, setFloor] = useState(existing?.floor ?? "");
  const [roomUnit, setRoomUnit] = useState(existing?.roomUnit ?? "");

  const canSave = subdivision.trim().length > 0 && street.trim().length > 0 && address.barangayId !== null;

  const line = [
    roomUnit && `Rm/Unit ${roomUnit}`,
    floor && `Floor ${floor}`,
    building,
    `Blk ${block || "-"} Lot ${lot || "-"}`,
    phase && `Phase ${phase}`,
    subdivision,
    street,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <ScreenContainer title="Delivery Address" subtitle={fromRegistration ? "Step 7 of 7" : "Where should your order go?"}>
      <Badge label="Map picker needs a Google Maps API key (UNVERIFIED, not wired in yet) — using GPS/town-center coordinates" tone="warning" />

      <Input label="Label" placeholder="Home, Work, etc." value={label} onChangeText={setLabel} />

      <Text style={{ fontSize: theme.typography.fontSize.sm, fontWeight: "700", color: theme.colors.textPrimary, marginTop: theme.spacing.sm }}>
        Region / Province / Municipality / Barangay
      </Text>
      <CascadingAddressPicker value={address} onChange={setAddress} />

      <Text style={{ fontSize: theme.typography.fontSize.sm, fontWeight: "700", color: theme.colors.textPrimary, marginTop: theme.spacing.sm }}>
        Manual Address
      </Text>
      <Input label="Subdivision" value={subdivision} onChangeText={setSubdivision} />
      <Input label="Street" value={street} onChangeText={setStreet} />
      <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Input label="Block" value={block} onChangeText={setBlock} keyboardType="numbers-and-punctuation" />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="Lot" value={lot} onChangeText={setLot} keyboardType="numbers-and-punctuation" />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="Phase" value={phase} onChangeText={setPhase} keyboardType="numbers-and-punctuation" />
        </View>
      </View>

      <Text style={{ fontSize: theme.typography.fontSize.sm, fontWeight: "700", color: theme.colors.textPrimary, marginTop: theme.spacing.sm }}>
        Optional
      </Text>
      <Input label="Building" value={building} onChangeText={setBuilding} />
      <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Input label="Floor" value={floor} onChangeText={setFloor} />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="Room / Unit" value={roomUnit} onChangeText={setRoomUnit} />
        </View>
      </View>

      <GlassCard>
        <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
          Pin location {registrationDraft.gpsLatitude !== null ? "uses your captured GPS coordinates" : `defaults to ${address.municipalityName ?? "the selected"} town center`} until
          map-based picking is available. This affects delivery fee/ETA accuracy for real orders — see packages/ui-native/src/RapexMapView.tsx.
        </Text>
      </GlassCard>

      <Button
        label={fromRegistration ? "Continue" : "Save Address"}
        disabled={!canSave}
        onPress={() => {
          const latitude = registrationDraft.gpsLatitude ?? DEFAULT_LATITUDE;
          const longitude = registrationDraft.gpsLongitude ?? DEFAULT_LONGITUDE;
          const deliveryAddress = {
            label: label.trim() || "Home",
            line,
            municipality: address.municipalityName ?? "",
            latitude,
            longitude,
            region: address.regionName ?? "",
            province: address.provinceName ?? "",
            barangay: address.barangayName ?? "",
            subdivision: subdivision.trim(),
            street: street.trim(),
            block: block.trim(),
            lot: lot.trim(),
            phase: phase.trim(),
            building: building.trim(),
            floor: floor.trim(),
            roomUnit: roomUnit.trim(),
          };
          setDeliveryAddress(deliveryAddress);
          if (fromRegistration) {
            updateRegistrationDraft({
              region: address.regionName,
              province: address.provinceName,
              barangay: address.barangayName,
              regionId: address.regionId,
              regionName: address.regionName,
              provinceId: address.provinceId,
              provinceName: address.provinceName,
              municipalityId: address.municipalityId,
              municipalityName: address.municipalityName,
              barangayId: address.barangayId,
              barangayName: address.barangayName,
              subdivision: subdivision.trim(),
              street: street.trim(),
              block: block.trim(),
              lot: lot.trim(),
              phase: phase.trim(),
              building: building.trim(),
              floor: floor.trim(),
              roomUnit: roomUnit.trim(),
            });
            navigation.navigate("Profile");
          } else {
            navigation.goBack();
          }
        }}
      />
    </ScreenContainer>
  );
}
