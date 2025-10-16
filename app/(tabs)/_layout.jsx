import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { LibraryProvider } from "../context/LibraryContext";

const TAB_BAR_HEIGHT = 80;

export default function TabsLayout() {
  const tabBarBottomOffset = Platform.select({ ios: 24, default: 16 });
  const tabBarTotalInset = TAB_BAR_HEIGHT + tabBarBottomOffset;

  return (
    <LibraryProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#fcbf49",
          tabBarInactiveTintColor: "#A5B2C2",
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginBottom: Platform.OS === "ios" ? -5 : 0,
          },
          tabBarStyle: {
            backgroundColor: "#0F1719",
            borderTopWidth: 0,
            height: TAB_BAR_HEIGHT,
            paddingBottom: 10,
            paddingTop: 5,
            elevation: 10,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 8,
            position: "absolute",
            bottom: tabBarBottomOffset,
          },
          sceneContainerStyle: {
            paddingBottom: tabBarTotalInset,
            backgroundColor: "#0F1719",
          },
          tabBarBackground: () => (
            <View style={styles.tabBarBackground}>
              <View
                style={[
                  styles.tabBarBackgroundExtension,
                  { height: tabBarBottomOffset, bottom: -tabBarBottomOffset },
                ]}
              />
            </View>
          ),
          tabBarButton: (props) => <Pressable {...props} android_ripple={null} />,
        }}
    >
      <Tabs.Screen
        name="explore/index"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "search" : "search-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "bookmark" : "bookmark-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="home/index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="miscellaneous/index"
        options={{
          title: "Misc",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "dice" : "dice-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  </LibraryProvider>
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    flex: 1,
    backgroundColor: "#0F1719",
  },
  tabBarBackgroundExtension: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#0F1719",
  },
});
