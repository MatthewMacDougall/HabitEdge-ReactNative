import React, { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions
} from 'react-native'
import {
  Text,
  Card,
  Button,
  IconButton
} from 'react-native-paper'
import { useRouter } from 'expo-router'
import { LineChart } from 'react-native-chart-kit'
import { Colors } from '../constants/Colors'
import { getStreakStats } from '../utils/streakCalculator'
import { MaterialCommunityIcons } from '@expo/vector-icons'

// Mock data - replace with actual API calls
const mockJournalEntries = [
  {
    id: 1,
    type: 'game',
    title: 'Game vs. Rivals',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    metrics: { performance: 8, energy: 7, teamwork: 9 }
  },
  // ... other entries
]

export default function DashboardScreen() {
  const router = useRouter()
  const [streak, setStreak] = useState(0)
  const [recentEntries, setRecentEntries] = useState(mockJournalEntries)

  useEffect(() => {
    // Calculate streak stats when entries change
    const stats = getStreakStats(recentEntries)
    setStreak(stats.currentStreak)
    
    // You can also use other stats:
    // stats.longestStreak
    // stats.totalEntries
    // stats.hasJournaledToday
    // stats.lastEntry
  }, [recentEntries])

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [7, 8, 6, 9, 7, 8, 8],
      color: () => Colors.light.primary
    }]
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Dashboard</Text>
        <Button
          mode="contained"
          onPress={() => router.push('/(tabs)/journal')}
          icon="plus"
        >
          New Entry
        </Button>
      </View>

      <View style={styles.statsContainer}>
        <Card style={[styles.statCard, { backgroundColor: Colors.light.primary }]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.statLabel}>Current Streak</Text>
            <Text variant="headlineLarge" style={styles.statValue}>{streak} days</Text>
            <MaterialCommunityIcons name="fire" size={24} color={Colors.light.background} />
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: Colors.light.secondary }]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.statLabel}>Weekly Entries</Text>
            <Text variant="headlineLarge" style={styles.statValue}>{recentEntries.length}</Text>
            <MaterialCommunityIcons name="calendar-check" size={24} color={Colors.light.background} />
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.chartCard}>
        <Card.Title title="Performance Trend" />
        <Card.Content>
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 48}
            height={220}
            chartConfig={{
              backgroundColor: Colors.light.card,
              backgroundGradientFrom: Colors.light.card,
              backgroundGradientTo: Colors.light.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 40, 40, ${opacity})`,
              style: {
                borderRadius: 16
              }
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      <Card style={styles.entriesCard}>
        <Card.Title 
          title="Recent Entries"
          right={(props) => (
            <IconButton
              {...props}
              icon="chevron-right"
              onPress={() => router.push('/(tabs)/entries')}
            />
          )}
        />
        <Card.Content>
          {recentEntries.map(entry => (
            <View key={entry.id} style={styles.entryItem}>
              <View>
                <Text variant="titleMedium">{entry.title}</Text>
                <Text variant="bodySmall" style={styles.entryDate}>
                  {new Date(entry.timestamp).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.metrics}>
                {Object.entries(entry.metrics).map(([key, value]) => (
                  <Text key={key} variant="bodySmall" style={styles.metric}>
                    {key}: {value}/10
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  statCard: {
    flex: 1,
    borderRadius: 12
  },
  statLabel: {
    color: Colors.light.background,
    opacity: 0.9
  },
  statValue: {
    color: Colors.light.background,
    marginVertical: 4
  },
  chartCard: {
    marginBottom: 16,
    borderRadius: 12
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  entriesCard: {
    marginBottom: 16,
    borderRadius: 12
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border
  },
  entryDate: {
    color: Colors.light.textSecondary
  },
  metrics: {
    alignItems: 'flex-end'
  },
  metric: {
    color: Colors.light.textSecondary
  }
}) 