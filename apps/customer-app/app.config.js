/**
 * Dynamic config (not app.json) on purpose: the react-native-maps config
 * plugin needs the Google Maps API key as a literal string in the native
 * manifests at prebuild time. Interpolating an env var into a static
 * app.json produces the literal placeholder string in AndroidManifest.xml
 * instead of the real key (a known Expo footgun) -- app.config.js is a
 * real script, so process.env is read and substituted correctly when
 * `expo prebuild` / `eas build` runs.
 *
 * EXPO_PUBLIC_GOOGLE_MAPS_API_KEY must be set in the build environment
 * (EAS secret or local .env.local) -- never hardcoded here. If unset, the
 * plugin is configured with an empty key and the map will fail to load,
 * not silently work -- see packages/ui-native/src/RapexMapView.tsx.
 *
 * bundleIdentifier/package below are a proposed default
 * (ph.rapex.customer), not yet confirmed as final -- see
 * docs/deployment/README.md.
 */
module.exports = {
  expo: {
    name: "customer-app",
    slug: "customer-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    ios: {
      supportsTablet: true,
      bundleIdentifier: "ph.rapex.customer",
    },
    android: {
      package: "ph.rapex.customer",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-secure-store",
      [
        "react-native-maps",
        {
          androidGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
          iosGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
        },
      ],
    ],
  },
};
