export interface MetricTrend {
  date: string
  value: number
}

export interface SportMetric {
  id: string
  label: string
  value: number
  trend: MetricTrend[]
  change: number // percentage change
}

export interface InsightCard {
  id: string
  title: string
  description: string
  type: 'improvement' | 'warning' | 'achievement'
  metric?: SportMetric
  createdAt: string
} 