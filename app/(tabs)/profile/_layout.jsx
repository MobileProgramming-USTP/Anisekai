import { Stack } from "expo-router";

const ProfileStackLayout = () => (
  <Stack
    screenOptions={{
      headerShown: false,
      animation: "slide_from_right",
    }}
  />
);

export default ProfileStackLayout;
