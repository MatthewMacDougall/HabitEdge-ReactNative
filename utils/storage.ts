import AsyncStorage from '@react-native-async-storage/async-storage'
import { Goal } from '@/types/goals'

const GOALS_STORAGE_KEY = 'goals'

export const saveGoals = async (goals: Goal[]) => {
  try {
    await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals))
  } catch (error) {
    console.error('Error saving goals:', error)
    throw new Error('Failed to save goals')
  }
}

export const loadGoals = async (): Promise<Goal[]> => {
  try {
    const goals = await AsyncStorage.getItem(GOALS_STORAGE_KEY)
    return goals ? JSON.parse(goals) : []
  } catch (error) {
    console.error('Error loading goals:', error)
    throw new Error('Failed to load goals')
  }
} 