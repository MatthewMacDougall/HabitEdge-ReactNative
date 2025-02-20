import React, { useState, useEffect, useCallback } from 'react'
import { View, ScrollView, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native'
import { TextInput, SegmentedButtons, Text, Surface, Button, IconButton, Menu } from 'react-native-paper'
import { useRouter, useFocusEffect } from 'expo-router'
import { EntryType, entryTypeConfigs, FilmDetails } from '@/src/config/entryTypes'
import { EntryFormData, GameScore } from '@/types/journal'
import DateTimePicker from '@react-native-community/datetimepicker'
import Slider from '@react-native-community/slider'
import { Colors } from '@/constants/Colors'
import { addJournalEntry, loadJournalEntry, updateJournalEntry } from '@/utils/journalStorage'
import Toast from 'react-native-toast-message'
import { SharedStyles } from '@/constants/Styles'
import { Picker } from '@react-native-picker/picker'
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'react-native'

type MediaItemType = {
  type: 'upload' | 'link'
  url: string
  name: string
}

const createEmptyEntry = (): EntryFormData => ({
  type: EntryType.Game,
  date: new Date().toISOString(),
  title: '',
  metrics: {},
  prompts: {},
  media: {},
  gameDetails: {
    opponent: '',
    score: { yourTeam: '0', opponent: '0' },
    result: 'draw'
  },
  filmDetails: undefined
})

export default function JournalEntryScreen() {
  const router = useRouter()
  const [entry, setEntry] = useState<EntryFormData>(createEmptyEntry())
  const config = entryTypeConfigs[entry.type]
  const [linkInput, setLinkInput] = useState<Record<string, string>>({})
  const [showTypeMenu, setShowTypeMenu] = useState(false)
  const [showFilmTypeMenu, setShowFilmTypeMenu] = useState(false)

  // Simplify to just reset form when screen is focused
  useFocusEffect(
    useCallback(() => {
      setEntry(createEmptyEntry())
      return () => {
        setEntry(createEmptyEntry())
      }
    }, [])
  )

  const handleMetricChange = (metricId: string, value: number) => {
    setEntry(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [metricId]: parseFloat(value.toFixed(1))
      }
    }))
  }

  const handleGameDetailsChange = (field: string, value: any) => {
    setEntry(prev => ({
      ...prev,
      gameDetails: {
        ...prev.gameDetails,
        [field]: value
      }
    }))
  }

  const handleScoreChange = (team: keyof GameScore, value: string) => {
    // Remove leading zeros and non-numeric characters
    const cleanValue = value.replace(/^0+/, '').replace(/[^0-9]/g, '') || '0'
    
    setEntry(prev => {
      const newScore = {
        ...(prev.gameDetails?.score ?? { yourTeam: '0', opponent: '0' }),
        [team]: cleanValue
      }
      
      const yourNum = parseInt(newScore.yourTeam)
      const oppNum = parseInt(newScore.opponent)
      let result = prev.gameDetails?.result
      
      if (!isNaN(yourNum) && !isNaN(oppNum)) {
        if (yourNum > oppNum) result = 'win'
        else if (yourNum < oppNum) result = 'loss'
        else result = 'draw'
      }

      return {
        ...prev,
        gameDetails: {
          ...prev.gameDetails,
          score: newScore,
          result
        }
      }
    })
  }

  const handleSubmit = async () => {
    try {
      const errors = validateEntry(entry, config)
      if (errors.length > 0) {
        Toast.show({
          type: 'error',
          text1: 'Please fill in all required fields',
          text2: errors[0],
        })
        return
      }

      await addJournalEntry(entry)
      Toast.show({
        type: 'success',
        text1: 'Entry saved successfully'
      })
      
      setEntry(createEmptyEntry())
      router.back()
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to save entry'
      })
    }
  }

  const handleMediaUpload = async (mediaId: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      })

      if (!result.canceled) {
        const media: MediaItemType = {
          type: 'upload' as const,
          url: result.assets[0].uri,
          name: 'Upload'
        }
        
        setEntry(prev => ({
          ...prev,
          media: {
            ...prev.media,
            [mediaId]: [...(prev.media[mediaId] || []), media]
          }
        }))
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to upload media'
      })
    }
  }

  const handleLinkAdd = (mediaId: string) => {
    if (!linkInput[mediaId]?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a valid URL'
      })
      return
    }

    const media: MediaItemType = {
      type: 'link' as const,
      url: linkInput[mediaId],
      name: 'Link'
    }
    
    setEntry(prev => ({
      ...prev,
      media: {
        ...prev.media,
        [mediaId]: [...(prev.media[mediaId] || []), media]
      }
    }))
    setLinkInput(prev => ({ ...prev, [mediaId]: '' }))
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <Surface style={[styles.section, styles.typeSection]}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Entry Type</Text>
          <Menu
            visible={showTypeMenu}
            onDismiss={() => setShowTypeMenu(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setShowTypeMenu(true)}
                icon="filter-variant"
                style={styles.typeButton}
              >
                {entryTypeConfigs[entry.type].label}
              </Button>
            }
          >
            {Object.entries(entryTypeConfigs).map(([type, config]) => (
              <Menu.Item
                key={type}
                onPress={() => {
                  const newType = type as EntryType
                  setEntry(prev => ({
                    ...prev,
                    type: newType,
                    filmDetails: newType === EntryType.Film ? {
                      filmType: 'team' as const
                    } : undefined,
                    gameDetails: {
                      opponent: '',
                      score: { yourTeam: '0', opponent: '0' },
                      result: 'draw'
                    }
                  }))
                  setShowTypeMenu(false)
                }}
                title={config.label}
                titleStyle={[
                  styles.menuItem,
                  entry.type === type && styles.selectedMenuItem
                ]}
              />
            ))}
          </Menu>
        </Surface>

        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Basic Info</Text>
          <TextInput
            label="Title"
            value={entry.title}
            onChangeText={(value) => setEntry(prev => ({ ...prev, title: value }))}
            style={styles.input}
          />
          <View style={styles.dateContainer}>
            <Text>Date: </Text>
            <DateTimePicker
              value={new Date(entry.date)}
              onChange={(event, date) => {
                if (date && date <= new Date()) {
                  setEntry({ ...entry, date: date.toISOString() })
                }
              }}
              mode="date"
              maximumDate={new Date()}
            />
          </View>
        </Surface>

        {entry.type === EntryType.Game && (
          <Surface style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Game Details</Text>
            <TextInput
              label="Opponent"
              value={entry.gameDetails?.opponent}
              onChangeText={(value) => handleGameDetailsChange('opponent', value)}
              style={styles.input}
            />
            
            <View style={styles.scoreContainer}>
              <View style={styles.scoreTeam}>
                <Text style={styles.scoreLabel}>Your Team</Text>
                <TextInput
                  keyboardType="numeric"
                  value={entry.gameDetails?.score?.yourTeam}
                  onChangeText={(value) => handleScoreChange('yourTeam', value)}
                  style={[styles.input, styles.scoreInput]}
                />
              </View>
              
              <Text style={styles.scoreSeparator}>-</Text>
              
              <View style={styles.scoreTeam}>
                <Text style={styles.scoreLabel}>Opponent</Text>
                <TextInput
                  keyboardType="numeric"
                  value={entry.gameDetails?.score?.opponent}
                  onChangeText={(value) => handleScoreChange('opponent', value)}
                  style={[styles.input, styles.scoreInput]}
                />
              </View>
            </View>

            <Text style={styles.label}>Result</Text>
            <SegmentedButtons
              value={entry.gameDetails?.result || 'draw'}
              onValueChange={(value) => handleGameDetailsChange('result', value)}
              style={styles.resultButtons}
              buttons={[
                { 
                  value: 'win',
                  label: 'Win',
                  style: [styles.resultButton],
                  checkedColor: Colors.dark.background,
                  uncheckedColor: Colors.dark.primary
                },
                { 
                  value: 'loss',
                  label: 'Loss',
                  style: [styles.resultButton],
                  checkedColor: Colors.dark.background,
                  uncheckedColor: Colors.dark.primary
                },
                { 
                  value: 'draw',
                  label: 'Draw',
                  style: [styles.resultButton],
                  checkedColor: Colors.dark.background,
                  uncheckedColor: Colors.dark.primary
                }
              ]}
            />
          </Surface>
        )}

        {entry.type === EntryType.Film && config.filmDetails && (
          <Surface style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Film Details</Text>
            <Text style={styles.description}>{config.filmDetails.description}</Text>
            <Menu
              visible={showFilmTypeMenu}
              onDismiss={() => setShowFilmTypeMenu(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setShowFilmTypeMenu(true)}
                  style={styles.typeButton}
                  labelStyle={styles.buttonText}
                >
                  {config.filmDetails.options.find(
                    opt => opt.value === entry.filmDetails?.filmType
                  )?.label || 'Select Film Type'}
                </Button>
              }
            >
              {config.filmDetails.options.map((option) => (
                <Menu.Item
                  key={option.value}
                  onPress={() => {
                    setEntry(prev => ({
                      ...prev,
                      filmDetails: {
                        filmType: option.value,
                        ...(option.value === 'other' ? { otherDescription: '' } : {})
                      }
                    }))
                    setShowFilmTypeMenu(false)
                  }}
                  title={option.label}
                  titleStyle={[
                    styles.menuItem,
                    entry.filmDetails?.filmType === option.value && styles.selectedMenuItem
                  ]}
                />
              ))}
            </Menu>

            {entry.filmDetails?.filmType === 'other' && (
              <TextInput
                label="Describe the film type"
                value={entry.filmDetails?.otherDescription || ''}
                onChangeText={(value) => setEntry(prev => ({
                  ...prev,
                  filmDetails: {
                    ...prev.filmDetails,
                    otherDescription: value
                  }
                }))}
                style={[styles.input, { marginTop: 16 }]}
                placeholder="E.g., Training videos, tutorials, etc."
              />
            )}
          </Surface>
        )}

        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Metrics</Text>
          {config.metrics.map((metric) => (
            <View key={metric.id} style={styles.metricContainer}>
              <View style={styles.metricHeader}>
                <Text style={styles.label}>{metric.label}</Text>
                <Text style={styles.metricValue}>
                  {(entry.metrics[metric.id] || 5).toFixed(1)}
                </Text>
              </View>
              <Text style={styles.description}>{metric.description}</Text>
              <Slider
                minimumValue={metric.min || 0}
                maximumValue={metric.max || 10}
                step={0.1}
                value={entry.metrics[metric.id] || 5}
                onValueChange={(value) => handleMetricChange(metric.id, value)}
                minimumTrackTintColor={Colors.dark.primary}
                maximumTrackTintColor={Colors.dark.border}
              />
            </View>
          ))}
        </Surface>

        {config.prompts.length > 0 && (
          <Surface style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Prompts</Text>
            {config.prompts.map(prompt => (
              <TextInput
                key={prompt.id}
                mode="outlined"
                label={
                  <View style={styles.labelRow}>
                    <Text>{prompt.label}</Text>
                    {prompt.required && <Text style={styles.required}>*</Text>}
                  </View>
                }
                placeholder={prompt.placeholder}
                value={entry.prompts[prompt.id] || ''}
                onChangeText={(value) => setEntry(prev => ({
                  ...prev,
                  prompts: { ...prev.prompts, [prompt.id]: value }
                }))}
                multiline
                numberOfLines={6}
                style={[styles.input, styles.promptInput]}
              />
            ))}
          </Surface>
        )}

        {config.media && config.media.length > 0 && (
          <Surface style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Media</Text>
            {config.media.map(mediaConfig => (
              <View key={mediaConfig.id} style={styles.mediaSection}>
                <View style={styles.mediaTitleRow}>
                  <Text style={styles.label}>{mediaConfig.label}</Text>
                  {mediaConfig.required && (
                    <Text style={styles.required}>*Required</Text>
                  )}
                </View>
                <Text style={styles.description}>{mediaConfig.description}</Text>
                
                {entry.media[mediaConfig.id]?.map((item, index) => (
                  <View key={index} style={styles.mediaItem}>
                    {item.type === 'upload' ? (
                      <Image source={{ uri: item.url }} style={styles.mediaPreview} />
                    ) : (
                      <Text style={styles.linkText}>{item.url}</Text>
                    )}
                    <IconButton 
                      icon="delete" 
                      onPress={() => {
                        setEntry(prev => ({
                          ...prev,
                          media: {
                            ...prev.media,
                            [mediaConfig.id]: prev.media[mediaConfig.id].filter((_, i) => i !== index)
                          }
                        }))
                      }}
                    />
                  </View>
                ))}
                
                <View style={styles.mediaInputs}>
                  <Button 
                    mode="outlined"
                    icon="upload"
                    onPress={() => handleMediaUpload(mediaConfig.id)}
                    style={styles.mediaButton}
                  >
                    Upload Media
                  </Button>

                  <View style={styles.linkInput}>
                    <TextInput
                      placeholder="Enter URL"
                      value={linkInput[mediaConfig.id] || ''}
                      onChangeText={(value) => 
                        setLinkInput(prev => ({ ...prev, [mediaConfig.id]: value }))
                      }
                      style={styles.linkTextInput}
                    />
                    <Button 
                      mode="outlined"
                      icon="link"
                      onPress={() => handleLinkAdd(mediaConfig.id)}
                      style={styles.mediaButton}
                    >
                      Add Link
                    </Button>
                  </View>
                </View>
              </View>
            ))}
          </Surface>
        )}

        <Button 
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          Save Entry
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 32,
    paddingBottom: 120,
  },
  section: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
  },
  metricContainer: {
    marginBottom: 24,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    color: Colors.dark.primary,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreTeam: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  scoreInput: {
    textAlign: 'center',
  },
  scoreSeparator: {
    marginHorizontal: 16,
    fontSize: 20,
  },
  submitButton: {
    marginVertical: 16,
    marginBottom: 32,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
  },
  pickerSection: {
    paddingVertical: 8, // Reduce vertical padding
  },
  picker: {
    marginHorizontal: -16,
    height: 120, // Reduce picker height
  },
  pickerItem: {
    height: 120, // Match picker height
  },
  promptInput: {
    minHeight: 120, // Consistent height for all prompts
    height: 120, // Fixed height
    textAlignVertical: 'top',
    paddingTop: 8,
    paddingBottom: 8,
  },
  resultButton: {
    borderColor: Colors.dark.primary,
  },
  selectedResult: {
    backgroundColor: Colors.dark.primary,
  },
  resultText: {
    color: Colors.dark.primary,
    fontSize: 16,
  },
  selectedResultText: {
    color: Colors.dark.background,
    fontWeight: 'bold',
  },
  resultButtons: {
    // Add any specific styles for the result buttons if needed
  },
  mediaSection: {
    marginBottom: 24,
  },
  mediaTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  required: {
    color: Colors.dark.error,
    marginLeft: 4,
    fontSize: 14,
  },
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  mediaPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  mediaInputs: {
    gap: 8,
  },
  mediaButton: {
    flex: 1,
  },
  linkInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  linkTextInput: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  linkText: {
    flex: 1,
    color: Colors.dark.primary,
    textDecorationLine: 'underline',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeSection: {
    marginBottom: 16,
  },
  typeButton: {
    width: '100%',
    marginTop: 8,
  },
  buttonText: {
    textAlign: 'center',
  },
  menuItem: {
    color: Colors.dark.text,
    textAlign: 'left',
  },
  selectedMenuItem: {
    color: Colors.dark.primary,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
})

function validateEntry(entry: EntryFormData, config: any) {
  const errors: string[] = []

  if (entry.type === 'game' && !entry.gameDetails?.opponent) {
    errors.push('Opponent name is required')
  }

  const missingMetrics = config.metrics
    .filter((metric: any) => !entry.metrics[metric.id])
    .map((metric: any) => metric.label)

  if (missingMetrics.length > 0) {
    errors.push(`Missing metrics: ${missingMetrics.join(', ')}`)
  }

  const missingPrompts = config.prompts
    .filter((prompt: any) => !entry.prompts[prompt.id] && prompt.required)
    .map((prompt: any) => prompt.label)

  if (missingPrompts.length > 0) {
    errors.push(`Missing prompts: ${missingPrompts.join(', ')}`)
  }

  const missingMedia = config.media
    ?.filter((media: any) => media.required && !entry.media[media.id]?.length)
    .map((media: any) => media.label)

  if (missingMedia?.length) {
    errors.push(`Missing media: ${missingMedia.join(', ')}`)
  }

  return errors
} 