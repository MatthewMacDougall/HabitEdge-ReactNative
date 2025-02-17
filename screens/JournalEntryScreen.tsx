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
import { EntryType, entryTypeConfigs, GameDetails } from '@/src/config/entryTypes'
import { Colors } from '@/constants/Colors'
import Toast from 'react-native-toast-message'
import { SharedStyles } from '@/constants/Styles'
import { useTheme } from '@/contexts/ThemeContext'

interface GameScore {
  yourTeam: string;
  opponent: string;
}

interface FormData {
  type: EntryType | '';
  metrics: Record<string, number>;
  prompts: Record<string, string>;
  gameDetails?: GameDetails & {
    score?: GameScore;
  };
}

export default function JournalEntryScreen() {
  const [title, setTitle] = useState('');
  const [formData, setFormData] = useState<FormData>({
    type: '',
    metrics: {},
    prompts: {}
  })

  const { theme } = useTheme();
  const colors = Colors[theme];

  const handleMetricChange = (metricId: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      metrics: { 
        ...prev.metrics, 
        [metricId]: parseFloat(value.toFixed(1))
      }
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
        [field]: value
      }
    }))
  }

  const determineResult = (yourScore: string, opponentScore: string): 'win' | 'loss' | 'draw' | undefined => {
    const yourNum = parseInt(yourScore);
    const oppNum = parseInt(opponentScore);
    
    if (isNaN(yourNum) || isNaN(oppNum)) return undefined;
    
    if (yourNum > oppNum) return 'win';
    if (yourNum < oppNum) return 'loss';
    return 'draw';
  };
  const handleScoreChange = (team: 'yourTeam' | 'opponent', value: string) => {
    setFormData((prev: FormData) => {
      const currentScore: GameScore = prev.gameDetails?.score ?? { yourTeam: '', opponent: '' };
      const newScore: GameScore = {
        ...currentScore,
        [team]: value
      };
      
      // Automatically determine the result based on scores
      const result = determineResult(newScore.yourTeam, newScore.opponent);
      
      return {
        ...prev,
        gameDetails: {
          ...prev.gameDetails,
          score: newScore,
          result
        }
      };
    });
  };

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
    
    // Validate required metrics
    const missingMetrics = config.metrics.filter(
      m => formData.metrics[m.id] === undefined
    )
    if (missingMetrics.length > 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Please rate all metrics`
      })
      return
    }

    // Validate required prompts
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
      
      // Reset form
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
    <View style={[SharedStyles.screenContainer, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text 
          variant="headlineMedium" 
          style={[styles.headerTitle, { color: colors.text }]}
        >
          New Entry
        </Text>
      </View>

      <ScrollView style={styles.form}>
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          style={[styles.input, { backgroundColor: colors.input }]}
          textColor={colors.text}
        />

        <Card style={[SharedStyles.card, styles.formCard]}>
          <Card.Content>
            <View style={styles.formSection}>
              <Text style={SharedStyles.label}>Entry Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.type}
                  onValueChange={(value: string) => setFormData({
                    type: value as EntryType,
                    metrics: {},
                    prompts: {}
                  })}
                  style={styles.picker}
                  dropdownIconColor={colors.text}
                  itemStyle={{ color: colors.text }}
                >
                  <Picker.Item label="Select entry type" value="" />
                  {Object.entries(entryTypeConfigs).map(([type, config]) => (
                    <Picker.Item
                      key={type}
                      label={config.label}
                      value={type}
                      color={colors.text}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {formData.type === 'game' && (
              <View style={styles.formSection}>
                <TextInput
                  label="Opponent Name"
                  value={formData.gameDetails?.opponent || ''}
                  onChangeText={(value: string) => handleGameDetailsChange('opponent', value)}
                  style={[SharedStyles.input, styles.input]}
                />
                
                <View style={styles.scoreContainer}>
                  <View style={styles.scoreTeam}>
                    <Text style={styles.scoreLabel}>Your Team</Text>
                    <TextInput
                      label="Score"
                      value={formData.gameDetails?.score?.yourTeam || ''}
                      onChangeText={(value: string) => handleScoreChange('yourTeam', value)}
                      keyboardType="numeric"
                      style={[SharedStyles.input, styles.scoreInput]}
                    />
                  </View>
                  
                  <Text style={styles.scoreSeparator}>-</Text>
                  
                  <View style={styles.scoreTeam}>
                    <Text style={styles.scoreLabel}>Opponent</Text>
                    <TextInput
                      label="Score"
                      value={formData.gameDetails?.score?.opponent || ''}
                      onChangeText={(value: string) => handleScoreChange('opponent', value)}
                      keyboardType="numeric"
                      style={[SharedStyles.input, styles.scoreInput]}
                    />
                  </View>
                </View>

                <View style={styles.resultContainer}>
                  <Text style={SharedStyles.label}>Result</Text>
                  <SegmentedButtons
                    value={formData.gameDetails?.result || ''}
                    onValueChange={(value: string) => 
                      handleGameDetailsChange('result', value as 'win' | 'loss' | 'draw')
                    }
                    buttons={[
                      { 
                        value: 'win', 
                        label: 'Win',
                        style: formData.gameDetails?.result === 'win' ? styles.winButton : undefined
                      },
                      { 
                        value: 'loss', 
                        label: 'Loss',
                        style: formData.gameDetails?.result === 'loss' ? styles.lossButton : undefined
                      },
                      { 
                        value: 'draw', 
                        label: 'Draw',
                        style: formData.gameDetails?.result === 'draw' ? styles.drawButton : undefined
                      }
                    ]}
                    style={styles.resultButtons}
                  />
                </View>
              </View>
            )}

            {selectedConfig && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Rate Your Performance</Text>
                  {selectedConfig.metrics.map((metric) => (
                    <View key={metric.id} style={styles.metricContainer}>
                      <View style={styles.metricHeader}>
                        <Text style={styles.label}>{metric.label}</Text>
                        <Text style={styles.sliderValue}>
                          {(formData.metrics[metric.id] || 5).toFixed(1)}
                        </Text>
                      </View>
                      <Text style={styles.description}>{metric.description}</Text>
                      <View style={styles.sliderContainer}>
                        <Text style={styles.sliderMinMax}>{metric.min}</Text>
                        <Slider
                          minimumValue={metric.min}
                          maximumValue={metric.max}
                          step={0.1}
                          value={formData.metrics[metric.id] || 5}
                          onValueChange={(value: number) => handleMetricChange(metric.id, value)}
                          minimumTrackTintColor={colors.primary}
                          maximumTrackTintColor={colors.border}
                          thumbTintColor={colors.primary}
                          style={styles.slider}
                        />
                        <Text style={styles.sliderMinMax}>{metric.max}</Text>
                      </View>
                      <View style={styles.sliderLabels}>
                        <Text style={styles.sliderLabel}>Poor</Text>
                        <Text style={styles.sliderLabel}>Excellent</Text>
                      </View>
                    </View>
                  ))}
                </View>

                <Divider style={styles.divider} />
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Reflect on Your Performance</Text>
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
    </View>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  formCard: {
    marginTop: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  pickerContainer: {
    backgroundColor: Colors.dark.input,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    backgroundColor: Colors.dark.input,
    color: Colors.dark.text,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: Colors.dark.text
  },
  required: {
    color: Colors.dark.error
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: Colors.dark.text
  },
  input: {
    marginBottom: 12,
    backgroundColor: Colors.dark.input
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
    marginBottom: 24,
    backgroundColor: Colors.dark.card,
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 16,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  slider: {
    flex: 1,
    height: 40, // Increased height for better touch target
  },
  sliderValue: {
    color: Colors.dark.primary,
    fontSize: 20,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  sliderMinMax: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  sliderLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
  promptContainer: {
    marginBottom: 16
  },
  textArea: {
    backgroundColor: Colors.dark.input,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top'
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: Colors.dark.primary
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 12,
  },
  scoreTeam: {
    flex: 1,
    alignItems: 'center',
  },
  scoreLabel: {
    color: Colors.dark.text,
    fontSize: 16,
    marginBottom: 8,
  },
  scoreInput: {
    width: '100%',
    textAlign: 'center',
  },
  scoreSeparator: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  resultContainer: {
    marginTop: 8,
  },
  resultButtons: {
    marginTop: 8,
  },
  winButton: {
    backgroundColor: Colors.dark.primary,
  },
  lossButton: {
    backgroundColor: Colors.dark.error,
  },
  drawButton: {
    backgroundColor: Colors.dark.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
}) 