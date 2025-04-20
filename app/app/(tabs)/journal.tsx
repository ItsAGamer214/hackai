import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import TopIcons from '@/components/TopIcons';

// Sample journal entries
const sampleJournals = [
  {
    id: 1,
    date: 'April 15, 2025',
    title: 'A Day at the Beach',
    content: 'Spent the day at Malibu beach with friends. The waves were perfect for surfing, and we ended the day with a bonfire. These are the moments I live for - salt air, good company, and the sound of waves crashing. Made a mental note to do this more often, maybe even take up surfing lessons.',
    mood: 'Happy'
  },
  {
    id: 2,
    date: 'April 10, 2025',
    title: 'Project Breakthrough',
    content: 'Finally solved that persistent bug in the authentication system that\'s been bothering me for weeks. The solution came to me during my morning run. Sometimes stepping away from the screen is all you need for perspective. The team was thrilled, and we celebrated with lunch. Need to remember this approach for future problems.',
    mood: 'Accomplished'
  },
  {
    id: 3,
    date: 'April 5, 2025',
    title: 'Rainy Day Reflections',
    content: 'Stayed in all day as it poured outside. I finished reading "The Midnight Library" - what a thought-provoking story about the roads not taken in life. It made me think about my own choices and parallel lives that might have existed. Called mom in the evening and had a long overdue heart-to-heart. Today was nourishing for the soul.',
    mood: 'Contemplative'
  },
  {
    id: 4,
    date: 'March 28, 2025',
    title: 'New Beginnings',
    content: 'First day at the new apartment! The moving process was exhausting, but seeing all my things in this new space feels refreshing. The natural light in the living room is everything I hoped for. Had dinner on the balcony and watched the sunset over the city skyline. This place already feels like home.',
    mood: 'Excited',
    tags: ['moving', 'home', 'new chapter']
  },
  {
    id: 5,
    date: 'March 20, 2025',
    title: 'Birthday Reflections',
    content: 'Another trip around the sun completed today. This past year has been filled with unexpected challenges and growth. Looking back, I\'m proud of how I\'ve navigated it all. Celebrated with a small dinner with close friends. No big party this year, just meaningful connections. Their gift - a cooking class we\'ll all take together next month - was so thoughtful.',
    mood: 'Grateful',
    tags: ['birthday', 'reflection', 'friends']
  }
];

export default function JournalScreen() {
  const [selectedJournal, setSelectedJournal] = useState(sampleJournals[0]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter journals based on search term
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
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <TopIcons />
          
          <View style={styles.container}>
            <Text style={styles.title}>Journal</Text>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search journals..."
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
              <TouchableOpacity style={styles.searchButton}>
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.contentContainer}>
              {filteredJournals.map(journal => (
                <TouchableOpacity
                  key={journal.id}
                  style={[
                    styles.journalItem,
                    selectedJournal.id === journal.id && styles.selectedJournalItem
                  ]}
                  onPress={() => setSelectedJournal(journal)}
                >
                  <Text style={styles.journalDate}>{journal.date}</Text>
                  <Text style={styles.journalTitle}>{journal.title}</Text>
                  <View style={styles.moodContainer}>
                    <View style={[styles.moodIndicator, { backgroundColor: getMoodColor(journal.mood) }]} />
                    <Text style={styles.moodText}>{journal.mood}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedJournal && (
              <View style={styles.journalDetail}>
                <View style={styles.journalHeader}>
                  <View>
                    <Text style={styles.detailTitle}>{selectedJournal.title}</Text>
                    <Text style={styles.detailDate}>{selectedJournal.date}</Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <Text style={styles.journalContent}>{selectedJournal.content}</Text>
                
                <View style={styles.journalFooter}>
                  <View style={styles.moodContainer}>
                    <View style={[styles.moodIndicator, { backgroundColor: getMoodColor(selectedJournal.mood) }]} />
                    <Text style={styles.moodText}>Mood: {selectedJournal.mood}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const getMoodColor = (mood: string) => {
  switch (mood) {
    case 'Happy': return '#10B981';
    case 'Accomplished': return '#3B82F6';
    case 'Contemplative': return '#8B5CF6';
    case 'Excited': return '#F59E0B';
    default: return '#EC4899';
  }
};

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
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
    paddingHorizontal: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    marginBottom: 16,
    width: '100%',
    marginLeft: -20,
  },
  journalItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginHorizontal: 20,
  },
  selectedJournalItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  journalDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  journalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginTop: 4,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  moodIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  moodText: {
    fontSize: 12,
    color: '#6B7280',
  },
  journalDetail: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginHorizontal: 20,
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  detailDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  actionButtonText: {
    color: '#6B7280',
  },
  journalContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  journalFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});