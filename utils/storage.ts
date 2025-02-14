import AsyncStorage from '@react-native-async-storage/async-storage'
import { Goal } from '../types/goals'

const GOALS_STORAGE_KEY = '@habitedge_goals'

export const saveGoals = async (goals: Goal[]) => {
  try {
    await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals))
  } catch (error) {
    console.error('Error saving goals:', error)
  }
}

export const loadGoals = async (): Promise<Goal[]> => {
  try {
    const goalsJson = await AsyncStorage.getItem(GOALS_STORAGE_KEY)
    return goalsJson ? JSON.parse(goalsJson) : []
  } catch (error) {
    console.error('Error loading goals:', error)
    return []
  }
} 