import React, { useState, useCallback } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl
} from 'react-native'
import {
  Text,
  Card,
  Chip,
  SegmentedButtons,
  ActivityIndicator
} from 'react-native-paper'
import { LineChart } from 'react-native-chart-kit'
import { Colors } from '../constants/Colors'
import { useFocusEffect } from '@react-navigation/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { InsightCard, SportMetric } from '../types/insights'
import { format, subDays } from 'date-fns'

export default function InsightsScreen() {
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
        return Colors.light.primary
      case 'warning':
        return Colors.light.error
      case 'achievement':
        return Colors.light.secondary
      default:
        return Colors.light.text
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    )
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <Text variant="headlineMedium" style={styles.title}>Insights</Text>

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

      {metrics.map(metric => (
        <Card key={metric.id} style={styles.metricCard}>
          <Card.Title
            title={metric.label}
            right={() => (
              <Chip 
                icon={metric.change >= 0 ? 'trending-up' : 'trending-down'}
                style={[
                  styles.changeChip,
                  { 
                    backgroundColor: metric.change >= 0 
                      ? Colors.light.primary 
                      : Colors.light.error 
                  }
                ]}
              >
                {metric.change >= 0 ? '+' : ''}{metric.change}%
              </Chip>
            )}
          />
          <Card.Content>
            <LineChart
              data={{
                labels: metric.trend.map(t => format(new Date(t.date), 'MMM d')),
                datasets: [{
                  data: metric.trend.map(t => t.value)
                }]
              }}
              width={Dimensions.get('window').width - 48}
              height={220}
              chartConfig={{
                backgroundColor: Colors.light.card,
                backgroundGradientFrom: Colors.light.card,
                backgroundGradientTo: Colors.light.card,
                decimalPlaces: 1,
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
      ))}

      <Text variant="titleLarge" style={styles.sectionTitle}>Recent Insights</Text>

      {insights.map(insight => (
        <Card key={insight.id} style={styles.insightCard}>
          <Card.Title
            title={insight.title}
            left={props => (
              <MaterialCommunityIcons
                {...props}
                name={getInsightIcon(insight.type)}
                size={24}
                color={getInsightColor(insight.type)}
              />
            )}
          />
          <Card.Content>
            <Text variant="bodyMedium">{insight.description}</Text>
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
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    marginBottom: 16
  },
  timeRange: {
    marginBottom: 16
  },
  metricCard: {
    marginBottom: 16,
    borderRadius: 12
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  changeChip: {
    marginRight: 16
  },
  sectionTitle: {
    marginVertical: 16
  },
  insightCard: {
    marginBottom: 12,
    borderRadius: 12
  },
  insightMetric: {
    marginTop: 12,
    alignItems: 'center'
  },
  metricLabel: {
    color: Colors.light.textSecondary
  },
  metricValue: {
    color: Colors.light.primary,
    marginTop: 4
  }
}) 