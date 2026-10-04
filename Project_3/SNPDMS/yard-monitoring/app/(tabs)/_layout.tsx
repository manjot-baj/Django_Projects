import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/authStore";
import { StyleSheet } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { accessToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      router.replace("/(auth)/login");
    }
  }, [accessToken]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarActiveTintColor: "#004474",
          tabBarInactiveTintColor: "gray",

          title: "Home",
          tabBarIcon: ({ color }) => (
            <AntDesign name="home" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="revenue"
        options={{
          tabBarActiveTintColor: "#004474",
          tabBarInactiveTintColor: "gray",
          title: "Revenue",
          tabBarIcon: ({ color }) => <AntDesign name="gold" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventory",
          tabBarActiveTintColor: "#004474",
          tabBarInactiveTintColor: "gray",
          tabBarIcon: ({ color }) => <AntDesign name="file-text" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="productivity"
        options={{
         tabBarActiveTintColor: "#004474",
          tabBarInactiveTintColor: "gray",
          title: "Productivity",
          tabBarIcon: ({ color }) => <AntDesign name="bar-chart" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  image: { width: "80%", height: "70%", objectFit: "contain" },
});
