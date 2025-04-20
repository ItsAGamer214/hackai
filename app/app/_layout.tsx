import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showLoading, setShowLoading] = useState(true);
  const [loaded] = useFonts({
    JakartaBold: require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (showLoading && loaded) {
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [showLoading, loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {showLoading ? (
        <LinearGradient
          colors={['rgba(12, 53, 106, 0.8)', 'rgba(12, 53, 106, 0.95)']}
          style={styles.container}
        >
          <Text style={styles.text}>Around 1 in 7 of the world's adolescents have a mental disorder.</Text>
        </LinearGradient>
      ) : (
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      )}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'JakartaBold',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
