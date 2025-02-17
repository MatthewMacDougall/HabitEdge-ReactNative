import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, List, Avatar, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { SharedStyles } from '@/constants/Styles';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme as keyof typeof Colors];

  return (
    <ScrollView 
      style={[SharedStyles.screenContainer, { backgroundColor: colors.background }]}
      contentContainerStyle={SharedStyles.contentContainer}
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label="JD"
          style={{ backgroundColor: colors.primary }}
        />
        <Text 
          variant="headlineMedium" 
          style={[styles.name, { color: colors.text }]}
        >
          John Doe
        </Text>
        <Text 
          variant="bodyLarge" 
          style={[styles.sport, { color: colors.textSecondary }]}
        >
          Basketball
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <Surface style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>24</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Journal Entries
          </Text>
        </Surface>
        <Surface style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>8</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Active Targets
          </Text>
        </Surface>
      </View>

      {/* Menu Items */}
      <Card style={[SharedStyles.card, { backgroundColor: colors.card }]}>
        <List.Section>
          <List.Item
            title="Performance Insights"
            description="View your progress analytics"
            left={props => <List.Icon {...props} icon="chart-line" />}
            onPress={() => router.push('/insights')}
            titleStyle={{ color: colors.text }}
            descriptionStyle={{ color: colors.textSecondary }}
          />
          <List.Item
            title="Settings"
            description="App preferences and account settings"
            left={props => <List.Icon {...props} icon="cog" />}
            onPress={() => router.push('/settings')}
            titleStyle={{ color: colors.text }}
            descriptionStyle={{ color: colors.textSecondary }}
          />
        </List.Section>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    padding: 24,
  },
  name: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  sport: {
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 