import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, ErrorState, Loading } from "@rapex/ui-native";
import { useRepositories, type Community } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppTheme } from "../hooks/useAppTheme";
import { updateRegistrationDraft, useRegistrationDraft } from "../services/registrationStore";

type Props = NativeStackScreenProps<RootStackParamList, "Community">;

/**
 * Optional, reachable from Profile (same pattern as Address/Identity) --
 * real communities fetched from Xano's `rapex-core/community-master`
 * (2026-08-14 handover, GET-only confirmed). No confirmed endpoint yet to
 * save the choice server-side, so the selection is kept locally in
 * registrationStore, same honest-gap pattern as every other
 * unconfirmed-write field in this codebase -- not silently pretending it
 * was saved to a profile record that doesn't exist yet.
 */
export function CommunityScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { referenceData } = useRepositories();
  const draft = useRegistrationDraft();
  const [communities, setCommunities] = useState<Community[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setError(null);
    setCommunities(null);
    referenceData
      ?.getCommunities()
      .then(setCommunities)
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load the community list."));
  }

  useEffect(load, [referenceData]);

  return (
    <ScreenContainer title="Your Community" subtitle="RAPEX would love to know your community">
      {communities === null && !error ? <Loading label="Loading communities…" /> : null}
      {error ? <ErrorState description={error} onRetry={load} /> : null}

      {communities ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}>
          {communities.map((community) => {
            const active = draft.communityId === community.id;
            return (
              <Pressable
                key={community.id}
                onPress={() => updateRegistrationDraft({ communityId: community.id, communityName: community.name })}
                style={{
                  paddingVertical: theme.spacing.sm,
                  paddingHorizontal: theme.spacing.md,
                  borderRadius: theme.radius.full,
                  borderWidth: 1,
                  borderColor: active ? theme.colors.brandPrimary : theme.colors.border,
                  backgroundColor: active ? theme.colors.brandPrimary : theme.colors.surface,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: "700",
                    color: active ? theme.colors.textInverse : theme.colors.textPrimary,
                  }}
                >
                  {community.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <Button label="Save" disabled={!draft.communityId} onPress={() => navigation.navigate("Profile")} />
    </ScreenContainer>
  );
}
