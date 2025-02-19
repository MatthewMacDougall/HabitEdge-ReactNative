/**
 * JournalEntry Component
 * 
 * Displays a single journal entry with training details.
 * 
 * Features:
 * - Shows session summary
 * - Displays metrics
 * - Links to related targets
 * - Edit/delete options
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, IconButton, Menu } from 'react-native-paper';
import { format } from 'date-fns';
import { JournalEntry as JournalEntryType, EntryType } from '@/types/journal';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { entryTypeConfigs } from '@/src/config/entryTypes';

interface JournalEntryProps {
  entry: JournalEntryType;
  onEdit: (entry: JournalEntryType) => void;
  onDelete: (id: number) => void;
}

export default function JournalEntry({ entry, onEdit, onDelete }: JournalEntryProps) {
  const [menuVisible, setMenuVisible] = React.useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const entryConfig = entryTypeConfigs[entry.type];

  return (
    <Surface style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            {entry.title || entryConfig.label}
          </Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {format(new Date(entry.date), 'MMM d, yyyy')}
          </Text>
        </View>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={20}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              onEdit(entry);
            }}
            title="Edit"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              onDelete(entry.id);
            }}
            title="Delete"
            titleStyle={{ color: colors.error }}
          />
        </Menu>
      </View>

      {entry.type === EntryType.Game && entry.gameDetails?.score && (
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, { color: colors.text }]}>
            {entry.gameDetails.score.yourTeam} - {entry.gameDetails.score.opponent}
          </Text>
          <Text style={[styles.opponent, { color: colors.textSecondary }]}>
            vs {entry.gameDetails.opponent}
          </Text>
        </View>
      )}

      <View style={styles.metricsContainer}>
        {Object.entries(entry.metrics).map(([key, value]) => (
          <View key={key} style={styles.metric}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {entryConfig.metrics.find(m => m.id === key)?.label || key}
            </Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {value}/10
            </Text>
          </View>
        ))}
      </View>

      {entry.prompts.notes && (
        <Text 
          style={[styles.notes, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {entry.prompts.notes}
        </Text>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
  scoreContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  score: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  opponent: {
    fontSize: 14,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  metric: {
    minWidth: 80,
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  notes: {
    fontSize: 14,
    marginTop: 12,
    lineHeight: 20,
  },
}); 