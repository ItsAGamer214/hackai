import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import TopIcons from '@/components/TopIcons';

const screenWidth = Dimensions.get('window').width;

const sampleJournals = [
  {
    id: 1,
    date: 'April 15, 2025',
    title: 'A Day at the Beach',
    content: 'Spent the day at Malibu beach with friends. The waves were perfect for surfing...',
    mood: 'Happy'
  },
  {
    id: 2,
    date: 'April 10, 2025',
    title: 'Project Breakthrough',
    content: 'Finally solved that persistent bug in the authentication system...',
    mood: 'Accomplished'
  },
  {
    id: 3,
    date: 'April 5, 2025',
    title: 'Rainy Day Reflections',
    content: 'Stayed in all day as it poured outside. I finished reading...',
    mood: 'Contemplative'
  },
];

export default function JournalScreen() {
  const [selectedJournal, setSelectedJournal] = useState(sampleJournals[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJournals = sampleJournals.filter(journal =>
    journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    journal.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <View style={styles.section}>
            <Text style={styles.title}>Journal</Text>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search journals..."
                placeholderTextColor="#6B7280"
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
              <TouchableOpacity style={styles.searchButton}>
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.journalList}>
              {filteredJournals.map(journal => (
                <TouchableOpacity
                  key={journal.id}
                  style={styles.journalItem}
                  onPress={() => setSelectedJournal(journal)}
                >
                  {selectedJournal.id === journal.id && <View style={styles.selectionBar} />}
                  <View style={styles.journalContentWrapper}>
                    <Text style={styles.journalDate}>{journal.date}</Text>
                    <Text style={styles.journalTitle}>{journal.title}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {selectedJournal && (
              <View style={styles.journalDetail}>
                <Text style={styles.detailTitle}>{selectedJournal.title}</Text>
                <Text style={styles.detailDate}>{selectedJournal.date}</Text>
                <Text style={styles.journalContent}>{selectedJournal.content}</Text>
              </View>
            )}
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
    paddingTop: 10,
    paddingBottom: 60,
  },
  section: {
    width: screenWidth,
    marginLeft: -24,
  },
  title: {
    fontSize: 22,
    fontFamily: 'JakartaBold',
    marginBottom: 30,
    paddingLeft: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
    paddingHorizontal: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#EBF7FF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#94b4d1',
    color: '#111827',
  },
  searchButton: {
    backgroundColor: '#0174BE',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  journalList: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  journalItem: {
    backgroundColor: '#EBF7FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionBar: {
    width: 4,
    height: '70%',
    backgroundColor: '#0174BE',
    borderRadius: 2,
    marginRight: 12,
  },
  journalContentWrapper: {
    flex: 1,
  },
  journalDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  journalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  journalDetail: {
    backgroundColor: '#EBF7FF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginHorizontal: 20,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  detailDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  journalContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
});
