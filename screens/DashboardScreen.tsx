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
  Surface,
  ProgressBar
} from 'react-native-paper'
import { useRouter } from 'expo-router'
import { LineChart } from 'react-native-chart-kit'
import { Colors } from '@/constants/Colors'
import { getStreakStats } from '@/utils/streakCalculator'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { SharedStyles } from '@/constants/Styles'
import { loadTargets } from '@/utils/storage'
import { Target } from '@/types/targets'
import { useTheme } from '@/contexts/ThemeContext'
import { loadJournalEntries } from '@/utils/journalStorage'
import { JournalEntry } from '@/types/journal'
import { format } from 'date-fns'
import { entryTypeConfigs } from '@/src/config/entryTypes'

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

const getDaysRemaining = (deadline: string): number => {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const calculateProgress = (target: Target): number => {
  if (target.type === 'boolean') {
    return target.completed ? 100 : 0;
  }
  if (!target.target || !target.progress) return 0;
  const total = target.progress.reduce((sum, p) => sum + p.value, 0);
  return Math.min(100, (total / target.target) * 100);
};

export default function DashboardScreen() {
  const router = useRouter()
  const [streak, setStreak] = useState(0)
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([])
  const [priorityTarget, setPriorityTarget] = useState<Target | null>(null)
  const { theme } = useTheme();
  const colors = Colors[theme];

  useEffect(() => {
    // Calculate streak stats when entries change
    const stats = getStreakStats(recentEntries.map(entry => ({
      ...entry,
      timestamp: entry.date // Map date field to expected timestamp field
    })))
    setStreak(stats.currentStreak)
    
    // You can also use other stats:
    // stats.longestStreak
    // stats.totalEntries
    // stats.hasJournaledToday
    // stats.lastEntry
  }, [recentEntries])

  const loadPriorityTarget = async () => {
    const targets = await loadTargets();
    const incompletedTargets = targets.filter(t => !t.completed);
    
    // First check for manually marked priority
    let priority = incompletedTargets.find(t => t.isPriority);
    
    // If no priority marked, get closest deadline
    if (!priority) {
      priority = incompletedTargets.sort((a, b) => 
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      )[0];
    }
    
    setPriorityTarget(priority || null);
  };

  // Add useEffect to reload priority when targets change
  useEffect(() => {
    loadPriorityTarget();
  }, []);

  const loadRecentEntries = async () => {
    try {
      const entries = await loadJournalEntries()
      if (!entries.length) {
        setRecentEntries([])
        return
      }
      
      const sorted = entries.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      // Takes up to 3 entries, works with 1 or 2 entries as well
      setRecentEntries(sorted.slice(0, 3))
    } catch (error) {
      console.error('Error loading recent entries:', error)
      setRecentEntries([])
    }
  }

  useEffect(() => {
    loadRecentEntries()
  }, [])

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [7, 8, 6, 9, 7, 8, 8],
      color: () => colors.primary,
      strokeWidth: 2
    }]
  }

  const getRatingColor = (rating: number) => {
    if (rating <= 5) return Colors.dark.error
    if (rating <= 7) return Colors.dark.secondary
    return Colors.dark.success
  }

  const getMainRating = (entry: JournalEntry) => {
    const config = entryTypeConfigs[entry.type]
    const mainMetricId = config.metrics[0]?.id // Get first metric
    return entry.metrics[mainMetricId] || 0
  }

  return (
    <ScrollView 
      style={[SharedStyles.screenContainer, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        SharedStyles.contentContainer,
        styles.scrollContent
      ]}
    >
      <View style={styles.headerContainer}>
        <Text variant="headlineMedium" style={[styles.headerTitle, { color: colors.text }]}>Dashboard</Text>
        <Button
          mode="contained"
          onPress={() => router.push('/(tabs)/entries')}
          icon="plus"
          style={styles.newEntryButton}
          labelStyle={styles.buttonLabel}
        >
          New Entry
        </Button>
      </View>

      <View style={styles.statsGrid}>
        <Surface style={[styles.statCard, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name="fire" size={32} color={colors.text} style={styles.statIcon} />
          <Text variant="titleMedium" style={styles.statLabel}>Current Streak</Text>
          <Text variant="headlineLarge" style={styles.statValue}>{streak}</Text>
          <Text style={styles.statUnit}>days</Text>
        </Surface>

        <Surface style={[styles.statCard, { backgroundColor: colors.secondary }]}>
          <MaterialCommunityIcons name="calendar-check" size={32} color={colors.text} style={styles.statIcon} />
          <Text variant="titleMedium" style={styles.statLabel}>Weekly Entries</Text>
          <Text variant="headlineLarge" style={styles.statValue}>{recentEntries.length}</Text>
          <Text style={styles.statUnit}>entries</Text>
        </Surface>
      </View>

      {priorityTarget && (
        <Card 
          style={[SharedStyles.card, styles.priorityCard]}
          onPress={() => router.push('/(tabs)/targets')}
        >
          <Card.Content>
            <View style={styles.priorityHeader}>
              <View>
                <Text style={styles.priorityLabel}>Priority Target</Text>
                <Text style={styles.priorityTitle}>{priorityTarget.title}</Text>
              </View>
              <MaterialCommunityIcons 
                name="star" 
                size={24} 
                color={colors.primary} 
              />
            </View>

            <View style={styles.progressContainer}>
              <ProgressBar 
                progress={calculateProgress(priorityTarget) / 100} 
                color={colors.primary}
                style={styles.progressBar}
              />
              <Text style={styles.deadline}>
                {getDaysRemaining(priorityTarget.deadline)} days remaining
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      <Surface style={[SharedStyles.card, styles.recentEntries]}>
        <View style={[styles.cardHeader, styles.cardPadding]}>
          <Text variant="titleMedium" style={styles.cardTitle}>Recent Entries</Text>
          <Button 
            mode="text" 
            onPress={() => router.push('/(tabs)/journal')}
          >
            View All
          </Button>
        </View>

        {recentEntries.length > 0 ? (
          recentEntries.map(entry => {
            const rating = getMainRating(entry)
            const config = entryTypeConfigs[entry.type]
            return (
              <Card 
                key={entry.id} 
                style={styles.entryCard}
                onPress={() => router.push({
                  pathname: '/journal/[id]',
                  params: { id: entry.id.toString() }
                })}
              >
                <Card.Content>
                  <View style={styles.entryHeader}>
                    <View style={styles.entryInfo}>
                      <Text style={styles.entryTitle}>
                        {entry.title || config.label}
                      </Text>
                      <Text style={styles.entryDate}>
                        {format(new Date(entry.date), 'MMM d, yyyy')}
                      </Text>
                    </View>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.performanceLabel}>
                        {config.metrics[0]?.label || 'Rating'}
                      </Text>
                      <Text style={[
                        styles.performanceValue,
                        { color: getRatingColor(rating) }
                      ]}>
                        {rating.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            )
          })
        ) : (
          <Text style={styles.emptyText}>No entries yet</Text>
        )}
      </Surface>

      <Card 
        style={[SharedStyles.card, styles.chartCard]}
        onPress={() => router.push('/screens/insights')}
      >
        <Card.Content style={styles.chartContent}>
          <View style={styles.chartHeader}>
            <Text variant="titleMedium" style={styles.cardTitle}>Performance Trend</Text>
            <IconButton
              icon="chevron-right"
              iconColor={colors.primary}
            />
          </View>
          <View style={styles.chartWrapper}>
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - 64}
              height={220}
              chartConfig={{
                backgroundColor: colors.card,
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(250, 105, 105, ${opacity})`,
                labelColor: () => colors.text,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: colors.primary
                }
              }}
              bezier
              style={styles.chart}
            />
          </View>
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
  chartContent: {
    paddingHorizontal: 0,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  cardTitle: {
    color: Colors.dark.text,
    fontWeight: 'bold',
    fontSize: 18,
  },
  entryCard: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: Colors.dark.card,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryInfo: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  performanceLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginVertical: 16,
  },
  chartWrapper: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  priorityCard: {
    marginBottom: 24,
  },
  priorityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  priorityLabel: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  priorityTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  deadline: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentEntries: {
    marginBottom: 24,
  },
  cardPadding: {
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
}) 