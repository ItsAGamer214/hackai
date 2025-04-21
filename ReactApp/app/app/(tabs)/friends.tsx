import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import TopIcons from '@/components/TopIcons';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

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
  const scrollY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const filteredFriends = sampleFriends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabBarOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 0.7],
    extrapolate: 'clamp',
  });

  return (
    <LinearGradient
      colors={['#EBF7FF', '#0C356A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView
          contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + 140 }]}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          <TopIcons />

          <View style={styles.section}>
            <Text style={styles.title}>Friends</Text>

            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search friends..."
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  placeholderTextColor="#6B7280"
                />
              </View>
            </View>

            <View style={styles.friendsList}>
              {filteredFriends.map(friend => (
                <TouchableOpacity key={friend.id} style={styles.friendItem}>
                  <View style={styles.friendInfo}>
                    <Image source={{ uri: friend.avatar }} style={styles.avatar} />
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

            {/* Find New Friends Section */}
            <TouchableOpacity style={styles.findNewButton}>
              <Text style={styles.findNewText}>🔍 Find New Friends</Text>
            </TouchableOpacity>
          </View>
        </Animated.ScrollView>

        <Animated.View
          style={[
            styles.tabBarBackground,
            {
              opacity: tabBarOpacity,
              bottom: insets.bottom,
            },
          ]}
        />
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
    paddingTop: 10,
  },
  section: {
    marginTop: 0,
    width: screenWidth,
    marginLeft: -20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'JakartaBold',
    marginBottom: 30,
    color: '#000000',
    paddingLeft: 20,
  },
  
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF7FF',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#94b4d1',
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
    paddingHorizontal: 20,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EBF7FF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#94b4d1',
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
    borderWidth: 1,
    borderColor: '#94b4d1',
  },
  findNewButton: {
    marginTop: 30,
    alignSelf: 'center',
    backgroundColor: '#0174BE',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 14,
  },
  findNewText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'JakartaBold',
  },
  tabBarBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#0C356A',
  },
});
