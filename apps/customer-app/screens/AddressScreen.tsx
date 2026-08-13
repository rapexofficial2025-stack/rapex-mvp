import { useEffect, useState } from "react";
import { Platform, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import { Badge, Button, GlassCard, Input, RapexMapView } from "@rapex/ui-native";
import { PILOT_AREAS, PH_REGION, PH_PROVINCE, PILOT_MUNICIPALITY_GEOGRAPHY, type PilotArea } from "@rapex/constants";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { PickerField } from "../components/PickerField";
import { useAppTheme } from "../hooks/useAppTheme";
import { getDeliveryAddress, setDeliveryAddress } from "../services/addressStore";
import { updateRegistrationDraft, useRegistrationDraft } from "../services/registrationStore";

/** Imus, Cavite -- RAPEX's pilot area, matches XanoMerchantRepository's default. Used only when no GPS fix exists. */
const DEFAULT_LATITUDE = 14.4297;
const DEFAULT_LONGITUDE = 120.936;

const ADDRESS_LABELS = ["House", "Office", "Store", "Business", "Friends", "Partner", "Other"] as const;
type AddressLabel = (typeof ADDRESS_LABELS)[number];
const isAddressLabel = (value: string | undefined): value is AddressLabel => (ADDRESS_LABELS as readonly string[]).includes(value ?? "");

type Props = NativeStackScreenProps<RootStackParamList, "Address">;

export function AddressScreen({ navigation, route }: Props) {
  const theme = useAppTheme();
  const fromRegistration = route.params?.fromRegistration ?? false;
  const registrationDraft = useRegistrationDraft();
  const existing = getDeliveryAddress();

  const [label, setLabel] = useState<AddressLabel>(isAddressLabel(existing?.label) ? existing.label : "House");
  const [municipality, setMunicipality] = useState<PilotArea>((existing?.municipality as PilotArea) ?? PILOT_AREAS[0]);
  const [barangay, setBarangay] = useState(existing?.barangay ?? "");
  const [subdivision, setSubdivision] = useState(existing?.subdivision ?? "");
  const [street, setStreet] = useState(existing?.street ?? "");
  const [block, setBlock] = useState(existing?.block ?? "");
  const [lot, setLot] = useState(existing?.lot ?? "");
  const [phase, setPhase] = useState(existing?.phase ?? "");
  const [building, setBuilding] = useState(existing?.building ?? "");
  const [floor, setFloor] = useState(existing?.floor ?? "");
  const [roomUnit, setRoomUnit] = useState(existing?.roomUnit ?? "");

  const [gpsLatitude, setGpsLatitude] = useState(existing?.latitude ?? registrationDraft.gpsLatitude);
  const [gpsLongitude, setGpsLongitude] = useState(existing?.longitude ?? registrationDraft.gpsLongitude);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  async function useCurrentLocation() {
    setLocating(true);
    setLocationError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setLocationError("Location access denied — using the default town-center coordinates instead.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      setGpsLatitude(position.coords.latitude);
      setGpsLongitude(position.coords.longitude);
      updateRegistrationDraft({ gpsLatitude: position.coords.latitude, gpsLongitude: position.coords.longitude });
    } catch {
      setLocationError("Couldn't get your location. Check that location services are enabled and try again.");
    } finally {
      setLocating(false);
    }
  }

  // Force-open this screen with the user's current GPS fix as the default
  // starting point (same real expo-location capture as RegisterLocationScreen,
  // just auto-triggered here too) so opening Address directly -- not only via
  // the registration wizard -- still defaults to "where I am right now"
  // instead of silently falling back to the town-center coordinates.
  useEffect(() => {
    if (gpsLatitude === null && gpsLongitude === null) {
      useCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const postalCode = PILOT_MUNICIPALITY_GEOGRAPHY[municipality].postalCode;
  const canSave = subdivision.trim().length > 0 && street.trim().length > 0 && barangay.trim().length > 0;

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
      {Platform.OS === "web" ? (
        <Badge label="Map picker needs a Google Maps API key (UNVERIFIED, not wired in yet), and react-native-maps has no web build — using GPS/town-center coordinates on web. Run this on iOS/Android for the real map." tone="warning" />
      ) : (
        <>
          <Badge label="Map picker needs a Google Maps API key (UNVERIFIED, not wired in yet) — pin position uses GPS/town-center coordinates" tone="warning" />
          <View style={{ height: 220, borderRadius: theme.radius.lg, overflow: "hidden" }}>
            <RapexMapView
              key={`${gpsLatitude ?? DEFAULT_LATITUDE}-${gpsLongitude ?? DEFAULT_LONGITUDE}`}
              markers={[{ id: "delivery-pin", role: "customer", latitude: gpsLatitude ?? DEFAULT_LATITUDE, longitude: gpsLongitude ?? DEFAULT_LONGITUDE, label }]}
              initialLatitude={gpsLatitude ?? DEFAULT_LATITUDE}
              initialLongitude={gpsLongitude ?? DEFAULT_LONGITUDE}
            />
          </View>
        </>
      )}

      <View style={{ gap: theme.spacing.xs }}>
        {locationError ? <Badge label={locationError} tone="warning" /> : gpsLatitude !== null && gpsLongitude !== null ? (
          <Badge label={`Using your location: ${gpsLatitude.toFixed(5)}, ${gpsLongitude.toFixed(5)}`} tone="success" />
        ) : null}
        <Button label={locating ? "Locating..." : "Use Current Location"} variant="secondary" loading={locating} onPress={useCurrentLocation} />
      </View>

      <PickerField label="Label" value={label} options={[...ADDRESS_LABELS]} onSelect={(value) => setLabel(value as AddressLabel)} />

      <Text style={{ fontSize: theme.typography.fontSize.sm, fontWeight: "700", color: theme.colors.textPrimary, marginTop: theme.spacing.sm }}>
        Region / Province / Municipality
      </Text>
      <Input label="Region" value={PH_REGION} editable={false} />
      <Input label="Province" value={PH_PROVINCE} editable={false} />
      <PickerField
        label="Municipality / City"
        value={municipality}
        options={[...PILOT_AREAS]}
        onSelect={(value) => setMunicipality(value as PilotArea)}
      />
      {/*
        Barangay-level PSGC dataset not seeded (see @rapex/constants'
        geography.ts doc comment) -- free text rather than a fabricated
        dropdown list, to avoid shipping wrong official barangay names.
      */}
      <Input label="Barangay" placeholder="Enter your barangay" value={barangay} onChangeText={setBarangay} />
      <Input label="Postal Code" value={postalCode} editable={false} />

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
          Pin location {gpsLatitude !== null ? "uses your current GPS coordinates" : `defaults to ${municipality} town center`} until
          map-based picking is available. This affects delivery fee/ETA accuracy for real orders — see packages/ui-native/src/RapexMapView.tsx.
        </Text>
      </GlassCard>

      <Button
        label={fromRegistration ? "Continue" : "Save Address"}
        disabled={!canSave}
        onPress={() => {
          const latitude = gpsLatitude ?? DEFAULT_LATITUDE;
          const longitude = gpsLongitude ?? DEFAULT_LONGITUDE;
          const address = {
            label,
            line,
            municipality,
            latitude,
            longitude,
            region: PH_REGION,
            province: PH_PROVINCE,
            barangay: barangay.trim(),
            postalCode,
            subdivision: subdivision.trim(),
            street: street.trim(),
            block: block.trim(),
            lot: lot.trim(),
            phase: phase.trim(),
            building: building.trim(),
            floor: floor.trim(),
            roomUnit: roomUnit.trim(),
          };
          setDeliveryAddress(address);
          if (fromRegistration) {
            updateRegistrationDraft({
              region: PH_REGION,
              province: PH_PROVINCE,
              municipality,
              barangay: barangay.trim(),
              postalCode,
              subdivision: subdivision.trim(),
              street: street.trim(),
              block: block.trim(),
              lot: lot.trim(),
              phase: phase.trim(),
              building: building.trim(),
              floor: floor.trim(),
              roomUnit: roomUnit.trim(),
            });
            navigation.navigate("WelcomeVideo");
          } else {
            navigation.goBack();
          }
        }}
      />
    </ScreenContainer>
  );
}
