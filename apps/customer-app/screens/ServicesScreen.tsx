import { useState } from "react";
import { View } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Badge } from "@rapex/ui-native";
import type { MainTabParamList, RootStackParamList } from "../types/navigation";
import { useAppTheme } from "../hooks/useAppTheme";
import { ScreenContainer } from "../components/ScreenContainer";
import { CategoryCard } from "../components/CategoryCard";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Services">,
  NativeStackScreenProps<RootStackParamList>
>;

// UI-only category list -- matches the "Freelance / Service Provider" +
// "Service Category" tables reported in docs/database/data-dictionary.md,
// but no confirmed Xano endpoint exists yet to list real providers per
// category, so tapping one shows an honest "not available yet" state
// instead of a fake booking flow.
const SERVICE_CATEGORIES = [
  { key: "plumbing", iconLabel: "🔧", name: "Plumbing" },
  { key: "electrical", iconLabel: "💡", name: "Electrical" },
  { key: "cleaning", iconLabel: "🧹", name: "Cleaning" },
  { key: "beauty", iconLabel: "💇", name: "Beauty" },
  { key: "repair", iconLabel: "🛠️", name: "Home Repair" },
  { key: "tutoring", iconLabel: "📚", name: "Tutoring" },
  { key: "events", iconLabel: "🎉", name: "Events" },
  { key: "more", iconLabel: "➕", name: "More" },
] as const;

export function ServicesScreen({}: Props) {
  const theme = useAppTheme();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <ScreenContainer title="Services" subtitle="Book trusted local service providers.">
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.lg, justifyContent: "flex-start" }}>
        {SERVICE_CATEGORIES.map((category) => (
          <CategoryCard
            key={category.key}
            iconLabel={category.iconLabel}
            name={category.name}
            onPress={() => setSelected(category.name)}
          />
        ))}
      </View>
      {selected ? (
        <View style={{ marginTop: theme.spacing.lg, gap: theme.spacing.sm }}>
          <Badge label={`${selected} — no provider-listing endpoint confirmed yet`} tone="warning" />
        </View>
      ) : null}
    </ScreenContainer>
  );
}
