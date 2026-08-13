import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, ErrorState } from "@rapex/ui-native";
import { useAsyncAction, useRepositories } from "@rapex/api-client";
import type { RootStackParamList } from "../../types/navigation";
import { ScreenContainer } from "../../components/ScreenContainer";
import { PickerField } from "../../components/PickerField";
import { useAppTheme } from "../../hooks/useAppTheme";
import { calculateAge, resetRegistrationDraft, updateRegistrationDraft, useRegistrationDraft } from "../../services/registrationStore";

type Props = NativeStackScreenProps<RootStackParamList, "RegisterBirthday">;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => String(CURRENT_YEAR - i));
const MINIMUM_AGE = 18;

function daysInMonth(monthIndex: number, year: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Registration Step 2 of 7. Age is always derived from DOB -- never a
 * directly editable field. The instant `isUnderage` check below is local
 * UX only; `checkAge` additionally calls the real backend pre-auth gate
 * (POST /pre-auth/check-age), which enforces the actual 48-hour device/IP
 * lockout for underage attempts -- something a client-side check alone
 * can't do.
 */
export function RegisterBirthdayScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { auth } = useRepositories();
  const draft = useRegistrationDraft();
  const [month, setMonth] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const checkAge = useAsyncAction((birthYear: number) => auth.checkAge(birthYear));

  const monthIndex = month ? MONTHS.indexOf(month as (typeof MONTHS)[number]) : null;
  const days = useMemo(() => {
    const count = monthIndex !== null && year ? daysInMonth(monthIndex, Number(year)) : 31;
    return Array.from({ length: count }, (_, i) => String(i + 1));
  }, [monthIndex, year]);

  const isoDob = monthIndex !== null && day && year
    ? `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    : null;
  const age = isoDob ? calculateAge(isoDob) : null;
  const isUnderage = age !== null && age < MINIMUM_AGE;

  if (isUnderage) {
    return (
      <ScreenContainer title="Registration Restricted" subtitle="Step 2 of 7">
        <ErrorState
          title="You must be 18 or older"
          description={`RAPEX accounts require the account holder to be at least ${MINIMUM_AGE} years old. Based on the date of birth entered, this account cannot be created.`}
        />
        <Button
          label="Exit Registration"
          variant="secondary"
          onPress={() => {
            resetRegistrationDraft();
            navigation.popToTop();
          }}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer title="Date of Birth" subtitle="Step 2 of 7 -- Used to confirm you're eligible to use RAPEX">
      <PickerField label="Month" value={month} options={[...MONTHS]} onSelect={setMonth} />
      <PickerField label="Day" value={day} options={days} onSelect={setDay} disabled={monthIndex === null} />
      <PickerField label="Year" value={year} options={YEARS} onSelect={setYear} />

      {age !== null ? (
        <View style={{ paddingVertical: theme.spacing.sm }}>
          <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>Your Age</Text>
          <Text style={{ fontSize: theme.typography.fontSize["2xl"], fontWeight: "700", color: theme.colors.textPrimary }}>
            {age} years old
          </Text>
        </View>
      ) : null}

      {checkAge.error ? <ErrorState title="Registration restricted" description={checkAge.error} /> : null}

      <Button
        label="Continue"
        loading={checkAge.loading}
        disabled={!isoDob}
        onPress={async () => {
          if (!isoDob || age === null || !year) return;
          await checkAge.execute(Number(year));
          updateRegistrationDraft({ dateOfBirth: isoDob, age });
          navigation.navigate("Register");
        }}
      />
    </ScreenContainer>
  );
}
