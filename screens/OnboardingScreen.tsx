import React, { useState } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal
} from 'react-native'
import {
  Text,
  Button,
  TextInput,
  Portal,
  SegmentedButtons,
  ProgressBar,
  Surface
} from 'react-native-paper'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Colors } from '../constants/Colors'
import { sports } from '@/config/sports'
import { UserRegistration, OnboardingStep } from '@/types/onboarding'
import Toast from 'react-native-toast-message'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'
import { Sport } from '@/types/sports'
import { SharedStyles } from '@/constants/Styles'

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
    dob: new Date(),
    sport: ''
  })
  const [errors, setErrors] = useState<Partial<Record<keyof UserRegistration, string>>>({})
  const [confirmPassword, setConfirmPassword] = useState('')
  const [customSport, setCustomSport] = useState('')

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
        } else if (registration.sport === 'other' && !customSport.trim()) {
          newErrors.sport = 'Please enter your sport'
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={SharedStyles.screenContainer}
    >
      <View style={styles.progress}>
        <ProgressBar
          progress={(currentStep + 1) / STEPS.length}
          color={Colors.dark.primary}
          style={styles.progressBar}
        />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={SharedStyles.contentContainer}
      >
        <Text variant="headlineMedium" style={styles.title}>
          {STEPS[currentStep].title}
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          {STEPS[currentStep].description}
        </Text>

        <Surface style={styles.formContainer}>
          {currentStep === 0 && (
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
                theme={{ colors: { text: Colors.dark.text } }}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}

              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
              >
                <TextInput
                  label="Date of Birth"
                  value={format(new Date(registration.dob), 'MMM d, yyyy')}
                  editable={false}
                  error={!!errors.dob}
                  right={<TextInput.Icon icon="calendar" />}
                  style={styles.input}
                />
              </TouchableOpacity>

              {Platform.OS === 'ios' ? (
                <Modal
                  visible={showDatePicker}
                  transparent={true}
                  animationType="slide"
                >
                  <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                      <DateTimePicker
                        value={new Date(registration.dob)}
                        mode="date"
                        display="spinner"
                        onChange={(event, date) => {
                          setShowDatePicker(false)
                          if (date) {
                            setRegistration(prev => ({ ...prev, dob: date }))
                            setErrors(prev => ({ ...prev, dob: undefined }))
                          }
                        }}
                      />
                      <Button onPress={() => setShowDatePicker(false)}>
                        Done
                      </Button>
                    </View>
                  </View>
                </Modal>
              ) : (
                showDatePicker && (
                  <DateTimePicker
                    value={new Date(registration.dob)}
                    mode="date"
                    onChange={(event, date) => {
                      setShowDatePicker(false)
                      if (date && event.type !== 'dismissed') {
                        setRegistration(prev => ({ ...prev, dob: date }))
                        setErrors(prev => ({ ...prev, dob: undefined }))
                      }
                    }}
                  />
                )
              )}

              {errors.dob && (
                <Text style={styles.errorText}>{errors.dob}</Text>
              )}
            </View>
          )}

          {currentStep === 1 && (
            <View style={styles.step}>
              <SegmentedButtons
                value={registration.sport}
                onValueChange={(value) => {
                  setRegistration(prev => ({ ...prev, sport: value }));
                  setErrors(prev => ({ ...prev, sport: undefined }));
                  if (value !== 'other') {
                    setCustomSport('');
                  }
                }}
                buttons={sports.map(sport => ({
                  value: sport.id,
                  label: sport.name,
                  style: styles.sportButton
                }))}
              />
              
              {registration.sport === 'other' && (
                <TextInput
                  label="Enter your sport"
                  value={customSport}
                  onChangeText={(value) => {
                    setCustomSport(value);
                    setRegistration(prev => ({ ...prev, sport: value }));
                  }}
                  style={styles.input}
                />
              )}
              
              {errors.sport && (
                <Text style={styles.errorText}>{errors.sport}</Text>
              )}
            </View>
          )}

          {currentStep === 2 && (
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
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

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
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                error={!!errors.password}
                style={styles.input}
              />
            </View>
          )}
        </Surface>
      </ScrollView>

      <View style={styles.buttons}>
        {currentStep > 0 && (
          <Button
            mode="outlined"
            onPress={handleBack}
            style={styles.button}
            textColor={Colors.dark.text}
          >
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
  progress: {
    padding: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.border,
  },
  content: {
    flex: 1,
  },
  title: {
    color: Colors.dark.text,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  description: {
    color: Colors.dark.textSecondary,
    marginBottom: 24,
  },
  formContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  step: {
    gap: 16,
  },
  input: {
    backgroundColor: Colors.dark.input,
    marginBottom: 8,
  },
  errorText: {
    color: Colors.dark.error,
    fontSize: 12,
    marginTop: -4,
    marginBottom: 8,
  },
  sportsContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 8,
  },
  sportCard: {
    width: 120,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.dark.input,
  },
  selectedSportCard: {
    backgroundColor: Colors.dark.primary,
  },
  sportText: {
    color: Colors.dark.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedSportText: {
    color: Colors.dark.background,
  },
  buttons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: Colors.dark.background,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  button: {
    flex: 1,
  },
  nextButton: {
    backgroundColor: Colors.dark.primary,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: Colors.dark.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  sportButton: {
    backgroundColor: Colors.dark.input,
    borderColor: Colors.dark.border,
  },
}) 