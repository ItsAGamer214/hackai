import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import TopIcons from '@/components/TopIcons';

// Define types for our data
type SleepData = {
  sleepRate: number;
  sleepTime: string;
  deepSleep: string;
  sleepSessions: number[];
};

type SleepDataMap = {
  [key: string]: SleepData;
};

// Mock sleep data for different days
const mockSleepData: SleepDataMap = {
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
  
  // Get current sleep data based on selected date
  const currentData = mockSleepData[selectedDate] || mockSleepData['2024-04-08'];
  
  // Format date for display
  const formatDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate().toString();
  };
  
  // Get day of week for display
  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  };

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
            <Text style={styles.title}>Dashboard</Text>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar} />
                </View>
                <View>
                  <Text style={styles.greeting}>Hello Yev</Text>
                  <Text style={styles.date}>8 December</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.settingsButton}>
                <Text style={styles.settingsIcon}>⚙️</Text>
              </TouchableOpacity>
            </View>

            {/* Date Selector */}
            <View style={styles.dateSelector}>
              {Object.keys(mockSleepData).map((date) => (
                <TouchableOpacity
                  key={date}
                  onPress={() => setSelectedDate(date)}
                  style={[
                    styles.dateButton,
                    selectedDate === date && styles.selectedDateButton
                  ]}
                >
                  <Text style={[styles.dayText, selectedDate === date && styles.selectedDayText]}>
                    {getDayOfWeek(date)}
                  </Text>
                  <Text style={[styles.dateText, selectedDate === date && styles.selectedDateText]}>
                    {formatDateLabel(date)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Analytics Section */}
            <View style={styles.sleepDataContainer}>
              <View style={styles.sleepDataHeader}>
                <Text style={styles.sleepDataTitle}>Analytics</Text>
                <TouchableOpacity>
                  <Text style={styles.moreIcon}>⋮</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sleepMetrics}>
                {/* Mood */}
                <View style={styles.metricItem}>
                  <View style={styles.metricLabel}>
                    <Text style={styles.metricText}>Mood</Text>
                  </View>
                  <View style={styles.metricValue}>
                    <Text style={styles.metricNumber}>{currentData.sleepRate}%</Text>
                  </View>
                </View>

                {/* time spent */}
                <View style={styles.metricItem}>
                  <View style={styles.metricLabel}>
                    <Text style={styles.metricText}>time spent</Text>
                  </View>
                  <View style={styles.metricValue}>
                    <Text style={styles.metricNumber}>{currentData.sleepTime}</Text>
                  </View>
                </View>

                {/* Quests */}
                <View style={styles.metricItem}>
                  <View style={styles.metricLabel}>
                    <Text style={styles.metricText}>Quests</Text>
                  </View>
                  <View style={styles.metricValue}>
                    <Text style={styles.metricNumber}>{currentData.deepSleep}</Text>
                  </View>
                </View>
              </View>

              {/* Sleep Chart - Progress Bar */}
              <View style={styles.chartContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${currentData.sleepRate}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>Level Progression</Text>
              </View>
            </View>

            {/* Voice Journals Section */}
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
    paddingTop: 10,
  },
  title: {
    fontSize: 22,
    fontFamily: 'JakartaBold',
    marginBottom: 30,
    paddingLeft: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
    paddingHorizontal: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#93c5fd',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  date: {
    fontSize: 14,
    color: '#4b5563',
  },
  settingsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  settingsIcon: {
    fontSize: 16,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginHorizontal: 20,
  },
  dateButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    minWidth: 40,
  },
  selectedDateButton: {
    backgroundColor: '#3b82f6',
  },
  dayText: {
    fontSize: 12,
    color: '#4b5563',
  },
  selectedDayText: {
    color: '#ffffff',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  selectedDateText: {
    color: '#ffffff',
  },
  sleepDataContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginHorizontal: 20,
  },
  sleepDataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sleepDataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  moreIcon: {
    fontSize: 24,
    color: '#000000',
  },
  sleepMetrics: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  metricItem: {
    flex: 1,
    paddingRight: 8,
  },
  metricLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  metricValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  sleepSessionContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sleepSessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  journalEntry: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  journalText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
    marginBottom: 8,
  },
  journalTime: {
    fontSize: 12,
    color: '#6b7280',
  },
});