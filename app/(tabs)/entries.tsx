import { useLocalSearchParams } from 'expo-router'
import JournalEntryScreen from '@/screens/JournalEntryScreen'

export default function EntriesScreen() {
  const { id } = useLocalSearchParams()
  return <JournalEntryScreen id={id === 'new' ? undefined : Number(id)} />
} 
