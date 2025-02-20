/**
 * Utilities for managing journal entries in storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalEntry } from '@/types/journal';

const JOURNAL_STORAGE_KEY = 'journalEntries';

/**
 * Save journal entries to storage
 */
export const saveJournalEntries = async (entries: JournalEntry[]): Promise<void> => {
  try {
    const sortedEntries = entries.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    await AsyncStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(sortedEntries));
  } catch (error) {
    console.error('Error saving journal entries:', error);
    throw error;
  }
};

/**
 * Load journal entries from storage
 */
export const loadJournalEntries = async (): Promise<JournalEntry[]> => {
  try {
    const storedEntries = await AsyncStorage.getItem(JOURNAL_STORAGE_KEY);
    return storedEntries ? JSON.parse(storedEntries) : [];
  } catch (error) {
    console.error('Error loading entries:', error);
    return [];
  }
};

/**
 * Load a single journal entry from storage
 */
export const loadJournalEntry = async (id: number): Promise<JournalEntry | null> => {
  try {
    const entries = await loadJournalEntries();
    return entries.find(entry => entry.id === id) || null;
  } catch (error) {
    console.error('Error loading journal entry:', error);
    return null;
  }
};

/**
 * Add a new journal entry
 */
export const addJournalEntry = async (entry: EntryFormData): Promise<void> => {
  try {
    const entries = await loadJournalEntries();
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await AsyncStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify([...entries, newEntry]));
  } catch (error) {
    console.error('Error saving entry:', error);
    throw error;
  }
};

/**
 * Update an existing journal entry
 */
export const updateJournalEntry = async (id: number, updates: Partial<JournalEntry>): Promise<void> => {
  try {
    const entries = await loadJournalEntries();
    const updatedEntries = entries.map(entry => 
      entry.id === id 
        ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
        : entry
    );
    await AsyncStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updatedEntries));
  } catch (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }
};

/**
 * Delete a journal entry
 */
export const deleteJournalEntry = async (id: number): Promise<void> => {
  try {
    const entries = await loadJournalEntries();
    const filteredEntries = entries.filter(entry => entry.id !== id);
    await AsyncStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(filteredEntries));
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
};

export const clearAllEntries = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify([]))
  } catch (error) {
    console.error('Error clearing entries:', error)
    throw error
  }
} 