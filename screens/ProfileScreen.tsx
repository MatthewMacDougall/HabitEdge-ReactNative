import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, List, Avatar, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { SharedStyles } from '@/constants/Styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRegistration } from '@/types/onboarding';
import { getSportById } from '@/config/sports';

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = Colors[theme];
  const [userData, setUserData] = useState<UserRegistration | null>(null);
  const [stats, setStats] = useState({
    journalCount: 0,
    activeTargets: 0,
    completedTargets: 0,
    recentPerformance: 0
  });

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      const userJson = await AsyncStorage.getItem('userRegistration');
      if (userJson) {
        setUserData(JSON.parse(userJson));
      }
    };
    loadUserData();
  }, []);

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      const journalJson = await AsyncStorage.getItem('journal_entries');
      const journalEntries = journalJson ? JSON.parse(journalJson) : [];
      
      const targetsJson = await AsyncStorage.getItem('targets');
      const targets = targetsJson ? JSON.parse(targetsJson) : [];
      
      const activeTargets = targets.filter((t: any) => !t.completed);
      const completedTargets = targets.filter((t: any) => t.completed);

      // Calculate average performance rating from last 5 entries
      const recentEntries = journalEntries
        .slice(0, 5)
        .map((entry: any) => entry.metrics?.overallRating || 0);
      const recentPerformance = recentEntries.length 
        ? recentEntries.reduce((a: number, b: number) => a + b, 0) / recentEntries.length
        : 0;

      setStats({
        journalCount: journalEntries.length,
        activeTargets: activeTargets.length,
        completedTargets: completedTargets.length,
        recentPerformance: Math.round(recentPerformance * 10) / 10
      });
    };
    loadStats();
  }, []);

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sport = userData?.sport ? getSportById(userData.sport) : null;

  return (
    <ScrollView 
      style={[SharedStyles.screenContainer, { backgroundColor: colors.background }]}
      contentContainerStyle={SharedStyles.contentContainer}
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={userData ? getInitials(userData.name) : '??'}
          style={{ backgroundColor: colors.primary }}
        />
        <Text 
          variant="headlineMedium" 
          style={[styles.name, { color: colors.text }]}
        >
          {userData?.name || 'Loading...'}
        </Text>
        <Text 
          variant="bodyLarge" 
          style={[styles.sport, { color: colors.textSecondary }]}
        >
          {sport?.name || 'Sport not set'}
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <Surface 
          style={[styles.statCard, { backgroundColor: colors.card }]}
          onTouchEnd={() => router.push('/(tabs)/journal')}
        >
          <Text style={[styles.statValue, { color: colors.text }]}>
            {stats.journalCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Journal Entries
          </Text>
          <Text style={[styles.statSubtext, { color: colors.textSecondary }]}>
            Avg. Rating: {stats.recentPerformance}
          </Text>
        </Surface>

        <Surface 
          style={[styles.statCard, { backgroundColor: colors.card }]}
          onTouchEnd={() => router.push('/(tabs)/targets')}
        >
          <Text style={[styles.statValue, { color: colors.text }]}>
            {stats.activeTargets}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Active Targets
          </Text>
          <Text style={[styles.statSubtext, { color: colors.textSecondary }]}>
            {stats.completedTargets} completed
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
  statSubtext: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
}); 