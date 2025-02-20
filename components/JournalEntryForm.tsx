/**
 * JournalEntryForm Component
 * 
 * Form for creating/editing journal entries.
 * 
 * Features:
 * - Date selection
 * - Training type selection
 * - Duration input
 * - Notes editor
 * - Metric tracking
 * - Target linking
 */

import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { TextInput, SegmentedButtons, Text, Surface } from 'react-native-paper'
import { EntryType, entryTypeConfigs } from '@/src/config/entryTypes'
import { EntryFormData } from '@/types/journal'
import DateTimePicker from '@react-native-community/datetimepicker'
import Slider from '@react-native-community/slider'
import { Colors } from '@/constants/Colors'

interface Props {
  entry: EntryFormData
  onChange: (entry: EntryFormData) => void
}

export function JournalEntryForm({ entry, onChange }: Props) {
  const config = entryTypeConfigs[entry.type]

  const handleChange = (field: keyof EntryFormData, value: any) => {
    onChange({
      ...entry,
      [field]: value
    })
  }

  const handlePromptChange = (promptId: string, value: string) => {
    onChange({
      ...entry,
      prompts: {
        ...entry.prompts,
        [promptId]: value
      }
    })
  }

  const handleMetricChange = (metricId: string, value: number) => {
    onChange({
      ...entry,
      metrics: {
        ...entry.metrics,
        [metricId]: parseFloat(value.toFixed(1))
      }
    })
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Entry Type</Text>
        <SegmentedButtons
          value={entry.type}
          onValueChange={(value) => handleChange('type', value)}
          buttons={Object.values(EntryType).map(type => ({
            value: type,
            label: entryTypeConfigs[type].label
          }))}
          style={styles.typeSelector}
        />
      </Surface>

      <Surface style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Basic Info</Text>
        <TextInput
          label="Title"
          value={entry.title}
          onChangeText={(value) => handleChange('title', value)}
          style={styles.input}
        />

        <View style={styles.dateContainer}>
          <Text>Date: </Text>
          <DateTimePicker
            value={new Date(entry.date)}
            onChange={(event, date) => {
              if (date) handleChange('date', date.toISOString())
            }}
            mode="date"
          />
        </View>
      </Surface>

      {config.metrics.length > 0 && (
        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Metrics</Text>
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
                  onValueChange={(value) => handleMetricChange(metric.id, value)}
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

      {config.prompts.length > 0 && (
        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Reflections</Text>
          {config.prompts.map(prompt => (
            <TextInput
              key={prompt.id}
              label={prompt.label}
              placeholder={prompt.placeholder || ''}
              value={entry.prompts[prompt.id] || ''}
              onChangeText={(value) => handlePromptChange(prompt.id, value)}
              multiline={prompt.multiline}
              numberOfLines={prompt.multiline ? 4 : 1}
              style={[styles.input, prompt.multiline && styles.multilineInput]}
            />
          ))}
        </Surface>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  typeSelector: {
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
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
    marginLeft: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  multilineInput: {
    minHeight: 100,
  }
}) 