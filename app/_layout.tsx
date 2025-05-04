import FontAwesome from "@expo/vector-icons/FontAwesome";
// Suggested code may be subject to a license. Learn more: ~LicenseLog:1250175801.
import React from "react";
import { useFonts } from "expo-font";
import { Redirect, Slot, Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// This hook will protect the route access based on user authentication
function useProtectedRoute(isAuthenticated: boolean) {
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const initialRender = useRef(true);
  
  // Set up a ref to track if we've already redirected
  const hasRedirected = useRef(false);

  // Mark navigation as ready after the first render cycle
  useEffect(() => {
    if (!isNavigationReady) {
      const timeout = setTimeout(() => {
        setIsNavigationReady(true);
      }, 300); // Increased timeout to ensure navigation is ready
      
      return () => clearTimeout(timeout);
    }
  }, [isNavigationReady]);
  
  useEffect(() => {
    // Skip the first render to avoid early navigation
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    
    // Only run navigation logic if navigation is ready and we haven't redirected yet
    if (!isNavigationReady || hasRedirected.current) return;
    
    const inAuthGroup = segments[0] === 'auth';
    
    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the login page if not authenticated and not already in the auth group
      hasRedirected.current = true;
      // Use setTimeout to ensure this happens after the component is mounted
      setTimeout(() => {
        router.replace('/auth/login');
      }, 0);
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to the home page if authenticated and trying to access auth pages
      hasRedirected.current = true;
      // Use setTimeout to ensure this happens after the component is mounted
      setTimeout(() => {
        router.replace('/');
      }, 0);
    }
  }, [isAuthenticated, segments, router, isNavigationReady]);
}

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  // Set up protected routes
  useProtectedRoute(isAuthenticated);

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isLoading]);

  // Show loading screen while fonts are loading or auth state is being determined
  if (!loaded || isLoading) {
    return <Slot />;
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
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      
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
      <Stack.Screen 
        name="interactions/edit/[id]" 
        options={{ 
          title: "Edit Interaction",
          presentation: 'modal',
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
      <Stack.Screen 
        name="tasks/edit/[id]" 
        options={{ 
          title: "Edit Task",
          presentation: 'modal',
        }} 
      />
    </Stack>
  );
}