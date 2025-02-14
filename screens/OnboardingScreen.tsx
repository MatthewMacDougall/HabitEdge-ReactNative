import React, { useState } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import {
  Text,
  Button,
  TextInput,
  Card,
  ProgressBar,
  HelperText
} from 'react-native-paper'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Colors } from '../constants/Colors'
import { sports } from '../config/sports'
import { UserRegistration, OnboardingStep } from '../types/onboarding'
import Toast from 'react-native-toast-message'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'
import { Sport } from '../types/sports'

const STEPS: OnboardingStep[] = [
  {
    id: 'personal',
    title: 'Personal Details',
    description: 'Tell us about yourself',
    isCompleted: false
  },
  {
    id: 'sport',
    title: 'Choose Your Sport',
    description: 'Select your primary sport',
    isCompleted: false
  },
  {
    id: 'account',
    title: 'Create Account',
    description: 'Set up your login credentials',
    isCompleted: false
  }
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function OnboardingScreen() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [registration, setRegistration] = useState<UserRegistration>({
    name: '',
    email: '',
    password: '',
    dob: new Date().toISOString(),
    sport: ''
  })
  const [errors, setErrors] = useState<Partial<Record<keyof UserRegistration, string>>>({})
  const [confirmPassword, setConfirmPassword] = useState('')

  const validateEmail = (email: string) => {
    return EMAIL_REGEX.test(email)
  }

  const validateStep = () => {
    const newErrors: typeof errors = {}

    switch (currentStep) {
      case 0: // Personal Details
        if (!registration.name.trim()) {
          newErrors.name = 'Name is required'
        }
        if (!registration.dob) {
          newErrors.dob = 'Date of birth is required'
        } else {
          const age = new Date().getFullYear() - new Date(registration.dob).getFullYear()
          if (age < 13) {
            newErrors.dob = 'You must be at least 13 years old'
          }
        }
        break

      case 1: // Sport Selection
        if (!registration.sport) {
          newErrors.sport = 'Please select a sport'
        }
        break

      case 2: // Account Creation
        if (!registration.email) {
          newErrors.email = 'Email is required'
        } else if (!validateEmail(registration.email)) {
          newErrors.email = 'Please enter a valid email'
        }
        if (!registration.password) {
          newErrors.password = 'Password is required'
        } else if (registration.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters'
        }
        if (registration.password !== confirmPassword) {
          newErrors.password = 'Passwords do not match'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateStep()) return

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      completeRegistration()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const completeRegistration = async () => {
    try {
      // Here you would typically make an API call to create the user account
      await AsyncStorage.setItem('userRegistration', JSON.stringify(registration))
      
      Toast.show({
        type: 'success',
        text1: 'Registration Successful!',
        text2: 'Welcome to HabitEdge'
      })

      router.replace('/(tabs)')
    } catch (error) {
      console.error('Error during registration:', error)
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: 'Please try again'
      })
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.step}>
            <TextInput
              label="Full Name"
              value={registration.name}
              onChangeText={(value) => {
                setRegistration(prev => ({ ...prev, name: value }))
                setErrors(prev => ({ ...prev, name: undefined }))
              }}
              error={!!errors.name}
              style={styles.input}
            />
            <HelperText type="error" visible={!!errors.name}>
              {errors.name}
            </HelperText>

            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput
                label="Date of Birth"
                value={format(new Date(registration.dob), 'MMM d, yyyy')}
                editable={false}
                error={!!errors.dob}
                right={<TextInput.Icon icon="calendar" />}
                style={styles.input}
              />
            </TouchableOpacity>
            <HelperText type="error" visible={!!errors.dob}>
              {errors.dob}
            </HelperText>

            {showDatePicker && (
              <DateTimePicker
                value={new Date(registration.dob)}
                mode="date"
                maximumDate={new Date()}
                onChange={(event, date) => {
                  setShowDatePicker(false)
                  if (date) {
                    setRegistration(prev => ({ ...prev, dob: date.toISOString() }))
                    setErrors(prev => ({ ...prev, dob: undefined }))
                  }
                }}
              />
            )}
          </View>
        )

      case 1:
        return (
          <View style={styles.step}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.sportsContainer}>
                {sports.map((sport: Sport) => (
                  <Card
                    key={sport.id}
                    style={[
                      styles.sportCard,
                      registration.sport === sport.id && styles.selectedSportCard
                    ]}
                    onPress={() => {
                      setRegistration(prev => ({ ...prev, sport: sport.id }))
                      setErrors(prev => ({ ...prev, sport: undefined }))
                    }}
                  >
                    <Card.Content>
                      <Text
                        style={[
                          styles.sportText,
                          registration.sport === sport.id && styles.selectedSportText
                        ]}
                      >
                        {sport.name}
                      </Text>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            </ScrollView>
            <HelperText type="error" visible={!!errors.sport}>
              {errors.sport}
            </HelperText>
          </View>
        )

      case 2:
        return (
          <View style={styles.step}>
            <TextInput
              label="Email"
              value={registration.email}
              onChangeText={(value) => {
                setRegistration(prev => ({ ...prev, email: value }))
                setErrors(prev => ({ ...prev, email: undefined }))
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.email}
              style={styles.input}
            />
            <HelperText type="error" visible={!!errors.email}>
              {errors.email}
            </HelperText>

            <TextInput
              label="Password"
              value={registration.password}
              onChangeText={(value) => {
                setRegistration(prev => ({ ...prev, password: value }))
                setErrors(prev => ({ ...prev, password: undefined }))
              }}
              secureTextEntry
              error={!!errors.password}
              style={styles.input}
            />
            <HelperText type="error" visible={!!errors.password}>
              {errors.password}
            </HelperText>

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={!!errors.password}
              style={styles.input}
            />
          </View>
        )
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.progress}>
        <ProgressBar
          progress={(currentStep + 1) / STEPS.length}
          color={Colors.light.primary}
        />
      </View>

      <ScrollView style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          {STEPS[currentStep].title}
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          {STEPS[currentStep].description}
        </Text>

        {renderStep()}
      </ScrollView>

      <View style={styles.buttons}>
        {currentStep > 0 && (
          <Button mode="outlined" onPress={handleBack} style={styles.button}>
            Back
          </Button>
        )}
        <Button
          mode="contained"
          onPress={handleNext}
          style={[styles.button, styles.nextButton]}
        >
          {currentStep === STEPS.length - 1 ? 'Create Account' : 'Next'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background
  },
  progress: {
    padding: 16
  },
  content: {
    flex: 1,
    padding: 16
  },
  title: {
    marginBottom: 8
  },
  description: {
    color: Colors.light.textSecondary,
    marginBottom: 24
  },
  step: {
    marginBottom: 24
  },
  stepTitle: {
    marginBottom: 16
  },
  sportsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8
  },
  sportCard: {
    width: 120,
    marginRight: 8
  },
  selectedSportCard: {
    backgroundColor: Colors.light.primary
  },
  sportText: {
    textAlign: 'center'
  },
  selectedSportText: {
    color: Colors.light.background
  },
  input: {
    marginBottom: 4
  },
  buttons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12
  },
  button: {
    flex: 1
  },
  nextButton: {
    backgroundColor: Colors.light.primary
  }
}) 