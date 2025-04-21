import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function LoadingScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['rgba(12, 53, 106, 0.8)', 'rgba(12, 53, 106, 0.95)']}
      style={styles.container}
    >
      <Text style={styles.text}></Text>
    </LinearGradient>
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
  },
}); 