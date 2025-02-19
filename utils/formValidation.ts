import { EntryFormData, JournalEntry, GameEntry } from '@/types/journal'
import { EntryTypeConfig, Prompt, Metric, MediaConfig } from '@/src/config/entryTypes'
import Toast from 'react-native-toast-message'

interface ValidationError {
  field: string
  message: string
}

export const validateForm = (
  data: JournalEntry | EntryFormData,
  config: EntryTypeConfig
): ValidationError | true => {
  // Type validation
  if (!data.type) {
    return {
      field: 'type',
      message: 'Please select an entry type'
    }
  }

  // Metrics validation
  const missingMetrics = config.metrics.filter(m => {
    const value = data.metrics[m.id]
    return value === undefined || 
      value < (m.min || 0) || 
      value > (m.max || 10)
  })
  if (missingMetrics.length > 0) {
    return {
      field: 'metrics',
      message: `Please rate: ${missingMetrics.map(m => m.label).join(', ')}`
    }
  }

  // Prompts validation
  const requiredPrompts = config.prompts.filter(p => p.required)
  const missingPrompts = requiredPrompts.filter(p => {
    const value = data.prompts[p.id]
    return !value || (p.minLength && value.length < p.minLength)
  })
  if (missingPrompts.length > 0) {
    return {
      field: 'prompts',
      message: `Please fill in: ${missingPrompts.map(p => p.label).join(', ')}`
    }
  }

  // Media validation
  if (data.media) {
    const requiredMedia = config.media.filter(m => m.required)
    const missingMedia = requiredMedia.filter(m => 
      !data.media?.[m.id]?.length
    )
    if (missingMedia.length > 0) {
      return {
        field: 'media',
        message: `Please add: ${missingMedia.map(m => m.label).join(', ')}`
      }
    }
  }

  // Game-specific validation
  if (isGameEntry(data)) {
    if (!data.gameDetails?.opponent) {
      return {
        field: 'opponent',
        message: 'Please enter the opponent name'
      }
    }
    
    const { score } = data.gameDetails
    if (!score || !score.yourTeam || !score.opponent) {
      return {
        field: 'score',
        message: 'Please enter the game score'
      }
    }

    const yourScore = parseInt(score.yourTeam)
    const theirScore = parseInt(score.opponent)
    if (isNaN(yourScore) || isNaN(theirScore)) {
      return {
        field: 'score',
        message: 'Please enter valid scores'
      }
    }
  }

  return true
}

const isGameEntry = (data: JournalEntry | EntryFormData): data is GameEntry => {
  return data.type === 'game'
} 