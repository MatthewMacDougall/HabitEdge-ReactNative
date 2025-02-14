export interface UserRegistration {
  name: string
  email: string
  password: string
  dob: string
  sport: string
}

export interface UserPreferences {
  sport: string
  experience: 'beginner' | 'intermediate' | 'advanced'
  trainingDays: number
  notifications: boolean
  goals: {
    performance?: string
    training?: string
    habit?: string
  }
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
  isCompleted: boolean
} 