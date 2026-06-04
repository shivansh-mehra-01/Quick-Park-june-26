import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { authService } from "../services/authService";

import { ThemeProvider } from "../context/ThemeContext";

function RootLayoutNav() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  // Every time the user navigates, we verify they are still authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.getCurrentUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, [segments]);

  useEffect(() => {
    if (isAuthenticated === null) return; // Still loading

    const isLoginScreen = segments[0] === 'login';
    const isRegisterScreen = segments[0] === 'register';
    const inAuthGroup = isLoginScreen || isRegisterScreen;

    if (!isAuthenticated && !inAuthGroup) {
      // User is not logged in and trying to access the app
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // User is already logged in but trying to see the login screen
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="history" />
      <Stack.Screen name="vehicles" />
      <Stack.Screen name="wallet" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}
