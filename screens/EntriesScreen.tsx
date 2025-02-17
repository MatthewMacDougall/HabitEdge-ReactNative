import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { SharedStyles } from '@/constants/Styles';

export default function EntriesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme as keyof typeof Colors];

  // Automatically redirect to new journal entry
  React.useEffect(() => {
    router.push('/journal/new');
  }, []);

  return (
    <View style={[SharedStyles.screenContainer, { backgroundColor: colors.background }]}>
      <Text>Redirecting...</Text>
    </View>
  );
} 