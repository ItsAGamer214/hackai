import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
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

  const levelProgress = 0.6;
  const moodChange = +12;
  const dailyStreak = 4;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good Morning!</Text>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Education Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          <View style={styles.fullWidth}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardScroll}
            >
              {educationTopics.map((topic, index) => (
                <View key={index} style={styles.cardContainer}>
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
                </View>
              ))}
            </ScrollView>
          </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EBF7FF',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
  },
  fullWidth: {
    marginHorizontal: -20,
  },
  cardScroll: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  cardContainer: {
    width: 260,
    marginRight: 24,
  },
  cardImage: {
    width: 260,
    height: 200,
    borderRadius: 24,
    backgroundColor: '#ccc',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'left',
    marginTop: 8,
  },
  analyticsContainer: {
    marginTop: 40,
  },
  analyticsTitle: {
    fontSize: 22,
    fontWeight: '600',
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
    fontWeight: '700',
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
    fontWeight: 'bold',
  },
  streakCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0C356A',
  },
});
