import React, { useState, useEffect } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { loadJournalEntry, updateJournalEntry } from '@/utils/journalStorage'
import { JournalEntry } from '@/types/journal'
import { JournalEntryForm } from '@/components/JournalEntryForm'
import Toast from 'react-native-toast-message'
import { validateForm } from '@/utils/formValidation'

export default function EditJournalEntryScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
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

    try {
      await updateJournalEntry(entry.id, entry)
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

  return (
    <JournalEntryForm
      entry={entry}
      onChange={setEntry}
      onSubmit={handleSubmit}
    />
  )
} 