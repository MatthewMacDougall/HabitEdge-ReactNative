import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, TextInput } from 'react-native-paper'
import { Colors } from '@/constants/Colors'
import { Prompt } from '@/src/config/entryTypes'
import { useColorScheme } from '@/hooks/useColorScheme'

interface PromptsSectionProps {
  prompts: Prompt[]
  values: Record<string, string>
  onChange: (id: string, value: string) => void
}

export function PromptsSection({ prompts, values, onChange }: PromptsSectionProps) {
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme]

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Session Details
      </Text>
      {prompts.map(prompt => (
        <View key={prompt.id} style={styles.promptContainer}>
          <TextInput
            label={prompt.label}
            value={values[prompt.id] || ''}
            onChangeText={(value) => onChange(prompt.id, value)}
            multiline={prompt.multiline}
            numberOfLines={prompt.multiline ? 4 : 1}
            style={[
              styles.input,
              prompt.multiline && styles.multilineInput
            ]}
            mode="outlined"
          />
          {prompt.required && (
            <Text style={styles.required}>*Required</Text>
          )}
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
  promptContainer: {
    marginBottom: 12
  },
  input: {
    marginBottom: 4
  },
  multilineInput: {
    height: 100
  },
  required: {
    fontSize: 12,
    color: Colors.dark.error,
    marginLeft: 4
  }
}) 