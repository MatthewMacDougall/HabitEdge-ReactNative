import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/hooks/useColorScheme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Customize Paper theme to match our dark theme
const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    surface: Colors.dark.card,
    error: Colors.dark.error,
    text: Colors.dark.text,
    secondaryContainer: Colors.dark.input,
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key || !fontsLoaded) return;

    const isOnboarding = segments[0] === 'onboarding';
    
    AsyncStorage.getItem('userRegistration').then(user => {
      if (!user && !isOnboarding) {
        router.replace('/onboarding');
      } else if (user && isOnboarding) {
        router.replace('/(tabs)');
      }
    });
  }, [segments, navigationState?.key, fontsLoaded]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <PaperProvider theme={customDarkTheme}>
      <ThemeProvider value={DarkTheme}>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          <StatusBar style="light" />
        </SafeAreaProvider>
      </ThemeProvider>
    </PaperProvider>
  );
}
