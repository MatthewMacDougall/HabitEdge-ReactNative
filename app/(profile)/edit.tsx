import React from 'react';
import { Stack } from 'expo-router';
import EditProfileScreen from '@/screens/EditProfileScreen';
import { Button } from 'react-native-paper';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';

export default function EditProfileRoute() {
  const router = useRouter();
  
  return (
    <>
      <Stack.Screen
        options={{
          title: "Edit Profile",
          headerShown: true,
          presentation: 'modal',
          headerRight: () => (
            <Button 
              mode="text" 
              onPress={() => router.back()}
              labelStyle={{ color: Colors.dark.primary }}
            >
              Cancel
            </Button>
          ),
          headerStyle: {
            backgroundColor: Colors.dark.background,
          },
          headerTintColor: Colors.dark.text,
          headerTitleStyle: {
            color: Colors.dark.text,
          },
        }}
      />
      <EditProfileScreen />
    </>
  );
} 