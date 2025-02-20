import React, { useState, useEffect } from 'react'
import { View, ScrollView, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native'
import { TextInput, SegmentedButtons, Text, Surface, Button, Menu } from 'react-native-paper'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { loadJournalEntry, updateJournalEntry } from '@/utils/journalStorage'
import { EntryFormData } from '@/types/journal'
import { Colors } from '@/constants/Colors'
import { SharedStyles } from '@/constants/Styles'
import { entryTypeConfigs } from '@/src/config/entryTypes'
import DateTimePicker from '@react-native-community/datetimepicker'
import Slider from '@react-native-community/slider'
import Toast from 'react-native-toast-message'

export default function EditJournalEntryScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [entry, setEntry] = useState<EntryFormData | null>(null)
  const [showTypeMenu, setShowTypeMenu] = useState(false)

  useEffect(() => {
    loadExistingEntry()
  }, [id])

  const loadExistingEntry = async () => {
    try {
      const existingEntry = await loadJournalEntry(Number(id))
      if (existingEntry) {
        setEntry(existingEntry)
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
    if (!entry) return

    try {
      await updateJournalEntry(Number(id), entry)
      Toast.show({
        type: 'success',
        text1: 'Entry updated successfully'
      })
      router.back()
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to update entry'
      })
    }
  }

  if (!entry) return null

  const config = entryTypeConfigs[entry.type]

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
                contentStyle={styles.typeButton}
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
                if (date) setEntry({ ...entry, date: date.toISOString() })
              }}
              mode="date"
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
                onChangeText={(value) => setEntry({
                  ...entry,
                  gameDetails: {
                    ...entry.gameDetails,
                    score: {
                      ...entry.gameDetails?.score,
                      yourTeam: value,
                    }
                  }
                })}
                keyboardType="numeric"
                style={[styles.input, styles.scoreInput]}
              />
              <Text style={styles.scoreSeparator}>-</Text>
              <TextInput
                label="Opponent Score"
                value={entry.gameDetails?.score?.opponent || '0'}
                onChangeText={(value) => setEntry({
                  ...entry,
                  gameDetails: {
                    ...entry.gameDetails,
                    score: {
                      ...entry.gameDetails?.score,
                      opponent: value,
                    }
                  }
                })}
                keyboardType="numeric"
                style={[styles.input, styles.scoreInput]}
              />
            </View>
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
            <Text variant="titleMedium" style={styles.sectionTitle}>{prompt.label}</Text>
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
              style={[styles.input, styles.multilineInput]}
            />
          </Surface>
        ))}

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
    height: 36,
  },
  menuItem: {
    color: Colors.dark.text,
  },
  selectedMenuItem: {
    color: Colors.dark.primary,
    fontWeight: 'bold',
  },
}) 