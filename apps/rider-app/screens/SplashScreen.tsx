import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useRepositories } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { useAppTheme } from "../hooks/useAppTheme";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

export function SplashScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { auth } = useRepositories();

  useEffect(() => {
    let cancelled = false;
    auth.getCurrentUser().then((user) => {
      if (cancelled) return;
      navigation.replace(user ? "MainTabs" : "Welcome");
    });
    return () => {
      cancelled = true;
    };
  }, [auth, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.brandPrimary }]}>
      <Text style={[styles.title, { color: theme.colors.textInverse }]}>RAPEX Rider</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textInverse }]}>Gawang Lokal, Para sa Masa</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 18 },
});
