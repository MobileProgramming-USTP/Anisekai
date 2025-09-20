import { useMemo } from "react";
import { Stack } from "expo-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import Constants from "expo-constants";
import { AuthProvider } from "./context/AuthContext";

const isDev = __DEV__; // Expo sets this automatically

const resolveConvexUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
  if (envUrl && envUrl.length > 0) {
    return envUrl;
  }

  const extras = Constants?.expoConfig?.extra ?? {};

  if (isDev && typeof extras.convexDevUrl === "string" && extras.convexDevUrl.length > 0) {
    return extras.convexDevUrl;
  }

  if (typeof extras.convexProdUrl === "string" && extras.convexProdUrl.length > 0) {
    return extras.convexProdUrl;
  }

  if (typeof extras.convexDevUrl === "string" && extras.convexDevUrl.length > 0) {
    return extras.convexDevUrl;
  }

  return undefined;
};

export default function RootLayout() {
  const convex = useMemo(() => {
    const url = resolveConvexUrl();

    if (!url) {
      throw new Error(
        "Convex backend URL is not configured. Set EXPO_PUBLIC_CONVEX_URL or add convexDevUrl/convexProdUrl in expo.extra."
      );
    }

    return new ConvexReactClient(url);
  }, []);

  return (
    <AuthProvider>
      <ConvexProvider client={convex}>
        <Stack screenOptions={{ headerShown: false }} />
      </ConvexProvider>
    </AuthProvider>
  );
}
