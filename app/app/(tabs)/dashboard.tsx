import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { SimpleLineIcons } from '@expo/vector-icons';
import TopIcons from '@/components/TopIcons';

const mockSleepData = {
  '2024-04-04': { sleepRate: 76, sleepTime: '6h 45m', deepSleep: '4', sleepSessions: [40, 65, 55, 70, 75, 60, 50] },
  '2024-04-05': { sleepRate: 79, sleepTime: '7h 10m', deepSleep: '5', sleepSessions: [45, 60, 70, 65, 75, 65, 55] },
  '2024-04-06': { sleepRate: 80, sleepTime: '7h 15m', deepSleep: '5', sleepSessions: [50, 65, 75, 80, 70, 65, 60] },
  '2024-04-07': { sleepRate: 78, sleepTime: '7h 05m', deepSleep: '5', sleepSessions: [55, 70, 65, 75, 70, 60, 50] },
  '2024-04-08': { sleepRate: 82, sleepTime: '7h 2m', deepSleep: '1', sleepSessions: [60, 75, 70, 85, 80, 75, 65] },
  '2024-04-09': { sleepRate: 81, sleepTime: '7h 30m', deepSleep: '1', sleepSessions: [55, 70, 80, 85, 75, 70, 60] },
  '2024-04-10': { sleepRate: 77, sleepTime: '6h 50m', deepSleep: '5', sleepSessions: [45, 60, 70, 75, 65, 60, 50] },
};

export default function DashboardScreen() {
  const [selectedDate, setSelectedDate] = useState('2024-04-08');
  const currentData = mockSleepData[selectedDate];

  const formatDateLabel = (dateString) => new Date(dateString).getDate().toString();
  const getDayOfWeek = (dateString) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(dateString).getDay()];

  return (
    <LinearGradient colors={['#EBF7FF', '#0C356A']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={{ marginLeft: -24 }}>
            <TopIcons />
          </View>

          <View style={styles.container}>
            <Text style={styles.title}>Dashboard</Text>

            <View style={styles.header}>
              <View style={styles.userInfo}>
                <View style={styles.avatarContainer}><View style={styles.avatar} /></View>
                <View>
                  <Text style={styles.greeting}>Hello!</Text>
                  <Text style={styles.date}>8 December</Text>
                </View>
              </View>
              <TouchableOpacity>
                <SimpleLineIcons name="settings" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.dateSelector}>
              {Object.keys(mockSleepData).map(date => (
                <TouchableOpacity
                  key={date}
                  onPress={() => setSelectedDate(date)}
                  style={[styles.dateButton, selectedDate === date && styles.selectedDateButton]}
                >
                  <Text style={[styles.dayText, selectedDate === date && styles.selectedDayText]}>{getDayOfWeek(date)}</Text>
                  <Text style={[styles.dateText, selectedDate === date && styles.selectedDateText]}>{formatDateLabel(date)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sleepDataContainer}>
              <View style={styles.sleepDataHeader}>
                <Text style={styles.sleepDataTitle}>Analytics</Text>
                <TouchableOpacity><Text style={styles.moreIcon}>⋮</Text></TouchableOpacity>
              </View>
              <View style={styles.sleepMetrics}>
                <View style={styles.metricItem}><Text style={styles.metricText}>Mood</Text><Text style={styles.metricNumber}>{currentData.sleepRate}%</Text></View>
                <View style={styles.metricItem}><Text style={styles.metricText}>time spent</Text><Text style={styles.metricNumber}>{currentData.sleepTime}</Text></View>
                <View style={styles.metricItem}><Text style={styles.metricText}>Quests</Text><Text style={styles.metricNumber}>{currentData.deepSleep}</Text></View>
              </View>
              <View style={styles.chartContainer}>
                <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${currentData.sleepRate}%` }]} /></View>
                <Text style={styles.progressText}>Level Progression</Text>
              </View>
            </View>

            <View style={styles.sleepSessionContainer}>
              <Text style={styles.sleepSessionTitle}>Voice Journals</Text>
              <View style={styles.journalEntry}>
                <Text style={styles.journalText}>
                  "Today was a productive day. I managed to complete all my tasks and even had time for some self-reflection. The meditation session in the morning really helped set a positive tone for the day. Looking forward to maintaining this momentum tomorrow."
                </Text>
                <Text style={styles.journalTime}>2 hours ago</Text>
              </View>
            </View>
          </View>
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
  container: {
    flex: 1,
    paddingTop: 10,
  },
  title: { fontSize: 22, fontFamily: 'JakartaBold', marginBottom: 30 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2fe',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#93c5fd' },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  date: { fontSize: 14, color: '#4b5563' },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#EBF7FF',
    borderRadius: 12,
    padding: 8,
    marginBottom: 24,
  },
  dateButton: { alignItems: 'center', padding: 8, borderRadius: 8, minWidth: 40 },
  selectedDateButton: { backgroundColor: '#0174BE' },
  dayText: { fontSize: 12, color: '#4b5563' },
  selectedDayText: { color: '#ffffff' },
  dateText: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  selectedDateText: { color: '#ffffff' },
  sleepDataContainer: {
    backgroundColor: '#EBF7FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sleepDataHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sleepDataTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  moreIcon: { fontSize: 24, color: '#000' },
  sleepMetrics: { flexDirection: 'row', marginBottom: 32 },
  metricItem: { flex: 1, paddingRight: 8 },
  metricText: { fontSize: 14, color: '#4b5563', fontWeight: '500', marginBottom: 4 },
  metricValue: { flexDirection: 'row', alignItems: 'baseline' },
  metricNumber: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  chartContainer: { alignItems: 'center', marginBottom: 8 },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0174BE',
    borderRadius: 4,
  },
  progressText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  sleepSessionContainer: {
    backgroundColor: '#EBF7FF',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
  },
  sleepSessionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 16 },
  journalEntry: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 16 },
  journalText: { fontSize: 14, color: '#1f2937', lineHeight: 20, marginBottom: 8 },
  journalTime: { fontSize: 12, color: '#6b7280' },
});
