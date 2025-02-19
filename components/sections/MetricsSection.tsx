import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import Slider from '@react-native-community/slider'
import { Colors } from '@/constants/Colors'
import { Metric } from '@/src/config/entryTypes'
import { useColorScheme } from '@/hooks/useColorScheme'

interface MetricsSectionProps {
  metrics: Metric[]
  values: Record<string, number>
  onChange: (id: string, value: number) => void
}

export function MetricsSection({ metrics, values, onChange }: MetricsSectionProps) {
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme]

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Rate Your Performance
      </Text>
      {metrics.map(metric => (
        <View key={metric.id} style={styles.metricContainer}>
          <View style={styles.metricHeader}>
            <Text style={[styles.label, { color: colors.text }]}>
              {metric.label}
            </Text>
            <Text style={[styles.value, { color: colors.textSecondary }]}>
              {(values[metric.id] || metric.defaultValue || 5).toFixed(1)}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={metric.min || 0}
            maximumValue={metric.max || 10}
            step={0.1}
            value={values[metric.id] || metric.defaultValue || 5}
            onValueChange={(value) => onChange(metric.id, value)}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
          />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16
  },
  metricContainer: {
    marginBottom: 16
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  label: {
    fontSize: 16
  },
  value: {
    fontSize: 14
  },
  slider: {
    width: '100%',
    height: 40
  }
}) 