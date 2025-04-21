import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export default function SignupScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !age || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
        age,
        phone: phone || '',
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Success', 'Account created!');
      router.push('/(auth)/login');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/background.jpg')}
      style={styles.backgroundImage}
    >
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>gateway</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Sign Up</Text>

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="First Name"
                placeholderTextColor="#a0a0a0"
                value={firstName}
                onChangeText={setFirstName}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Last Name"
                placeholderTextColor="#a0a0a0"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#a0a0a0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Age"
                placeholderTextColor="#a0a0a0"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Phone (optional)"
                placeholderTextColor="#a0a0a0"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#a0a0a0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#a0a0a0"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
              <Text style={styles.signupButtonText}>Create Account</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  signupButton: {
    backgroundColor: '#0C356A',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 16,
  },
  signupButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: '#333',
  },
  loginLink: {
    color: '#0C356A',
    fontWeight: 'bold',
  },
});
