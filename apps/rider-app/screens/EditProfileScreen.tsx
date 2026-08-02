import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Input, Button, ErrorState, Loading } from "@rapex/ui-native";
import { useAsyncAction, useRepositories, useRiderProfile, type UpdateRiderProfileInput } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";

type Props = NativeStackScreenProps<RootStackParamList, "EditProfile">;

export function EditProfileScreen({ navigation }: Props) {
  const { rider } = useRepositories();
  const { data: profile, loading, error, refetch } = useRiderProfile();
  const [form, setForm] = useState<UpdateRiderProfileInput | null>(null);
  const save = useAsyncAction((input: UpdateRiderProfileInput) => rider!.updateProfile(input));

  useEffect(() => {
    if (profile && !form) {
      setForm({
        fullName: profile.fullName,
        phone: profile.phone,
        email: profile.email,
        address: profile.address,
        barangay: profile.barangay,
        municipality: profile.municipality,
        province: profile.province,
        plateNumber: profile.plateNumber,
      });
    }
  }, [profile, form]);

  if (loading || !form) return <Loading />;
  if (error || !profile) return <ErrorState description={error ?? "Could not load profile."} onRetry={refetch} />;

  return (
    <ScreenContainer title="Edit Profile" subtitle="Keep your rider details up to date">
      <Input label="Full Name" value={form.fullName} onChangeText={(v) => setForm((f) => ({ ...f!, fullName: v }))} />
      <Input label="Phone" keyboardType="phone-pad" value={form.phone} onChangeText={(v) => setForm((f) => ({ ...f!, phone: v }))} />
      <Input label="Email" autoCapitalize="none" value={form.email} onChangeText={(v) => setForm((f) => ({ ...f!, email: v }))} />
      <Input label="Address" value={form.address} onChangeText={(v) => setForm((f) => ({ ...f!, address: v }))} />
      <Input label="Barangay" value={form.barangay} onChangeText={(v) => setForm((f) => ({ ...f!, barangay: v }))} />
      <Input label="Municipality" value={form.municipality} onChangeText={(v) => setForm((f) => ({ ...f!, municipality: v }))} />
      <Input label="Province" value={form.province} onChangeText={(v) => setForm((f) => ({ ...f!, province: v }))} />
      <Input label="Plate Number" value={form.plateNumber} onChangeText={(v) => setForm((f) => ({ ...f!, plateNumber: v }))} />
      {save.error ? <ErrorState description={save.error} /> : null}
      <Button
        label="Save Changes"
        loading={save.loading}
        onPress={async () => {
          await save.execute(form);
          navigation.goBack();
        }}
      />
    </ScreenContainer>
  );
}
