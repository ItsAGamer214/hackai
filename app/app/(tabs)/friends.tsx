import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function FriendsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topIcons}>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Ionicons name="person-outline" size={28} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Friends</Text>
        <View style={styles.content}>
          <Text style={styles.text}>Your friends will appear here</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EBF7FF',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
  },
  topIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontFamily: 'JakartaBold',
    marginBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    fontFamily: 'JakartaBold',
    color: '#666',
  },
});
