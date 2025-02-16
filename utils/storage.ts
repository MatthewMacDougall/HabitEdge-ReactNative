/**
 * Utilities for persisting and retrieving goals from AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { Goal } from '@/types/goals'

const GOALS_STORAGE_KEY = 'goals'

/**
 * Save goals to AsyncStorage
 * @param goals Array of goals to save
 * @throws Error if saving fails
 */
export const saveGoals = async (goals: Goal[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals))
  } catch (error) {
    console.error('Error saving goals:', error)
    throw error
  }
}

/**
 * Load goals from AsyncStorage
 * @returns Array of saved goals
 * @throws Error if loading fails
 */
export const loadGoals = async (): Promise<Goal[]> => {
  try {
    const goalsJson = await AsyncStorage.getItem(GOALS_STORAGE_KEY)
    return goalsJson ? JSON.parse(goalsJson) : []
  } catch (error) {
    console.error('Error loading goals:', error)
    throw error
  }
} 