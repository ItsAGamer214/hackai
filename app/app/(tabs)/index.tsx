import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Image, Animated, Platform, Modal, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import TopIcons from '@/components/TopIcons';
import { BlurView } from 'expo-blur';


const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);

  const educationTopics = [
    {
      title: 'Meditation',
      emoji: '🧘‍♂️',
      image: require('@/assets/images/rippling_water.jpg'),
      articleUrl: 'https://www.mayoclinic.org/tests-procedures/meditation/in-depth/meditation/art-20045858',
    },
    {
      title: 'Mental Health Tips',
      emoji: '💡',
      image: require('@/assets/images/zen_stones.jpeg'),
      articleUrl: 'https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response',
    },
    { 
      title: 'Mindfulness', 
      emoji: '🧠',
      articleUrl: 'https://www.mindful.org/how-to-practice-mindfulness/',
    },
    { 
      title: 'Journaling', 
      emoji: '📓',
      articleUrl: 'https://positivepsychology.com/benefits-of-journaling/',
    },
    { 
      title: 'Stress Relief', 
      emoji: '😌',
      articleUrl: 'https://www.helpguide.org/articles/stress/quick-stress-relief.htm',
    },
    { 
      title: 'Breathing Exercises', 
      emoji: '🌬️',
      articleUrl: 'https://www.healthline.com/health/breathing-exercise',
    },
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

  const handleTopicPress = (articleUrl: string) => {
    Linking.openURL(articleUrl);
  };

  const levelProgress = 0.6;
  const moodChange = +12;
  const dailyStreak = 4;

  const notifications = [
    { id: 1, title: 'New Meditation Session', time: '2 hours ago', read: false },
    { id: 2, title: 'Daily Streak Reminder', time: '5 hours ago', read: true },
    { id: 3, title: 'Weekly Progress Report', time: '1 day ago', read: true },
  ];

  return (
    <LinearGradient
      colors={['#EBF7FF', '#0C356A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <TopIcons />
          <Text style={styles.greetingText}>Good morning! Are you ready to have a mindful day?</Text>
          {/* Education Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardScroll}>
              {educationTopics.map((topic, index) => (
                <TouchableOpacity
                  key={index}
                  onPressIn={() => handleHoverIn(index)}
                  onPressOut={() => handleHoverOut(index)}
                  onPress={() => handleTopicPress(topic.articleUrl)}
                  activeOpacity={1}
                >
                  <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnimations[index] }] }]}>
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
                <View style={styles.levelCircle}>
                  <Text style={styles.levelText}>1</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressBar, { width: `${levelProgress * 100}%` }]} />
                </View>
                <View style={styles.levelCircle}>
                  <Text style={styles.levelText}>2</Text>
                </View>
              </View>
            </View>

            {/* Mood + Streak */}
            <View style={styles.analyticsRow}>
              <View style={[styles.analyticsCard, { flex: 1 }]}>
                <Text style={styles.analyticsLabel}>Mood</Text>
                <Text
                  style={[
                    styles.moodChange,
                    { color: moodChange >= 0 ? '#0174BE' : '#0C356A' },
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

          {/* Notifications Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={isNotificationModalVisible}
            onRequestClose={() => setIsNotificationModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Notifications</Text>
                  <TouchableOpacity onPress={() => setIsNotificationModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.notificationsList}>
                  {notifications.map((notification) => (
                    <TouchableOpacity
                      key={notification.id}
                      style={[styles.notificationItem, !notification.read && styles.unreadNotification]}
                    >
                      <View style={styles.notificationContent}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                        <Text style={styles.notificationTime}>{notification.time}</Text>
                      </View>
                      {!notification.read && <View style={styles.unreadDot} />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 60,
    paddingTop: 10,
  },
  greetingText: {
    fontSize: 26,
    fontFamily: 'JakartaBold',
    marginBottom: 20,
    marginTop: 10,
    color: '#0C356A',
  },
  section: {
    marginTop: 0,
    width: screenWidth,
    marginLeft: -20,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'JakartaBold',
    marginBottom: 30,
    paddingLeft: 20,
  },
  cardScroll: {
    paddingBottom: 10,
    marginTop: 6,
  },
  cardContainer: {
    width: 260,
    marginRight: 6,
    overflow: 'hidden',
    marginLeft: 20,
  },
  cardImage: {
    width: 260,
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardText: {
    fontSize: 16,
    fontFamily: 'JakartaBold',
    marginTop: 8,
  },
  analyticsContainer: {
    marginTop: 40,
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
    backgroundColor: '#EBF7FF',
    padding: 28,
    borderRadius: 20,
    marginBottom: 20,
    alignItems: 'center',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  analyticsLabel: {
    fontSize: 18,
    fontFamily: 'JakartaBold',
    marginBottom: 10,
  },
  progressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: screenWidth * 0.85,
    maxWidth: 340,
    marginTop: 10,
  },
  progressTrack: {
    flex: 1,
    height: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: 12,
    borderRadius: 10,
    backgroundColor: '#0174BE',
  },
  levelCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0174BE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 12,
    fontFamily: 'JakartaBold',
    color: '#0C356A',
  },
  moodChange: {
    fontSize: 20,
    fontFamily: 'JakartaBold',
  },
  streakCount: {
    fontSize: 18,
    fontFamily: 'JakartaBold',
    color: '#0174BE',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'JakartaBold',
    color: '#333',
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 12,
    marginBottom: 8,
  },
  unreadNotification: {
    backgroundColor: '#EBF7FF',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'JakartaBold',
    color: '#333',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 14,
    color: '#666',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0C356A',
    marginLeft: 10,
  },
});
