import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  IconButton,
  Chip,
  Searchbar,
  Divider,
  Surface,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { Colors } from '@/constants/Colors';
import { SharedStyles } from '@/constants/Styles';
import { EntryType, entryTypeConfigs } from '@/src/config/entryTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/hooks/useColorScheme';

interface JournalEntry {
  id: string;
  type: EntryType;
  timestamp: string;
  metrics: Record<string, number>;
  prompts: Record<string, string>;
  gameDetails?: {
    opponent?: string;
    result?: 'win' | 'loss' | 'draw';
    score?: {
      yourTeam: string;
      opponent: string;
    };
  };
}

interface UserData {
  name: string;
  // ... other user fields
}

export default function JournalListScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const loadEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem('journalEntries');
      if (storedEntries) {
        const parsedEntries = JSON.parse(storedEntries);
        // Sort entries by date, newest first
        const sortedEntries = parsedEntries.sort((a: JournalEntry, b: JournalEntry) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setEntries(sortedEntries);
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('userRegistration');
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  }, []);

  const getEntryTypeColor = (type: EntryType) => {
    switch (type) {
      case 'game': return Colors.dark.primary;
      case 'practice': return Colors.dark.secondary;
      case 'workout': return '#4CAF50';
      case 'film': return '#2196F3';
      default: return Colors.dark.text;
    }
  };

  const filteredEntries = entries.filter(entry => {
    const searchLower = searchQuery.toLowerCase();
    return (
      entry.type.toLowerCase().includes(searchLower) ||
      entry.prompts.highlights?.toLowerCase().includes(searchLower) ||
      entry.gameDetails?.opponent?.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    loadUserData();
    loadEntries();
  }, []);

  const renderEmptyState = () => (
    <Surface style={styles.emptyState}>
      <IconButton
        icon="notebook"
        size={48}
        iconColor={Colors.dark.textSecondary}
      />
      <Text style={styles.emptyStateTitle}>No Journal Entries Yet</Text>
      <Text style={styles.emptyStateDescription}>
        Start tracking your progress by adding your first entry
      </Text>
      <Button
        mode="contained"
        onPress={() => router.push('/(tabs)/entries')}
        style={styles.emptyStateButton}
      >
        Create First Entry
      </Button>
    </Surface>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  return (
    <View style={[SharedStyles.screenContainer, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text 
          variant="headlineMedium" 
          style={[styles.headerTitle, { color: colors.text }]}
        >
          {userData?.name ? `${userData.name}'s Journal` : 'My Journal'}
        </Text>
        <Button
          mode="contained"
          onPress={() => router.push('/(tabs)/entries')}
          icon="plus"
        >
          New Entry
        </Button>
      </View>

      <Searchbar
        placeholder="Search entries..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={Colors.dark.text}
        inputStyle={{ color: Colors.dark.text }}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          SharedStyles.contentContainer,
          !filteredEntries.length && styles.emptyContainer
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.dark.primary}
          />
        }
      >
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => (
            <Surface 
              key={entry.id} 
              style={[styles.entryCard, { backgroundColor: colors.card }]}
            >
              <Text style={[styles.entryTitle, { color: colors.text }]}>
                {entry.prompts.highlights || entryTypeConfigs[entry.type].label}
              </Text>
              <Text style={[styles.entryDate, { color: colors.textSecondary }]}>
                {format(new Date(entry.timestamp), 'MMM d, yyyy')}
              </Text>
            </Surface>
          ))
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  header: {
    padding: 16,
    gap: 12,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 28,
  },
  searchBar: {
    margin: 16,
    backgroundColor: Colors.dark.input,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    margin: 16,
    borderRadius: 12,
    backgroundColor: Colors.dark.card,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyStateDescription: {
    textAlign: 'center',
    marginVertical: 8,
  },
  emptyStateButton: {
    marginTop: 16,
    backgroundColor: Colors.dark.primary,
  },
  entryCard: {
    marginBottom: 12,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  entryDate: {
    fontSize: 12,
  },
});