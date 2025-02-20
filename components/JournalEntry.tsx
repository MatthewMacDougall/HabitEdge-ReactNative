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

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, Menu } from 'react-native-paper';
import { format } from 'date-fns';
import { JournalEntry as JournalEntryType } from '@/types/journal';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { entryTypeConfigs } from '@/src/config/entryTypes';

interface Props {
  entry: JournalEntryType;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

export default function JournalEntry({ entry, onEdit, onDelete, onView }: Props) {
  const [menuVisible, setMenuVisible] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const config = entryTypeConfigs[entry.type];

  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case 'game': return Colors.dark.primary;
      case 'practice': return Colors.dark.secondary;
      case 'workout': return '#4CAF50';
      case 'film': return '#2196F3';
      default: return Colors.dark.text;
    }
  };

  return (
    <Card style={[styles.card, { backgroundColor: colors.card }]}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {format(new Date(entry.date), 'MMM d, yyyy')}
            </Text>
            <Text style={[styles.type, { color: getEntryTypeColor(entry.type) }]}>
              {config.label}
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
                onEdit();
              }}
              title="Edit"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                onDelete();
              }}
              title="Delete"
              titleStyle={{ color: colors.error }}
            />
            <Menu.Item 
              onPress={() => {
                setMenuVisible(false)
                onView()
              }} 
              title="View Entry" 
              leadingIcon="eye"
            />
          </Menu>
        </View>

        {entry.title && (
          <Text style={[styles.title, { color: colors.text }]}>
            {entry.title}
          </Text>
        )}

        {entry.type === 'game' && entry.gameDetails?.score && (
          <View style={styles.scoreContainer}>
            <Text style={[styles.score, { color: colors.text }]}>
              {entry.gameDetails.score.yourTeam} - {entry.gameDetails.score.opponent}
            </Text>
            <Text style={[styles.opponent, { color: colors.textSecondary }]}>
              vs {entry.gameDetails.opponent}
            </Text>
          </View>
        )}

        {Object.keys(entry.metrics).length > 0 && (
          <View style={styles.metricsContainer}>
            {Object.entries(entry.metrics).map(([key, value], index, array) => (
              <View 
                key={key} 
                style={[
                  styles.metric,
                  index % 2 === 0 && index !== array.length - 1 && styles.metricRightMargin
                ]}
              >
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  {config.metrics.find(m => m.id === key)?.label || key}
                </Text>
                <Text style={[styles.metricValue, { color: colors.text }]}>
                  {value.toFixed(1)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {entry.prompts.notes && (
          <Text 
            style={[styles.notes, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {entry.prompts.notes}
          </Text>
        )}

        {entry.type === 'film' && entry.filmDetails && (
          <Text style={styles.filmType}>
            Film Type: {
              entryTypeConfigs[entry.type].filmDetails?.options.find(
                opt => opt.value === entry.filmDetails?.filmType
              )?.label
            }
          </Text>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 16,
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
  date: {
    fontSize: 14,
  },
  type: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 8,
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
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metric: {
    width: '48%',
    marginBottom: 12,
    padding: 8,
    backgroundColor: Colors.dark.input,
    borderRadius: 8,
  },
  metricRightMargin: {
    marginRight: '4%',
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 4,
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
  filmType: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
}); 