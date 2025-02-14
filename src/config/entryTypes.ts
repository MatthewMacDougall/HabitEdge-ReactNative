export type EntryType = 'game' | 'practice' | 'workout' | 'film' | 'rest'

export interface GameDetails {
  opponent: string
  result: 'win' | 'loss' | 'draw'
  score?: string
}

export interface GradingMetric {
  id: string
  label: string
  description: string
  min: number
  max: number
}

export interface JournalPrompt {
  id: string
  label: string
  placeholder: string
  required?: boolean
}

export interface EntryTypeConfig {
  label: string
  metrics: GradingMetric[]
  prompts: JournalPrompt[]
  additionalFields?: {
    game?: {
      opponent: boolean
      result: boolean
      score: boolean
    }
  }
}

export const entryTypeConfigs: Record<EntryType, EntryTypeConfig> = {
  game: {
    label: 'Game',
    additionalFields: {
      game: {
        opponent: true,
        result: true,
        score: true
      }
    },
    metrics: [
      {
        id: 'performance',
        label: 'Overall Performance',
        description: 'How would you rate your overall game performance?',
        min: 1,
        max: 10
      },
      {
        id: 'energy',
        label: 'Energy Level',
        description: 'How was your energy throughout the game?',
        min: 1,
        max: 10
      },
      {
        id: 'teamwork',
        label: 'Team Collaboration',
        description: 'How well did you work with your teammates?',
        min: 1,
        max: 10
      }
    ],
    prompts: [
      {
        id: 'highlights',
        label: 'Key Highlights',
        placeholder: 'What were your best plays or moments?',
        required: true
      },
      {
        id: 'improvements',
        label: 'Areas for Improvement',
        placeholder: 'What aspects of your game need work?',
        required: true
      },
      {
        id: 'coachFeedback',
        label: 'Coach Feedback',
        placeholder: 'What feedback did you receive from coaches?'
      }
    ]
  },
  practice: {
    label: 'Practice',
    metrics: [
      {
        id: 'duration',
        label: 'Duration',
        description: 'How long did you practice?',
        min: 0,
        max: 120
      },
      {
        id: 'improvement',
        label: 'Improvement',
        description: 'How much did you improve?',
        min: 0,
        max: 100
      },
      {
        id: 'technique',
        label: 'Technique',
        description: 'How well did you execute your techniques?',
        min: 1,
        max: 10
      }
    ],
    prompts: [
      {
        id: 'goals',
        label: 'Goals',
        placeholder: 'What were your goals for this practice?',
        required: true
      },
      {
        id: 'challenges',
        label: 'Challenges',
        placeholder: 'What challenges did you face?',
        required: true
      },
      {
        id: 'coachFeedback',
        label: 'Coach Feedback',
        placeholder: 'What feedback did you receive from your coach?'
      }
    ]
  },
  workout: {
    label: 'Workout',
    metrics: [
      {
        id: 'duration',
        label: 'Duration',
        description: 'How long did you workout?',
        min: 0,
        max: 120
      },
      {
        id: 'intensity',
        label: 'Intensity',
        description: 'How intense was your workout?',
        min: 1,
        max: 10
      },
      {
        id: 'muscleGroup',
        label: 'Muscle Group',
        description: 'Which muscle group did you focus on?',
        min: 1,
        max: 8
      }
    ],
    prompts: [
      {
        id: 'goals',
        label: 'Goals',
        placeholder: 'What were your goals for this workout?',
        required: true
      },
      {
        id: 'challenges',
        label: 'Challenges',
        placeholder: 'What challenges did you face?',
        required: true
      },
      {
        id: 'recovery',
        label: 'Recovery',
        placeholder: 'How did you recover after the workout?'
      }
    ]
  },
  film: {
    label: 'Film',
    metrics: [
      {
        id: 'rating',
        label: 'Rating',
        description: 'How would you rate the film?',
        min: 1,
        max: 10
      },
      {
        id: 'enjoyment',
        label: 'Enjoyment',
        description: 'How much did you enjoy the film?',
        min: 1,
        max: 10
      },
      {
        id: 'impact',
        label: 'Impact',
        description: 'How much did the film impact you?',
        min: 1,
        max: 10
      }
    ],
    prompts: [
      {
        id: 'highlights',
        label: 'Key Highlights',
        placeholder: 'What were the best parts of the film?',
        required: true
      },
      {
        id: 'criticisms',
        label: 'Criticisms',
        placeholder: 'What were the criticisms of the film?',
        required: true
      },
      {
        id: 'thoughts',
        label: 'Thoughts',
        placeholder: 'What were your thoughts about the film?'
      }
    ]
  },
  rest: {
    label: 'Rest',
    metrics: [
      {
        id: 'duration',
        label: 'Duration',
        description: 'How long did you rest?',
        min: 0,
        max: 120
      },
      {
        id: 'quality',
        label: 'Quality',
        description: 'How well did you rest?',
        min: 1,
        max: 10
      },
      {
        id: 'effectiveness',
        label: 'Effectiveness',
        description: 'How effective was your rest?',
        min: 1,
        max: 10
      }
    ],
    prompts: [
      {
        id: 'goals',
        label: 'Goals',
        placeholder: 'What were your goals for this rest?',
        required: true
      },
      {
        id: 'challenges',
        label: 'Challenges',
        placeholder: 'What challenges did you face?',
        required: true
      },
      {
        id: 'recovery',
        label: 'Recovery',
        placeholder: 'How did you recover from the rest?'
      }
    ]
  }
} 