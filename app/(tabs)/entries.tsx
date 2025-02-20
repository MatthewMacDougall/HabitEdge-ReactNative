import { Stack } from 'expo-router'
import JournalEntryScreen from '@/screens/JournalEntryScreen'
import { Colors } from '@/constants/Colors'

export default function EntriesScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "New Entry",
          headerStyle: {
            backgroundColor: Colors.dark.surface,
          },
          headerTintColor: Colors.dark.text,
          headerTitleStyle: {
            color: Colors.dark.text,
          },
        }}
      />
      <JournalEntryScreen />
    </>
  )
} 
