import { Stack } from 'expo-router'
import EditJournalEntryScreen from '@/screens/EditJournalEntryScreen'
import { Button } from 'react-native-paper'
import { Colors } from '@/constants/Colors'
import { useRouter } from 'expo-router'

export default function EditJournalEntryRoute() {
  const router = useRouter()
  
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Edit Entry",
          gestureEnabled: true,
          headerBackVisible: false,
          headerRight: () => (
            <Button 
              mode="text" 
              onPress={() => router.back()}
              style={{ marginRight: -8 }}
              labelStyle={{ color: Colors.dark.primary }}
              compact
            >
              Cancel
            </Button>
          ),
          headerStyle: {
            backgroundColor: Colors.dark.surface,
          },
          headerTintColor: Colors.dark.text,
          headerTitleStyle: {
            color: Colors.dark.text,
          },
        }}
      />
      <EditJournalEntryScreen />
    </>
  )
} 