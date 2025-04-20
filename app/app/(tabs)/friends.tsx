import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import TopIcons from '@/components/TopIcons';
import { Ionicons } from '@expo/vector-icons';

// Sample friends data
const sampleFriends = [
  {
    id: 1,
    name: 'Alex Johnson',
    status: 'Active now',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex',
    lastActive: '2 minutes ago',
  },
  {
    id: 2,
    name: 'Sarah Williams',
    status: 'Meditating',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah',
    lastActive: '5 minutes ago',
  },
  {
    id: 3,
    name: 'Michael Brown',
    status: 'In a session',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Michael',
    lastActive: '10 minutes ago',
  },
  {
    id: 4,
    name: 'Emily Davis',
    status: 'Available',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Emily',
    lastActive: '15 minutes ago',
  },
  {
    id: 5,
    name: 'David Wilson',
    status: 'In a group session',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=David',
    lastActive: '20 minutes ago',
  },
];

export default function FriendsScreen() {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter friends based on search term
  const filteredFriends = sampleFriends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <LinearGradient
      colors={['#EBF7FF', '#0C356A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <TopIcons />
          
          <View style={styles.container}>
            <Text style={styles.title}>Friends</Text>

            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search friends..."
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <View style={styles.friendsList}>
              {filteredFriends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.friendItem}
                >
                  <View style={styles.friendInfo}>
                    <Image
                      source={{ uri: friend.avatar }}
                      style={styles.avatar}
                    />
                    <View style={styles.friendDetails}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <Text style={styles.friendStatus}>{friend.status}</Text>
                    </View>
                  </View>
                  <View style={styles.friendActions}>
                    <Text style={styles.lastActive}>{friend.lastActive}</Text>
                    <TouchableOpacity style={styles.statsButton}>
                      <Ionicons name="stats-chart" size={20} color="#0C356A" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 60,
    paddingTop: 10,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: 'JakartaBold',
    marginBottom: 20,
    color: '#333',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  friendsList: {
    flex: 1,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontFamily: 'JakartaBold',
    color: '#333',
    marginBottom: 4,
  },
  friendStatus: {
    fontSize: 14,
    color: '#666',
  },
  lastActive: {
    fontSize: 12,
    color: '#666',
    marginRight: 10,
  },
  friendActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsButton: {
    padding: 8,
    backgroundColor: '#EBF7FF',
    borderRadius: 8,
  },
});
