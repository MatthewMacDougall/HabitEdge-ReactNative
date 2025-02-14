import React, { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform
} from 'react-native'
import {
  Text,
  Card,
  Button,
  IconButton,
  Surface
} from 'react-native-paper'
import { useRouter } from 'expo-router'
import { LineChart } from 'react-native-chart-kit'
import { Colors } from '@/constants/Colors'
import { getStreakStats } from '@/utils/streakCalculator'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { SharedStyles } from '@/constants/Styles'

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
      color: () => Colors.dark.primary,
      strokeWidth: 2
    }]
  }

  return (
    <ScrollView 
      style={SharedStyles.screenContainer}
      contentContainerStyle={SharedStyles.contentContainer}
    >
      <View style={styles.headerContainer}>
        <Text variant="headlineMedium" style={styles.headerTitle}>Dashboard</Text>
        <Button
          mode="contained"
          onPress={() => router.push('/(tabs)/journal')}
          icon="plus"
          style={styles.newEntryButton}
          labelStyle={styles.buttonLabel}
        >
          New Entry
        </Button>
      </View>

      <View style={styles.statsGrid}>
        <Surface style={[styles.statCard, { backgroundColor: Colors.dark.primary }]}>
          <MaterialCommunityIcons name="fire" size={32} color={Colors.dark.text} style={styles.statIcon} />
          <Text variant="titleMedium" style={styles.statLabel}>Current Streak</Text>
          <Text variant="headlineLarge" style={styles.statValue}>{streak}</Text>
          <Text style={styles.statUnit}>days</Text>
        </Surface>

        <Surface style={[styles.statCard, { backgroundColor: Colors.dark.secondary }]}>
          <MaterialCommunityIcons name="calendar-check" size={32} color={Colors.dark.text} style={styles.statIcon} />
          <Text variant="titleMedium" style={styles.statLabel}>Weekly Entries</Text>
          <Text variant="headlineLarge" style={styles.statValue}>{recentEntries.length}</Text>
          <Text style={styles.statUnit}>entries</Text>
        </Surface>
      </View>

      <Card style={[SharedStyles.card, styles.chartCard]}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.chartTitle}>Performance Trend</Text>
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 48}
            height={220}
            chartConfig={{
              backgroundColor: Colors.dark.card,
              backgroundGradientFrom: Colors.dark.card,
              backgroundGradientTo: Colors.dark.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
              labelColor: () => Colors.dark.text,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: Colors.dark.primary
              }
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      <Card style={SharedStyles.card}>
        <Card.Title 
          title="Recent Entries"
          titleStyle={styles.cardTitle}
          right={(props) => (
            <IconButton
              {...props}
              icon="chevron-right"
              iconColor={Colors.dark.primary}
              onPress={() => router.push('/entries')}
            />
          )}
        />
        <Card.Content>
          {recentEntries.map(entry => (
            <Surface key={entry.id} style={styles.entryItem}>
              <View>
                <Text variant="titleMedium" style={styles.entryTitle}>{entry.title}</Text>
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
            </Surface>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    color: Colors.dark.text,
    fontWeight: 'bold',
  },
  newEntryButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
  },
  buttonLabel: {
    color: Colors.dark.text,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  statIcon: {
    marginBottom: 8,
  },
  statLabel: {
    color: Colors.dark.text,
    opacity: 0.9,
    textAlign: 'center',
  },
  statValue: {
    color: Colors.dark.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statUnit: {
    color: Colors.dark.text,
    opacity: 0.8,
    fontSize: 12,
  },
  chartCard: {
    marginBottom: 24,
  },
  chartTitle: {
    color: Colors.dark.text,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  cardTitle: {
    color: Colors.dark.text,
    fontWeight: 'bold',
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: Colors.dark.input,
  },
  entryTitle: {
    color: Colors.dark.text,
    fontWeight: '500',
  },
  entryDate: {
    color: Colors.dark.textSecondary,
  },
  metrics: {
    alignItems: 'flex-end',
  },
  metric: {
    color: Colors.dark.textSecondary,
  },
}) 