import { useMemo } from "react";
import { Stack } from "expo-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import Constants from "expo-constants";
import { AuthProvider } from "./context/AuthContext";

const resolveConvexUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_CONVEX_URL?.trim();
  if (envUrl) {
    return envUrl;
  }

  const extras = Constants?.expoConfig?.extra ?? {};
  const requestedEnv = (
    process.env.EXPO_PUBLIC_CONVEX_ENV ||
    extras.convexDefaultEnv ||
    (__DEV__ ? "development" : "production")
  ).toLowerCase();

  if (requestedEnv === "production" && typeof extras.convexProdUrl === "string" && extras.convexProdUrl.length > 0) {
    return extras.convexProdUrl;
  }

  if (requestedEnv === "development" && typeof extras.convexDevUrl === "string" && extras.convexDevUrl.length > 0) {
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
