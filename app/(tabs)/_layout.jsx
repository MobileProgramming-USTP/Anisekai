import { Ionicons } from "@expo/vector-icons"
import { Tabs } from "expo-router"

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#fcbf49",
                tabBarInactiveTintColor: "black",
                tabBarStyle: { 
                    borderTopWidth: 1,
                    borderTopColor: "black",
                    height: 90,
                    paddingBottom: 30,
                    paddingTop: 10, 
                },
            }}>
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
                    <Ionicons name="person-outline" color={color} size={size} />
                ),                
             }} 
            />  
         <Tabs.Screen 
            name="settings" 
            options={{ 
                title: "Settings",
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="settings-outline" color={color} size={size} />
                ),                
             }} 
            />  s    
        </Tabs>
    )
}