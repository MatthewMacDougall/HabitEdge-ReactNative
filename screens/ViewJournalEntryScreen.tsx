import React, { useEffect, useState } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Text, Surface, Button, Divider } from 'react-native-paper'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { JournalEntry } from '@/types/journal'
import { loadJournalEntry } from '@/utils/journalStorage'
import { Colors } from '@/constants/Colors'
import { entryTypeConfigs } from '@/src/config/entryTypes'
import { format } from 'date-fns'

export default function ViewJournalEntryScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [entry, setEntry] = useState<JournalEntry | null>(null)

  useEffect(() => {
    loadEntry()
  }, [id])

  const loadEntry = async () => {
    if (!id) return
    const loadedEntry = await loadJournalEntry(Number(id))
    if (loadedEntry) {
      setEntry(loadedEntry)
    }
  }

  if (!entry) return null

  const config = entryTypeConfigs[entry.type]

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          {entry.title || config.label}
        </Text>
        <Text style={styles.date}>
          {format(new Date(entry.date), 'MMMM d, yyyy')}
        </Text>
        <View style={styles.typeChip}>
          <Text style={styles.typeText}>{config.label}</Text>
        </View>
      </Surface>

      {entry.type === 'game' && entry.gameDetails && (
        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Game Details</Text>
          <View style={styles.gameDetails}>
            <Text style={styles.label}>Opponent</Text>
            <Text style={styles.value}>{entry.gameDetails.opponent}</Text>
            <Text style={styles.label}>Score</Text>
            <Text style={styles.value}>
              {entry.gameDetails.score.yourTeam} - {entry.gameDetails.score.opponent}
            </Text>
            <Text style={styles.label}>Result</Text>
            <Text style={[styles.value, styles.result]}>
              {entry.gameDetails.result.toUpperCase()}
            </Text>
          </View>
        </Surface>
      )}

      {Object.keys(entry.metrics).length > 0 && (
        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Ratings</Text>
          <View style={styles.metricsGrid}>
            {Object.entries(entry.metrics).map(([key, value]) => (
              <View key={key} style={styles.metricItem}>
                <Text style={styles.metricLabel}>
                  {config.metrics.find(m => m.id === key)?.label || key}
                </Text>
                <Text style={styles.metricValue}>{value.toFixed(1)}</Text>
              </View>
            ))}
          </View>
        </Surface>
      )}

      {Object.entries(entry.prompts).map(([key, value]) => {
        if (!value) return null
        const prompt = config.prompts.find(p => p.id === key)
        if (!prompt) return null

        return (
          <Surface key={key} style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {prompt.label}
            </Text>
            <Text style={styles.promptText}>{value}</Text>
          </Surface>
        )
      })}

      <View style={styles.buttonContainer}>
        <Button 
          mode="contained"
          onPress={() => router.push({
            pathname: '/journal/edit/[id]',
            params: { id: id.toString() }
          })}
          style={styles.editButton}
        >
          Edit Entry
        </Button>
        <Button 
          mode="outlined"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Back to Journal
        </Button>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
  },
  title: {
    color: Colors.dark.text,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    color: Colors.dark.textSecondary,
    fontSize: 16,
  },
  typeChip: {
    backgroundColor: Colors.dark.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
  typeText: {
    color: Colors.dark.background,
    fontWeight: '500',
  },
  section: {
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontWeight: '600',
    marginBottom: 12,
  },
  gameDetails: {
    gap: 8,
  },
  label: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  value: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '500',
  },
  result: {
    color: Colors.dark.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricItem: {
    width: '48%',
    backgroundColor: Colors.dark.input,
    padding: 12,
    borderRadius: 8,
  },
  metricLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  metricValue: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: '600',
  },
  promptText: {
    color: Colors.dark.text,
    fontSize: 16,
    lineHeight: 24,
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  editButton: {
    marginBottom: 8,
  },
  backButton: {
    marginBottom: 32,
  },
}) 