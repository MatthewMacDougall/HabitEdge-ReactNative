export interface UserRegistration {
  name: string
  email: string
  password: string
  dob: Date
  sport: string
}

export interface UserPreferences {
  notifications: boolean
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
  isCompleted: boolean
} 