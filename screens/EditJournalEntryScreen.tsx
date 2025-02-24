import React, { useState, useEffect } from 'react'
import { View, ScrollView, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native'
import { TextInput, SegmentedButtons, Text, Surface, Button, Menu, IconButton } from 'react-native-paper'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { loadJournalEntry, updateJournalEntry } from '@/utils/journalStorage'
import { EntryFormData, MediaItem } from '@/types/journal'
import { Colors } from '@/constants/Colors'
import { SharedStyles } from '@/constants/Styles'
import { entryTypeConfigs } from '@/src/config/entryTypes'
import DateTimePicker from '@react-native-community/datetimepicker'
import Slider from '@react-native-community/slider'
import Toast from 'react-native-toast-message'
import { EntryType } from '@/src/config/entryTypes'
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'react-native'
import { FilmDetails } from '@/src/config/entryTypes'

export default function EditJournalEntryScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [entry, setEntry] = useState<EntryFormData | null>(null)
  const [showTypeMenu, setShowTypeMenu] = useState(false)
  const [showFilmTypeMenu, setShowFilmTypeMenu] = useState(false)
  const [linkInput, setLinkInput] = useState<Record<string, string>>({})

  useEffect(() => {
    loadExistingEntry()
  }, [id])

  const loadExistingEntry = async () => {
    try {
      const existingEntry = await loadJournalEntry(Number(id))
      if (existingEntry) {
        const editableEntry: EntryFormData = {
          ...existingEntry,
          gameDetails: existingEntry.gameDetails || {
            opponent: '',
            score: { yourTeam: '0', opponent: '0' },
            result: 'draw'
          },
          filmDetails: existingEntry.filmDetails || {
            filmType: 'pros'
          },
          metrics: existingEntry.metrics || {},
          prompts: existingEntry.prompts || {},
          media: existingEntry.media || {}
        }
        setEntry(editableEntry)
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load entry'
      })
      router.back()
    }
  }

  const handleSubmit = async () => {
    if (!entry) return;

    try {
      const errors = validateEntry(entry, config);
      if (errors.length > 0) {
        Toast.show({
          type: 'error',
          text1: 'Please fill in all required fields',
          text2: errors[0]
        });
        return;
      }

      await updateJournalEntry(Number(id), entry);
      Toast.show({
        type: 'success',
        text1: 'Entry updated successfully'
      });
      router.back();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to update entry'
      });
    }
  };

  const handleMediaUpload = async (mediaId: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      })

      if (!result.canceled && entry) {
        const media: MediaItem = {
          type: 'upload' as const,
          url: result.assets[0].uri,
          name: 'Upload'
        }
        
        setEntry({
          ...entry,
          media: {
            ...entry.media,
            [mediaId]: [...(entry.media[mediaId] || []), media]
          }
        })
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to upload media'
      })
    }
  }

  const handleLinkAdd = (mediaId: string) => {
    if (!entry || !linkInput[mediaId]?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a valid URL'
      })
      return
    }

    const media: MediaItem = {
      type: 'link' as const,
      url: linkInput[mediaId],
      name: 'Link'
    }
    
    setEntry({
      ...entry,
      media: {
        ...entry.media,
        [mediaId]: [...(entry.media[mediaId] || []), media]
      }
    })
    setLinkInput(prev => ({ ...prev, [mediaId]: '' }))
  }

  if (!entry) return null

  const config = entryTypeConfigs[entry.type]

  const handleGameResultChange = (result: 'win' | 'loss' | 'draw') => {
    setEntry({
      ...entry,
      gameDetails: {
        ...entry.gameDetails,
        result
      }
    });
  };

  const determineGameResult = (yourScore: string, opponentScore: string): 'win' | 'loss' | 'draw' => {
    const yourScoreNum = parseInt(yourScore);
    const opponentScoreNum = parseInt(opponentScore);
    
    if (yourScoreNum > opponentScoreNum) return 'win';
    if (yourScoreNum < opponentScoreNum) return 'loss';
    return 'draw';
  };

  const handleScoreChange = (value: string, field: 'yourTeam' | 'opponent') => {
    const cleanValue = value.replace(/^0+/, '').replace(/[^0-9]/g, '');
    
    const newScore = {
      yourTeam: field === 'yourTeam' ? (cleanValue || '0') : (entry.gameDetails?.score?.yourTeam || '0'),
      opponent: field === 'opponent' ? (cleanValue || '0') : (entry.gameDetails?.score?.opponent || '0')
    };

    setEntry({
      ...entry,
      gameDetails: {
        ...entry.gameDetails,
        score: newScore,
        result: determineGameResult(newScore.yourTeam, newScore.opponent)
      }
    });
  };

  const validateEntry = (entry: EntryFormData, config: any) => {
    const errors: string[] = [];

    if (!entry.title.trim()) {
      errors.push('Title is required');
    }

    if (entry.type === 'game' && !entry.gameDetails?.opponent) {
      errors.push('Opponent name is required');
    }

    const missingPrompts = config.prompts
      .filter((prompt: any) => prompt.required && !entry.prompts[prompt.id]?.trim())
      .map((prompt: any) => prompt.label);

    if (missingPrompts.length > 0) {
      errors.push(`Required prompts missing: ${missingPrompts.join(', ')}`);
    }

    return errors;
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Surface style={styles.section}>
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
                  setEntry({ ...entry, type: type as EntryType })
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
            onChangeText={(value) => setEntry({ ...entry, title: value })}
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

        {entry.type === 'game' && (
          <Surface style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Game Details</Text>
            <TextInput
              label="Opponent"
              value={entry.gameDetails?.opponent || ''}
              onChangeText={(value) => setEntry({
                ...entry,
                gameDetails: {
                  ...entry.gameDetails,
                  opponent: value,
                }
              })}
              style={styles.input}
            />
            <View style={styles.scoreContainer}>
              <TextInput
                label="Your Score"
                value={entry.gameDetails?.score?.yourTeam || '0'}
                onChangeText={(value) => handleScoreChange(value, 'yourTeam')}
                keyboardType="numeric"
                style={[styles.input, styles.scoreInput]}
              />
              <Text style={styles.scoreSeparator}>-</Text>
              <TextInput
                label="Opponent Score"
                value={entry.gameDetails?.score?.opponent || '0'}
                onChangeText={(value) => handleScoreChange(value, 'opponent')}
                keyboardType="numeric"
                style={[styles.input, styles.scoreInput]}
              />
            </View>
            <SegmentedButtons
              value={entry.gameDetails?.result || 'draw'}
              onValueChange={(value) => handleGameResultChange(value as 'win' | 'loss' | 'draw')}
              style={styles.resultButtons}
              buttons={[
                { 
                  value: 'win',
                  label: 'Win',
                  showSelectedCheck: false,
                  checkedColor: Colors.dark.text,
                  uncheckedColor: Colors.dark.primary
                },
                { 
                  value: 'loss',
                  label: 'Loss',
                  showSelectedCheck: false,
                  checkedColor: Colors.dark.text,
                  uncheckedColor: Colors.dark.primary
                },
                { 
                  value: 'draw',
                  label: 'Draw',
                  showSelectedCheck: false,
                  checkedColor: Colors.dark.text,
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
                >
                  {config.filmDetails.options.find(opt => opt.value === entry.filmDetails?.filmType)?.label || 'Select Film Type'}
                </Button>
              }
            >
              {config.filmDetails.options.map((option) => (
                <Menu.Item
                  key={option.value}
                  onPress={() => {
                    setEntry({
                      ...entry,
                      filmDetails: {
                        ...entry.filmDetails,
                        filmType: option.value,
                        ...(option.value !== 'other' && { otherDescription: undefined })
                      }
                    })
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
                onChangeText={(value) => setEntry({
                  ...entry,
                  filmDetails: {
                    ...entry.filmDetails,
                    otherDescription: value
                  }
                })}
                style={[styles.input, { marginTop: 16 }]}
                placeholder="E.g., Training videos, tutorials, etc."
              />
            )}
          </Surface>
        )}

        {config.metrics.length > 0 && (
          <Surface style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Ratings</Text>
            {config.metrics.map(metric => (
              <View key={metric.id} style={styles.metricContainer}>
                <Text>{metric.label}</Text>
                <View style={styles.sliderContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={metric.min || 0}
                    maximumValue={metric.max || 10}
                    step={0.1}
                    value={entry.metrics[metric.id] || 5.0}
                    onValueChange={(value) => setEntry({
                      ...entry,
                      metrics: {
                        ...entry.metrics,
                        [metric.id]: value,
                      }
                    })}
                    minimumTrackTintColor={Colors.dark.primary}
                    maximumTrackTintColor={Colors.dark.border}
                  />
                  <Text style={styles.sliderValue}>
                    {(entry.metrics[metric.id] || 5.0).toFixed(1)}
                  </Text>
                </View>
              </View>
            ))}
          </Surface>
        )}

        {config.prompts.map(prompt => (
          <Surface key={prompt.id} style={styles.section}>
            <View style={styles.promptHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {prompt.label}
                {prompt.required && <Text style={styles.requiredStar}> *</Text>}
              </Text>
            </View>
            <TextInput
              multiline
              numberOfLines={4}
              value={entry.prompts[prompt.id] || ''}
              onChangeText={(value) => setEntry({
                ...entry,
                prompts: {
                  ...entry.prompts,
                  [prompt.id]: value,
                }
              })}
              placeholder={prompt.placeholder}
              style={[
                styles.input, 
                styles.multilineInput,
                prompt.required && !entry.prompts[prompt.id]?.trim() && styles.requiredInput
              ]}
            />
          </Surface>
        ))}

        {config.media && config.media.length > 0 && (
          <Surface style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Media</Text>
            {config.media.map(mediaConfig => (
              <View key={mediaConfig.id} style={styles.mediaSection}>
                <View style={styles.mediaTitleRow}>
                  <Text>{mediaConfig.label}</Text>
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
                        setEntry({
                          ...entry,
                          media: {
                            ...entry.media,
                            [mediaConfig.id]: entry.media[mediaConfig.id].filter((_, i) => i !== index)
                          }
                        })
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
          Update Entry
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
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  input: {
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreInput: {
    flex: 1,
  },
  scoreSeparator: {
    fontSize: 24,
    color: Colors.dark.text,
  },
  metricContainer: {
    marginBottom: 16,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    minWidth: 45,
    textAlign: 'center',
    color: Colors.dark.text,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeButton: {
    width: '100%',
    marginTop: 8,
  },
  menuItem: {
    color: Colors.dark.text,
  },
  selectedMenuItem: {
    color: Colors.dark.primary,
    fontWeight: 'bold',
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
  description: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
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
  cancelButton: {
    marginRight: -8,
  },
  cancelButtonText: {
    color: Colors.dark.primary,
  },
  resultButtons: {
    marginTop: 16,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  requiredStar: {
    color: Colors.dark.error,
    fontSize: 18,
  },
  requiredInput: {
    borderColor: Colors.dark.error,
    borderWidth: 1,
  },
}) 