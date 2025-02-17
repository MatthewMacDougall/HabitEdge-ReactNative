import React, { useState, useCallback } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Platform
} from 'react-native'
import {
  Text,
  Card,
  Chip,
  SegmentedButtons,
  ActivityIndicator,
  Surface
} from 'react-native-paper'
import { LineChart } from 'react-native-chart-kit'
import { Colors } from '@/constants/Colors'
import { useFocusEffect } from '@react-navigation/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { InsightCard, SportMetric } from '@/types/insights'
import { format, subDays } from 'date-fns'
import { SharedStyles } from '@/constants/Styles'
import { useTheme } from '@/contexts/ThemeContext'

export default function InsightsScreen() {
  const { theme } = useTheme()
  const colors = Colors[theme]
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')
  const [insights, setInsights] = useState<InsightCard[]>([])
  const [metrics, setMetrics] = useState<SportMetric[]>([])

  const loadInsights = async () => {
    // This will be replaced with actual API call
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      const mockMetrics: SportMetric[] = [
        {
          id: 'performance',
          label: 'Overall Performance',
          value: 8.5,
          change: 15,
          trend: Array.from({ length: 7 }, (_, i) => ({
            date: subDays(new Date(), i).toISOString(),
            value: 7 + Math.random() * 3
          })).reverse()
        },
        // Add more metrics...
      ]
      
      const mockInsights: InsightCard[] = [
        {
          id: '1',
          title: 'Performance Improvement',
          description: 'Your performance has improved by 15% this week',
          type: 'improvement',
          metric: mockMetrics[0],
          createdAt: new Date().toISOString()
        },
        // Add more insights...
      ]

      setMetrics(mockMetrics)
      setInsights(mockInsights)
    } catch (error) {
      console.error('Error loading insights:', error)
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadInsights()
    }, [])
  )

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadInsights()
    setRefreshing(false)
  }, [])

  const getInsightIcon = (type: InsightCard['type']) => {
    switch (type) {
      case 'improvement':
        return 'trending-up'
      case 'warning':
        return 'alert'
      case 'achievement':
        return 'trophy'
      default:
        return 'information'
    }
  }

  const getInsightColor = (type: InsightCard['type']) => {
    switch (type) {
      case 'improvement':
        return Colors.dark.primary
      case 'warning':
        return Colors.dark.error
      case 'achievement':
        return Colors.dark.secondary
      default:
        return Colors.dark.text
    }
  }

  if (loading) {
    return (
      <View style={[SharedStyles.screenContainer, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    )
  }

  return (
    <ScrollView 
      style={[SharedStyles.screenContainer, { backgroundColor: colors.background }]}
      contentContainerStyle={SharedStyles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.dark.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text 
          variant="headlineMedium" 
          style={[styles.headerTitle, { color: colors.text }]}
        >
          Insights
        </Text>
      </View>

      <SegmentedButtons
        value={timeRange}
        onValueChange={value => setTimeRange(value as typeof timeRange)}
        buttons={[
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
          { value: 'year', label: 'Year' }
        ]}
        style={styles.timeRange}
      />

      {/* Performance Overview Card */}
      <Card style={[SharedStyles.card, styles.overviewCard, { backgroundColor: colors.card }]}>
        <Card.Content>
          <Text 
            variant="titleLarge" 
            style={[styles.cardTitle, { color: colors.text }]}
          >
            Performance Overview
          </Text>
          <LineChart
            data={{
              labels: metrics.map(m => format(new Date(m.trend[0].date), 'MMM d')),
              datasets: [{
                data: metrics.map(m => m.trend[0].value),
                strokeWidth: 2
              }]
            }}
            width={Dimensions.get('window').width - 48}
            height={220}
            chartConfig={{
              backgroundColor: colors.card,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
              labelColor: () => colors.text,
              style: { borderRadius: 16 },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: colors.primary
              }
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Surface style={[styles.statCard, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons 
            name="trending-up" 
            size={32} 
            color={colors.text} 
          />
          <Text style={[styles.statLabel, { color: colors.text }]}>
            Avg Performance
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {metrics.length > 0 ? metrics[0].value.toFixed(1) : 'N/A'}
          </Text>
        </Surface>

        <Surface style={[styles.statCard, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons 
            name="calendar-check" 
            size={32} 
            color={colors.text} 
          />
          <Text style={[styles.statLabel, { color: colors.text }]}>
            Total Entries
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {metrics.length}
          </Text>
        </Surface>
      </View>

      <Text variant="titleLarge" style={styles.sectionTitle}>Recent Insights</Text>

      {insights.map(insight => (
        <Surface key={insight.id} style={[styles.insightCard, { backgroundColor: colors.card }]}>
          <View style={styles.insightHeader}>
            <MaterialCommunityIcons
              name={getInsightIcon(insight.type)}
              size={24}
              color={getInsightColor(insight.type)}
            />
            <Text variant="titleMedium" style={styles.insightTitle}>
              {insight.title}
            </Text>
          </View>
          <Text variant="bodyMedium" style={styles.insightDescription}>
            {insight.description}
          </Text>
          {insight.metric && (
            <View style={styles.insightMetric}>
              <Text variant="labelMedium" style={styles.metricLabel}>
                {insight.metric.label}
              </Text>
              <Text variant="headlineMedium" style={styles.metricValue}>
                {insight.metric.value}
              </Text>
            </View>
          )}
        </Surface>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    padding: 16,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  timeRange: {
    marginBottom: 16
  },
  overviewCard: {
    marginBottom: 24,
  },
  cardTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    marginVertical: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontWeight: 'bold',
    marginVertical: 16
  },
  insightCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: Colors.dark.card,
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
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8
  },
  insightTitle: {
    color: Colors.dark.text,
    fontWeight: '600',
    flex: 1
  },
  insightDescription: {
    color: Colors.dark.textSecondary,
    marginBottom: 12
  },
  insightMetric: {
    alignItems: 'center',
    backgroundColor: Colors.dark.input,
    padding: 12,
    borderRadius: 8
  },
  metricLabel: {
    color: Colors.dark.textSecondary,
    marginBottom: 4
  },
  metricValue: {
    color: Colors.dark.primary,
    fontWeight: 'bold'
  }
}) 