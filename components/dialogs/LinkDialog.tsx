import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import { Dialog, Portal, TextInput, Button, Text } from 'react-native-paper'
import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'

interface LinkDialogProps {
  visible: boolean
  onDismiss: () => void
  onSubmit: (link: { type: 'link'; url: string; title: string }) => void
}

export function LinkDialog({ visible, onDismiss, onSubmit }: LinkDialogProps) {
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme]
  
  const [linkInput, setLinkInput] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [linkError, setLinkError] = useState('')

  const validateUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = () => {
    if (!linkInput) {
      setLinkError('Please enter a URL')
      return
    }
    
    if (!validateUrl(linkInput)) {
      setLinkError('Please enter a valid URL')
      return
    }

    onSubmit({
      type: 'link',
      url: linkInput,
      title: linkTitle || linkInput
    })

    // Reset form
    setLinkInput('')
    setLinkTitle('')
    setLinkError('')
  }

  return (
    <Portal>
      <Dialog 
        visible={visible} 
        onDismiss={onDismiss}
        style={[styles.dialog, { backgroundColor: colors.card }]}
      >
        <Dialog.Title style={{ color: colors.text }}>
          Add Link
        </Dialog.Title>
        
        <Dialog.Content>
          <TextInput
            label="URL"
            value={linkInput}
            onChangeText={text => {
              setLinkInput(text)
              setLinkError('')
            }}
            mode="outlined"
            error={!!linkError}
            style={styles.input}
          />
          {linkError && (
            <Text style={[styles.error, { color: colors.error }]}>
              {linkError}
            </Text>
          )}
          
          <TextInput
            label="Title (Optional)"
            value={linkTitle}
            onChangeText={setLinkTitle}
            mode="outlined"
            style={styles.input}
          />
        </Dialog.Content>
        
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button onPress={handleSubmit}>Add</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 12,
    maxWidth: 500,
    alignSelf: 'center',
    width: '90%'
  },
  input: {
    marginBottom: 12
  },
  error: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 4
  }
}) 