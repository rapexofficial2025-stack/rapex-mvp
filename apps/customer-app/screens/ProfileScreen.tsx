import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Avatar, Badge, Button, ErrorState, GlassCard, Loading } from "@rapex/ui-native";
import { useRepositories, type AuthMeResponse, type AuthUser } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppTheme } from "../hooks/useAppTheme";
import { LANGUAGE_OPTIONS, updateRegistrationDraft, useRegistrationDraft, type RapexLanguage } from "../services/registrationStore";
import { useDeliveryAddress } from "../services/addressStore";
import { useProfilePhotoUri, setProfilePhotoUri } from "../services/profilePhotoStore";

export type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, "Profile">;
type Props = ProfileScreenProps;

function Row({ label, value }: { label: string; value: string }) {
  const theme = useAppTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>{label}</Text>
      <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize.sm, fontWeight: "600" }}>{value}</Text>
    </View>
  );
}

/** Large, high-contrast, tappable checklist row -- 48px+ touch target per accessibility instruction. */
function ChecklistRow({ label, done, statusText, onPress }: { label: string; done: boolean; statusText: string; onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.sm,
        minHeight: 48,
        paddingVertical: theme.spacing.xs,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: done ? theme.colors.success : "transparent",
          borderWidth: done ? 0 : 2,
          borderColor: theme.colors.textSecondary,
        }}
      >
        {done ? <Text style={{ color: theme.colors.textInverse, fontWeight: "800" }}>{"✓"}</Text> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize.base, fontWeight: "700" }}>{label}</Text>
        <Text style={{ color: done ? theme.colors.success : theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm, fontWeight: "600" }}>
          {statusText}
        </Text>
      </View>
    </Pressable>
  );
}

/**
 * Per instruction: never trust frontend-calculated Age/Role/Verification/
 * Account Status -- display Xano's authoritative response. Xano's confirmed
 * `/auth/signup` and `/auth/login` contracts (see XanoAuthRepository)
 * return no verification/account-status field at all (no `/auth/me`
 * endpoint exists yet), so those sections say exactly that instead of
 * inventing a status. `user.role` IS authoritative (fixed per app
 * instance, matches the X-RAPEX-App header convention) and is shown as-is.
 * Everything under "Registration Details" is explicitly labeled
 * self-reported/local-only, since none of it has a confirmed Xano field to
 * round-trip through yet.
 */
export function ProfileScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { auth } = useRepositories();
  const draft = useRegistrationDraft();
  const address = useDeliveryAddress();
  const localPhotoUri = useProfilePhotoUri();
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  // Real GET /auth/me read (2026-08-14 Xano confirmation) -- backs the
  // "Complete Your Profile" progress number below. `undefined` while
  // loading, `null` once resolved with no session or a failed fetch (never
  // hangs forever on a real network error).
  const [authMe, setAuthMe] = useState<AuthMeResponse | null | undefined>(undefined);

  useEffect(() => {
    auth.getCurrentUser().then(setUser);
    auth.getAuthMe().then(setAuthMe).catch(() => setAuthMe(null));
  }, [auth]);

  async function pickPhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (result.canceled || result.assets.length === 0) return;
    setProfilePhotoUri(result.assets[0].uri);
  }

  async function enableGps() {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return;
    const position = await Location.getCurrentPositionAsync({});
    updateRegistrationDraft({ gpsLatitude: position.coords.latitude, gpsLongitude: position.coords.longitude, useGpsAsHomeAddress: true });
  }

  if (user === undefined || authMe === undefined) return <Loading label="Loading profile…" />;
  if (user === null) return <ErrorState title="Not signed in" description="Log in to view your profile." />;

  const kycCaptured = draft.idFrontUri && draft.idBackUri && draft.selfieUri;

  // Per-row done/statusText below are still computed from real local/
  // registration state -- Xano's confirmed `profile_checklist` is an array,
  // but its *item* shape (field names, and what an entry's presence means)
  // wasn't specified beyond that, so mapping individual rows to it would
  // mean guessing a contract rather than reading a confirmed one. The
  // fetched array is available on `authMe.profileChecklist` for whenever
  // that shape is confirmed.
  const contactVerifiedDone = draft.mobileVerified && draft.emailVerified;
  const addressSetDone = address !== null;
  const kycDone = !!kycCaptured;

  // The completion PERCENT, unlike the per-row detail above, IS a
  // confirmed, unambiguous Xano field (`registration_progress`, integer
  // 0-100) -- real backend value, not locally computed. `null` while it
  // hasn't loaded/isn't available; the card shows an honest loading state
  // rather than a guessed number in that case.
  const setupPercent = authMe?.registrationProgress ?? null;
  const setupComplete = setupPercent === 100;

  const registrationSteps: { label: string; done: boolean }[] = [
    { label: "Language", done: draft.language !== null },
    { label: "Date of Birth", done: draft.dateOfBirth !== null },
    { label: "Account", done: draft.email.length > 0 },
    { label: "Identity (KYC)", done: !!kycCaptured },
    { label: "Contact Verification", done: draft.mobileVerified && draft.emailVerified },
    { label: "Location", done: draft.gpsLatitude !== null },
    { label: "Address", done: address !== null },
  ];

  return (
    <ScreenContainer title="Profile" subtitle="Account settings and verification status">
      <View style={{ alignItems: "center", gap: theme.spacing.sm }}>
        {localPhotoUri ? (
          <Image source={{ uri: localPhotoUri }} style={{ width: 72, height: 72, borderRadius: 36 }} />
        ) : (
          <Avatar name={user.name || user.email} size="lg" />
        )}
        <Button label="Change Profile Photo" variant="outline" size="sm" onPress={pickPhoto} />
      </View>

      {!setupComplete ? (
        <GlassCard>
          <Text
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: "800",
              color: theme.colors.textPrimary,
              marginBottom: theme.spacing.xs,
            }}
          >
            Complete Your Profile to Begin Ordering
          </Text>
          <Text style={{ fontSize: theme.typography.fontSize.sm, fontWeight: "700", color: theme.colors.brandPrimary, marginBottom: theme.spacing.sm }}>
            {setupPercent !== null ? `${setupPercent}% Completed` : "Loading progress…"}
          </Text>
          <View
            style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.surfaceAlt,
              overflow: "hidden",
              marginBottom: theme.spacing.sm,
            }}
          >
            <View style={{ height: "100%", width: `${setupPercent ?? 0}%`, borderRadius: 4, backgroundColor: theme.colors.brandPrimary }} />
          </View>

          <ChecklistRow
            label="Mobile & Email"
            done={contactVerifiedDone}
            statusText={contactVerifiedDone ? "Verified" : "Not verified yet"}
            onPress={() => navigation.navigate("RegisterContact")}
          />
          <ChecklistRow
            label="Delivery Address"
            done={addressSetDone}
            statusText={address ? `Set to ${[address.municipality, address.barangay].filter(Boolean).join("/")}` : "Not set"}
            onPress={() => navigation.navigate("Address")}
          />
          <ChecklistRow
            label="Government ID / KYC"
            done={kycDone}
            statusText={kycDone ? "Uploaded" : "Pending Upload"}
            onPress={() => navigation.navigate("RegisterIdentity")}
          />
        </GlassCard>
      ) : null}

      <GlassCard>
        <Text style={{ fontSize: theme.typography.fontSize.base, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
          App Language
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
          {LANGUAGE_OPTIONS.map((lang) => (
            <Pressable
              key={lang.id}
              onPress={() => updateRegistrationDraft({ language: lang.id as RapexLanguage })}
              style={{
                paddingVertical: theme.spacing.xs,
                paddingHorizontal: theme.spacing.sm,
                borderRadius: theme.radius.md,
                backgroundColor: draft.language === lang.id ? theme.colors.brandPrimary : theme.colors.surfaceAlt,
              }}
            >
              <Text style={{ fontSize: theme.typography.fontSize.sm, fontWeight: "700", color: draft.language === lang.id ? theme.colors.textInverse : theme.colors.textPrimary }}>
                {lang.flag} {lang.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: theme.spacing.md }}>
          <View>
            <Text style={{ fontSize: theme.typography.fontSize.sm, fontWeight: "700", color: theme.colors.textPrimary }}>GPS Protection</Text>
            <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
              {draft.gpsLatitude !== null ? "Active -- helps prevent delivery scams" : "Off"}
            </Text>
          </View>
          <Button label={draft.gpsLatitude !== null ? "Active" : "Turn On"} size="sm" variant={draft.gpsLatitude !== null ? "secondary" : "primary"} onPress={enableGps} />
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: theme.spacing.md }}>
          <View>
            <Text style={{ fontSize: theme.typography.fontSize.sm, fontWeight: "700", color: theme.colors.textPrimary }}>Community</Text>
            <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
              {draft.communityName ?? "Not set"}
            </Text>
          </View>
          <Button label={draft.communityName ? "Change" : "Select"} size="sm" variant="secondary" onPress={() => navigation.navigate("Community")} />
        </View>
      </GlassCard>

      <GlassCard>
        <Text style={{ fontSize: theme.typography.fontSize.base, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
          Account Status
        </Text>
        <Row label="Role" value={user.role} />
        <Row label="RAPEX ID" value={user.rapexId ?? "Not yet assigned"} />
        <Badge label="Verification status: not available -- no confirmed Xano endpoint returns this yet" tone="neutral" />
      </GlassCard>

      <GlassCard>
        <Text style={{ fontSize: theme.typography.fontSize.base, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
          Registration Progress
        </Text>
        {registrationSteps.map((step) => (
          <Row key={step.label} label={step.label} value={step.done ? "Complete" : "Incomplete"} />
        ))}
      </GlassCard>

      <GlassCard>
        <Text style={{ fontSize: theme.typography.fontSize.base, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
          Personal Information
        </Text>
        <Row label="Name" value={user.name || "Not set"} />
        <Row label="Email" value={user.email} />
        <Row label="Phone" value={user.phone || "Not set"} />
        <Row label="Gender" value={draft.gender ?? "Not set"} />
        <Row label="Date of Birth" value={draft.dateOfBirth ?? "Not set"} />
        <Row label="Age" value={draft.age !== null ? `${draft.age} (self-reported, stored locally only)` : "Not set"} />
      </GlassCard>

      <GlassCard>
        <Text style={{ fontSize: theme.typography.fontSize.base, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
          Address
        </Text>
        {address ? (
          <>
            <Row label="Label" value={address.label} />
            <Row label="Address" value={address.line} />
            <Row label="Municipality" value={address.municipality} />
            <Row label="Barangay" value={address.barangay ?? "Not set"} />
            <Row label="Postal Code" value={address.postalCode ?? "Not set"} />
          </>
        ) : (
          <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>No address set.</Text>
        )}
        <Button label="Edit Address" variant="outline" size="sm" onPress={() => navigation.navigate("Address")} />
      </GlassCard>

      <GlassCard>
        <Text style={{ fontSize: theme.typography.fontSize.base, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
          KYC Status
        </Text>
        <Row label="ID Type" value={draft.idType ?? "Not set"} />
        <Row label="Front Captured" value={draft.idFrontUri ? "Yes" : "No"} />
        <Row label="Back Captured" value={draft.idBackUri ? "Yes" : "No"} />
        <Row label="Selfie With ID" value={draft.selfieUri ? "Yes" : "No"} />
        <Badge label="Not yet submitted to a verification backend -- endpoint not confirmed" tone="warning" />
      </GlassCard>

      <Button label="Wallet" onPress={() => navigation.navigate("Wallet")} />
      <Button label="My Orders" variant="secondary" onPress={() => navigation.navigate("Orders")} />
      <Button label="Earn & Rewards" variant="secondary" onPress={() => navigation.navigate("Earn")} />
      <Button label="Child Accounts" variant="secondary" onPress={() => navigation.navigate("ChildAccounts")} />
      <Button
        label="Log Out"
        variant="secondary"
        onPress={async () => {
          await auth.logout();
          navigation.replace("Welcome");
        }}
      />
    </ScreenContainer>
  );
}
