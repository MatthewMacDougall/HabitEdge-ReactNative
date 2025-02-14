import { useRouter } from 'expo-router';
import JournalEntryScreen from '@/screens/JournalEntryScreen';

export default function TabJournalScreen() {
  const router = useRouter();
  return <JournalEntryScreen />;
} 