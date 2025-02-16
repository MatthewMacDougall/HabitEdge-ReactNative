/**
 * Utilities for persisting and retrieving targets from AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { Target } from '@/types/targets'

const TARGETS_STORAGE_KEY = 'targets'

/**
 * Save targets to AsyncStorage
 * @param targets Array of targets to save
 * @throws Error if saving fails
 */
export const saveTargets = async (targets: Target[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(TARGETS_STORAGE_KEY, JSON.stringify(targets))
  } catch (error) {
    console.error('Error saving targets:', error)
    throw error
  }
}

/**
 * Load targets from AsyncStorage
 * @returns Array of saved targets
 * @throws Error if loading fails
 */
export const loadTargets = async (): Promise<Target[]> => {
  try {
    const targetsJson = await AsyncStorage.getItem(TARGETS_STORAGE_KEY)
    return targetsJson ? JSON.parse(targetsJson) : []
  } catch (error) {
    console.error('Error loading targets:', error)
    throw error
  }
} 