import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';

const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 600;

export default function HomeScreen() {
  const educationTopics = [
    'Meditation',
    'Mental Health Tips',
    'Mindfulness',
    'Journaling',
    'Stress Relief',
    'Breathing Exercises',
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {educationTopics.map((topic, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>{topic}</Text>
              </View>
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
  card: {
    width: 220,
    height: 160,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
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
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  analyticsLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressWrapper: {
    width: screenWidth * 0.75,
    maxWidth: 320,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#EBF7FF',
    overflow: 'hidden',
  },
  progressBar: {
    height: 10,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  moodChange: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  streakCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0C356A',
  },
});
