import React, { useState, useEffect } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Card } from 'react-native-paper'
import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'
import { JournalEntry } from '@/types/journal'
import { loadJournalEntry, updateJournalEntry } from '@/utils/journalStorage'
import Toast from 'react-native-toast-message'
import { MetricsSection } from '@/components/sections/MetricsSection'
import { GameSection } from '@/components/sections/GameSection'
import { PromptsSection } from '@/components/sections/PromptsSection'
import { MediaSection } from '@/components/sections/MediaSection'
import { validateForm } from '@/utils/formValidation'
import { entryTypeConfigs } from '@/src/config/entryTypes'

export default function EditJournalEntryScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme]
  
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEntry()
  }, [id])

  const loadEntry = async () => {
    try {
      const loadedEntry = await loadJournalEntry(Number(id))
      setEntry(loadedEntry)
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load entry'
      })
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!entry) return

    const config = entryTypeConfigs[entry.type]
    const validation = validateForm(entry, config)
    
    if (validation !== true) {
      Toast.show({
        type: 'error',
        text1: validation.message
      })
      return
    }

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

  if (loading || !entry) return null

  const config = entryTypeConfigs[entry.type]

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <MetricsSection
            metrics={config.metrics}
            values={entry.metrics}
            onChange={(id, value) => 
              setEntry(prev => prev ? {
                ...prev,
                metrics: { ...prev.metrics, [id]: value }
              } : null)
            }
          />
          
          {entry.type === 'game' && (
            <GameSection
              gameDetails={entry.gameDetails}
              onChange={(field, value) =>
                setEntry(prev => {
                  if (!prev) return null;
                  const updatedGameDetails = {
                    ...prev.gameDetails,
                    [field]: value || '' // Ensure value is never undefined
                  };
                  return {
                    ...prev,
                    gameDetails: updatedGameDetails
                  };
                })
              }
            />
          )}

          <PromptsSection
            prompts={config.prompts}
            values={entry.prompts}
            onChange={(id, value) =>
              setEntry(prev => prev ? {
                ...prev,
                prompts: { ...prev.prompts, [id]: value }
              } : null)
            }
          />

          <MediaSection
            config={config.media}
            media={entry.media || {}}
            onUpload={(id, media) =>
              setEntry(prev => {
                if (!prev) return null
                return {
                  ...prev,
                  media: {
                    ...(prev.media || {}),
                    [id]: [...(prev.media?.[id] || []), media]
                  }
                }
              })
            }
            onDelete={(id, index) =>
              setEntry(prev => {
                if (!prev?.media?.[id]) return prev
                return {
                  ...prev,
                  media: {
                    ...prev.media,
                    [id]: prev.media[id].filter((_, i) => i !== index)
                  }
                }
              })
            }
            onAddLink={(id) => {/* Handle link dialog */}}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background
  },
  card: {
    margin: 16,
    borderRadius: 12
  }
}) 