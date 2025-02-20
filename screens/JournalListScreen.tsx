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
  SegmentedButtons,
  FAB,
  Portal,
  Dialog,
  Menu,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { Colors } from '@/constants/Colors';
import { SharedStyles } from '@/constants/Styles';
import { EntryType, entryTypeConfigs } from '@/src/config/entryTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/hooks/useColorScheme';
import JournalEntry from '@/components/JournalEntry';
import { deleteJournalEntry, loadJournalEntries } from '@/utils/journalStorage';
import Toast from 'react-native-toast-message';
import JournalEntryComponent from '@/components/JournalEntry';
import { JournalEntry as JournalEntryType } from '@/types/journal';
import { Picker } from '@react-native-picker/picker'

interface UserData {
  name: string;
  // ... other user fields
}

interface FilterOption {
  value: EntryType | 'all';
  label: string;
}

const filterOptions: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: EntryType.Game, label: 'Games' },
  { value: EntryType.Practice, label: 'Practice' },
  { value: EntryType.Workout, label: 'Workouts' },
  { value: EntryType.Film, label: 'Film' }
];

export default function JournalListScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntryType[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [filter, setFilter] = useState<EntryType | 'all'>('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  const loadEntries = async () => {
    try {
      setLoading(true)
      const storedEntries = await loadJournalEntries()
      if (storedEntries) {
        // Sort entries by date, newest first
        const sortedEntries = [...storedEntries].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setEntries(sortedEntries)
      }
    } catch (error) {
      console.error('Error loading entries:', error)
      Toast.show({
        type: 'error',
        text1: 'Failed to load entries',
        text2: 'Please try again'
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

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
    if (filter === 'all') return true;
    return entry.type === filter;
  }).filter(entry => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      entry.type.toLowerCase().includes(searchLower) ||
      entry.prompts.highlights?.toLowerCase().includes(searchLower) ||
      entry.gameDetails?.opponent?.toLowerCase().includes(searchLower)
    );
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  useEffect(() => {
    loadUserData();
    loadEntries();
  }, []);

  const handleDeleteEntry = async () => {
    if (!deleteId) return;

    try {
      await deleteJournalEntry(deleteId);
      await loadEntries();
      Toast.show({
        type: 'success',
        text1: 'Entry deleted successfully'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to delete entry'
      });
    } finally {
      setDeleteId(null);
    }
  };

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

  const handleNewEntry = () => {
    router.push({
      pathname: '/entries',
      params: { id: 'new' }
    });
  };

  const handleEditEntry = (id: number) => {
    router.push({
      pathname: '/entries',
      params: { id }
    });
  };

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

      <Surface style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by:</Text>
        <Menu
          visible={showFilter}
          onDismiss={() => setShowFilter(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setShowFilter(true)}
              icon="filter-variant"
              contentStyle={styles.filterButton}
            >
              {filterOptions.find(opt => opt.value === filter)?.label || 'All'}
            </Button>
          }
        >
          {filterOptions.map(option => (
            <Menu.Item
              key={option.value}
              onPress={() => {
                setFilter(option.value as EntryType | 'all')
                setShowFilter(false)
              }}
              title={option.label}
              titleStyle={[
                styles.menuItem,
                filter === option.value && styles.selectedMenuItem
              ]}
            />
          ))}
        </Menu>
      </Surface>

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
            <JournalEntryComponent
              key={entry.id}
              entry={entry}
              onEdit={() => handleEditEntry(Number(entry.id))}
              onDelete={() => setDeleteId(Number(entry.id))}
            />
          ))
        ) : (
          renderEmptyState()
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={!!deleteId} onDismiss={() => setDeleteId(null)}>
          <Dialog.Title>Delete Entry</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this entry?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteId(null)}>Cancel</Button>
            <Button onPress={handleDeleteEntry}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleNewEntry}
      />
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
  filterContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlignVertical: 'center',
  },
  filterButton: {
    height: 36,
    justifyContent: 'center',
  },
  menuItem: {
    color: Colors.dark.text,
  },
  selectedMenuItem: {
    color: Colors.dark.primary,
    fontWeight: 'bold',
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});