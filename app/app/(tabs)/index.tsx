import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Image, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';
import { router } from 'expo-router';
import { useState } from 'react';
import { NotificationPopup } from '@/components/NotificationPopup';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const [showNotifications, setShowNotifications] = useState(false);
  const educationTopics = [
    {
      title: 'Meditation',
      emoji: '🧘‍♂️',
      image: require('@/assets/images/rippling_water.jpg'),
    },
    {
      title: 'Mental Health Tips',
      emoji: '💡',
      image: require('@/assets/images/zen_stones.jpeg'),
    },
    { title: 'Mindfulness', emoji: '🧠' },
    { title: 'Journaling', emoji: '📓' },
    { title: 'Stress Relief', emoji: '😌' },
    { title: 'Breathing Exercises', emoji: '🌬️' },
  ];

  const scaleAnimations = educationTopics.map(() => new Animated.Value(1));

  const handleHoverIn = (index: number) => {
    Animated.spring(scaleAnimations[index], {
      toValue: 1.05,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  const handleHoverOut = (index: number) => {
    Animated.spring(scaleAnimations[index], {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  const levelProgress = 0.6;
  const moodChange = +12;
  const dailyStreak = 4;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topIcons}>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Ionicons name="person-outline" size={28} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowNotifications(true)}>
            <Ionicons name="notifications-outline" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <Text style={styles.greeting}>Good Morning!</Text>
        </View>

        {/* Education Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardScroll}
          >
            {educationTopics.map((topic, index) => (
              <TouchableOpacity
                key={index}
                onPressIn={() => handleHoverIn(index)}
                onPressOut={() => handleHoverOut(index)}
                activeOpacity={1}
              >
                <Animated.View 
                  style={[
                    styles.cardContainer,
                    { transform: [{ scale: scaleAnimations[index] }] }
                  ]}
                >
                  <Image
                    source={
                      topic.image
                        ? topic.image
                        : { uri: 'https://via.placeholder.com/260x200.png?text=Image' }
                    }
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.cardText}>
                    {topic.emoji} {topic.title}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Analytics Section */}
        <View style={styles.analyticsContainer}>
          <Text style={styles.analyticsTitle}>Your Analytics</Text>

          {/* Level */}
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsLabel}>Level</Text>
            <View style={styles.progressWrapper}>
              <ProgressBar
                progress={levelProgress}
                color="#0C356A"
                style={styles.progressBar}
              />
            </View>
          </View>

          {/* Mood + Streak */}
          <View style={styles.analyticsRow}>
            <View style={[styles.analyticsCard, { flex: 1 }]}>
              <Text style={styles.analyticsLabel}>Mood</Text>
              <Text
                style={[
                  styles.moodChange,
                  { color: moodChange >= 0 ? '#0C356A' : '#e53935' },
                ]}
              >
                {moodChange >= 0 ? '↑' : '↓'} {Math.abs(moodChange)}%
              </Text>
            </View>
            <View style={[styles.analyticsCard, { flex: 1 }]}>
              <Text style={styles.analyticsLabel}>Streak</Text>
              <Text style={styles.streakCount}>🔥 {dailyStreak} days</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <NotificationPopup 
        visible={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EBF7FF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 60,
    backgroundColor: '#EBF7FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'JakartaBold',
  },
  section: {
    marginTop: 0,
    backgroundColor: '#EBF7FF',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'JakartaBold',
    marginBottom: 15,
  },
  cardScroll: {
    paddingRight: 20,
    paddingBottom: 10,
    paddingLeft: 0,
  },
  cardContainer: {
    width: 260,
    marginRight: 24,
    overflow: 'hidden',
  },
  cardImage: {
    width: 260,
    height: 200,
    borderRadius: 24,
    backgroundColor: '#ccc',
  },
  cardText: {
    fontSize: 16,
    fontFamily: 'JakartaBold',
    textAlign: 'left',
    marginTop: 8,
  },
  analyticsContainer: {
    marginTop: 40,
    backgroundColor: '#EBF7FF',
  },
  analyticsTitle: {
    fontSize: 22,
    fontFamily: 'JakartaBold',
    marginBottom: 15,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  analyticsCard: {
    backgroundColor: '#fff',
    padding: 28,
    borderRadius: 20,
    marginBottom: 20,
    alignItems: 'center',
    minHeight: 120,
  },
  analyticsLabel: {
    fontSize: 18,
    fontFamily: 'JakartaBold',
    marginBottom: 10,
  },
  progressWrapper: {
    width: screenWidth * 0.85,
    maxWidth: 340,
    height: 12,
    borderRadius: 10,
    backgroundColor: '#EBF7FF',
    overflow: 'hidden',
  },
  progressBar: {
    height: 12,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  moodChange: {
    fontSize: 20,
    fontFamily: 'JakartaBold',
  },
  streakCount: {
    fontSize: 18,
    fontFamily: 'JakartaBold',
    color: '#0C356A',
  },
  topIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    marginBottom: 20,
    width: '100%',
  },
});