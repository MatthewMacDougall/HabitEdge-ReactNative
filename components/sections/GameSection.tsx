import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, TextInput } from 'react-native-paper'
import { Colors } from '@/constants/Colors'
import { GameDetails, GameScore } from '@/types/journal'
import { useColorScheme } from '@/hooks/useColorScheme'

interface GameSectionProps {
  gameDetails?: GameDetails
  onChange: (field: keyof GameDetails, value: string) => void
}

export function GameSection({ gameDetails, onChange }: GameSectionProps) {
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme]
  const handleScoreChange = (team: keyof GameScore, value: string) => {
    onChange('score', JSON.stringify({
      ...gameDetails?.score,
      [team]: value
    }))
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Game Details
      </Text>

      <TextInput
        label="Opponent"
        value={gameDetails?.opponent || ''}
        onChangeText={(value) => onChange('opponent', value)}
        style={styles.input}
        mode="outlined"
      />

      <View style={styles.scoreContainer}>
        <View style={styles.scoreInput}>
          <TextInput
            label="Your Score"
            value={gameDetails?.score?.yourTeam || ''}
            onChangeText={(value) => handleScoreChange('yourTeam', value)}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
          />
        </View>
        <Text style={[styles.vs, { color: colors.textSecondary }]}>vs</Text>
        <View style={styles.scoreInput}>
          <TextInput
            label="Their Score"
            value={gameDetails?.score?.opponent || ''}
            onChangeText={(value) => handleScoreChange('opponent', value)}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
          />
        </View>
      </View>
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
  input: {
    marginBottom: 12
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  scoreInput: {
    flex: 1
  },
  vs: {
    fontSize: 16,
    marginTop: -12
  }
}) 