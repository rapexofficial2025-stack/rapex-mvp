import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { SplashBackground } from "../components/ui/SplashBackground";

type Props = NativeStackScreenProps<AuthStackParamList, "Splash">;

/**
 * Screen 0 -- brand mark intro animation only (~3s), then hands off to
 * Welcome. The REX mp4 does NOT play here -- it plays at the END of the
 * SignUp flow (see WelcomeVideoScreen), matching how the real
 * apps/customer-app does it (RegisterSuccess -> WelcomeVideo). Visual
 * only, no backend call.
 */
export function SplashScreen({ navigation }: Props) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameTranslateY = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
    Animated.timing(logoScale, {
      toValue: 1,
      duration: 1400,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
    Animated.timing(logoRotate, {
      toValue: 1,
      duration: 1400,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
    Animated.timing(nameOpacity, {
      toValue: 1,
      duration: 900,
      delay: 1800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
    Animated.timing(nameTranslateY, {
      toValue: 0,
      duration: 900,
      delay: 1800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => navigation.replace("Welcome"), 3000);
    return () => clearTimeout(timer);
  }, [navigation]);

  const logoRotateDeg = logoRotate.interpolate({ inputRange: [0, 1], outputRange: ["-180deg", "0deg"] });

  return (
    <View style={styles.page}>
      <StatusBar style="light" hidden />
      <SplashBackground />
      <View style={styles.center}>
        <Animated.Image
          source={require("../assets/logo/glass-icon.png")}
          resizeMode="contain"
          style={[
            styles.logo,
            { opacity: logoOpacity, transform: [{ scale: logoScale }, { rotate: logoRotateDeg }] },
          ]}
        />
        <Animated.Image
          source={require("../assets/logo/rapex-name-only.png")}
          resizeMode="contain"
          style={[styles.wordmark, { opacity: nameOpacity, transform: [{ translateY: nameTranslateY }] }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#1A103D",
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    width: 260,
    alignItems: "center",
    zIndex: 10,
  },
  logo: {
    width: 160,
    height: 160,
  },
  wordmark: {
    width: 220,
    height: 90,
    marginTop: 18,
  },
});
