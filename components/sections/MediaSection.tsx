import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Button, IconButton } from 'react-native-paper'
import { Colors } from '@/constants/Colors'
import { MediaConfig } from '@/src/config/entryTypes'
import { useColorScheme } from '@/hooks/useColorScheme'

interface MediaSectionProps {
  config: MediaConfig[]
  media: Record<string, Array<{ type: string; name?: string; title?: string; url: string }>>
  onUpload: (id: string, media: { type: string; url: string; name?: string }) => void
  onDelete: (id: string, index: number) => void
  onAddLink: (id: string) => void
}

export function MediaSection({ 
  config, 
  media, 
  onUpload, 
  onDelete, 
  onAddLink 
}: MediaSectionProps) {
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme]

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Media & Attachments
      </Text>
      {config.map(mediaConfig => (
        <View key={mediaConfig.id} style={styles.mediaContainer}>
          <Text style={[styles.mediaLabel, { color: colors.text }]}>
            {mediaConfig.label}
          </Text>
          <View style={styles.mediaButtons}>
            <Button
              mode="outlined"
              icon="upload"
              onPress={() => onUpload(mediaConfig.id, { type: '', url: '' })}
              style={styles.button}
            >
              Upload
            </Button>
            <Button
              mode="outlined"
              icon="link"
              onPress={() => onAddLink(mediaConfig.id)}
              style={styles.button}
            >
              Add Link
            </Button>
          </View>
          {media[mediaConfig.id]?.map((item, index) => (
            <View key={index} style={styles.mediaItem}>
              <Text 
                style={[styles.mediaName, { color: colors.text }]}
                numberOfLines={1}
              >
                {item.title || item.name || item.url}
              </Text>
              <IconButton
                icon="close"
                size={20}
                onPress={() => onDelete(mediaConfig.id, index)}
              />
            </View>
          ))}
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
  mediaContainer: {
    marginBottom: 16
  },
  mediaLabel: {
    fontSize: 16,
    marginBottom: 8
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8
  },
  button: {
    flex: 1
  },
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.input,
    borderRadius: 8,
    marginBottom: 8,
    paddingLeft: 12
  },
  mediaName: {
    flex: 1,
    fontSize: 14
  }
}) 