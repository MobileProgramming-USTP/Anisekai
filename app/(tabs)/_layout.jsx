import { Ionicons } from "@expo/vector-icons"
import { Tabs } from "expo-router"
import { Pressable } from "react-native"

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#000000ff",
                tabBarInactiveTintColor: "#fcbf49",
                tabBarStyle: { 
                    borderTopWidth: 1,
                    borderTopColor: "black",
                    height: 90,
                    paddingBottom: 30,
                    paddingTop: 10, 
                },

            tabBarButton: (props) => (
                <Pressable
                    {...props}
                    android_ripple={null}
                />
            ),               
            }}
            >
            <Tabs.Screen 
            name="dashboard" 
            options={{ 
                title: "Dashboard",
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="home" color={color} size={size} />
                ),                
             }} 
            />  
         <Tabs.Screen 
            name="profile" 
            options={{ 
                title: "Profile",
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="person" color={color} size={size} />
                ),                
             }} 
            />  
         <Tabs.Screen 
            name="settings" 
            options={{ 
                title: "Settings",
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="settings" color={color} size={size} />
                ),                
             }} 
            /> 
        </Tabs>
        
    )
}