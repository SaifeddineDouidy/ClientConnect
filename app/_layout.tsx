import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/Colors";
import React from "react";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <StatusBar style="dark" />
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Client Screens */}
      <Stack.Screen 
        name="clients/[id]" 
        options={{ 
          title: "Client Details",
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="clients/add" 
        options={{ 
          title: "Add Client",
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="clients/edit/[id]" 
        options={{ 
          title: "Edit Client",
          presentation: 'modal',
        }} 
      />
      
      {/* Opportunity Screens */}
      <Stack.Screen 
        name="opportunities/[id]" 
        options={{ 
          title: "Opportunity Details",
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="opportunities/add" 
        options={{ 
          title: "Add Opportunity",
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="opportunities/edit/[id]" 
        options={{ 
          title: "Edit Opportunity",
          presentation: 'modal',
        }} 
      />
      
      {/* Interaction Screens */}
      <Stack.Screen 
        name="interactions/add" 
        options={{ 
          title: "Add Interaction",
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="interactions/[id]" 
        options={{ 
          title: "Interaction Details",
          animation: 'slide_from_right',
        }} 
      />
      
      {/* Task Screens */}
      <Stack.Screen 
        name="tasks/add" 
        options={{ 
          title: "Add Task",
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="tasks/[id]" 
        options={{ 
          title: "Task Details",
          animation: 'slide_from_right',
        }} 
      />
    </Stack>
  );
}