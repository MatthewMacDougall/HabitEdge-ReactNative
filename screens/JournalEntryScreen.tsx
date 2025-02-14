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
  TextInput,
  Button,
  SegmentedButtons,
  Card,
  Divider
} from 'react-native-paper'
import { Picker } from '@react-native-picker/picker'
import Slider from '@react-native-community/slider'
import { EntryType, entryTypeConfigs, GameDetails } from '../src/config/entryTypes'
import { Colors } from '../constants/Colors'
import Toast from 'react-native-toast-message'

interface FormData {
  type: EntryType | ''
  metrics: Record<string, number>
  prompts: Record<string, string>
  gameDetails?: GameDetails
}

export default function JournalEntryScreen() {
  const [formData, setFormData] = useState<FormData>({
    type: '',
    metrics: {},
    prompts: {}
  })

  const handleMetricChange = (metricId: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      metrics: { ...prev.metrics, [metricId]: value }
    }))
  }

  const handlePromptChange = (promptId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      prompts: { ...prev.prompts, [promptId]: value }
    }))
  }

  const handleGameDetailsChange = (field: keyof GameDetails, value: string) => {
    setFormData(prev => ({
      ...prev,
      gameDetails: {
        ...prev.gameDetails,
        [field]: value as any
      }
    }))
  }

  const handleSubmit = async () => {
    if (!formData.type) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select an entry type'
      })
      return
    }

    const config = entryTypeConfigs[formData.type]
    const requiredPrompts = config.prompts.filter(p => p.required)
    const missingPrompts = requiredPrompts.filter(p => !formData.prompts[p.id])

    if (missingPrompts.length > 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Please fill in: ${missingPrompts.map(p => p.label).join(', ')}`
      })
      return
    }

    if (formData.type === 'game') {
      if (!formData.gameDetails?.opponent) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Please enter the opponent name'
        })
        return
      }
      if (!formData.gameDetails?.result) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Please select the game result'
        })
        return
      }
    }

    try {
      // Here you would send the data to your backend
      console.log('Submitting entry:', {
        ...formData,
        timestamp: new Date().toISOString()
      })
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Journal entry saved successfully!'
      })
      
      setFormData({
        type: '',
        metrics: {},
        prompts: {}
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save journal entry'
      })
      console.error(error)
    }
  }

  const selectedConfig = formData.type ? entryTypeConfigs[formData.type] : null

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Title title="New Journal Entry" />
          <Card.Content>
            <View style={styles.formSection}>
              <Text style={styles.label}>Entry Type</Text>
              <Picker
                selectedValue={formData.type}
                onValueChange={(value: string) => setFormData({
                  type: value as EntryType,
                  metrics: {},
                  prompts: {}
                })}
                style={styles.picker}
              >
                <Picker.Item label="Select entry type" value="" />
                {Object.entries(entryTypeConfigs).map(([type, config]) => (
                  <Picker.Item
                    key={type}
                    label={config.label}
                    value={type}
                  />
                ))}
              </Picker>
            </View>

            {formData.type === 'game' && (
              <View style={styles.formSection}>
                <TextInput
                  label="Opponent"
                  value={formData.gameDetails?.opponent || ''}
                  onChangeText={(value: string) => handleGameDetailsChange('opponent', value)}
                  style={styles.input}
                />
                <View style={styles.row}>
                  <View style={styles.flex1}>
                    <Text style={styles.label}>Result</Text>
                    <SegmentedButtons
                      value={formData.gameDetails?.result || ''}
                      onValueChange={(value: string) => 
                        handleGameDetailsChange('result', value as 'win' | 'loss' | 'draw')
                      }
                      buttons={[
                        { value: 'win', label: 'Win' },
                        { value: 'loss', label: 'Loss' },
                        { value: 'draw', label: 'Draw' }
                      ]}
                    />
                  </View>
                  <View style={styles.flex1}>
                    <TextInput
                      label="Score (optional)"
                      value={formData.gameDetails?.score || ''}
                      onChangeText={(value: string) => handleGameDetailsChange('score', value)}
                      style={styles.input}
                    />
                  </View>
                </View>
              </View>
            )}

            {selectedConfig && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Metrics</Text>
                  {selectedConfig.metrics.map((metric) => (
                    <View key={metric.id} style={styles.metricContainer}>
                      <Text style={styles.label}>{metric.label}</Text>
                      <Text style={styles.description}>{metric.description}</Text>
                      <View style={styles.sliderContainer}>
                        <Slider
                          minimumValue={metric.min}
                          maximumValue={metric.max}
                          step={1}
                          value={formData.metrics[metric.id] || 5}
                          onValueChange={(value: number) => handleMetricChange(metric.id, value)}
                          minimumTrackTintColor={Colors.primary}
                          maximumTrackTintColor={Colors.border}
                        />
                        <Text style={styles.sliderValue}>
                          {formData.metrics[metric.id] || 5}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                <Divider style={styles.divider} />
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Journal Prompts</Text>
                  {selectedConfig.prompts.map((prompt) => (
                    <View key={prompt.id} style={styles.promptContainer}>
                      <Text style={styles.label}>
                        {prompt.label}
                        {prompt.required && <Text style={styles.required}> *</Text>}
                      </Text>
                      <TextInput
                        multiline
                        numberOfLines={4}
                        value={formData.prompts[prompt.id] || ''}
                        onChangeText={(value: string) => handlePromptChange(prompt.id, value)}
                        placeholder={prompt.placeholder}
                        style={styles.textArea}
                      />
                    </View>
                  ))}
                </View>
              </>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
            >
              Save Entry
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  scrollView: {
    flex: 1
  },
  card: {
    margin: 16,
    backgroundColor: Colors.card
  },
  formSection: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: Colors.text
  },
  required: {
    color: Colors.error
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: Colors.text
  },
  picker: {
    backgroundColor: Colors.input,
    borderRadius: 8
  },
  input: {
    marginBottom: 12,
    backgroundColor: Colors.input
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  flex1: {
    flex: 1
  },
  divider: {
    marginVertical: 20
  },
  metricContainer: {
    marginBottom: 16
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  sliderValue: {
    minWidth: 30,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500'
  },
  promptContainer: {
    marginBottom: 16
  },
  textArea: {
    backgroundColor: Colors.input,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top'
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: Colors.primary
  }
}) 