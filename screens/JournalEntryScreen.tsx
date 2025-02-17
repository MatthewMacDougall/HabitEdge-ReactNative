import React, { useState } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActionSheetIOS
} from 'react-native'
import {
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  Card,
  Divider,
  IconButton,
  Dialog,
  Portal
} from 'react-native-paper'
import { Picker } from '@react-native-picker/picker'
import Slider from '@react-native-community/slider'
import { EntryType, entryTypeConfigs, GameDetails } from '@/src/config/entryTypes'
import { Colors } from '@/constants/Colors'
import Toast from 'react-native-toast-message'
import { SharedStyles } from '@/constants/Styles'
import { useTheme } from '@/contexts/ThemeContext'
import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'

interface GameScore {
  yourTeam: string;
  opponent: string;
}

interface MediaItem {
  type: 'upload' | 'link';
  url: string;
  name?: string;
  title?: string;
}

interface FormData {
  type: EntryType | '';
  metrics: Record<string, number>;
  prompts: Record<string, string>;
  gameDetails?: GameDetails & {
    score?: GameScore;
  };
  media: Record<string, Array<MediaItem>>;
}

export default function JournalEntryScreen() {
  const [title, setTitle] = useState('');
  const [formData, setFormData] = useState<FormData>({
    type: '',
    metrics: {},
    prompts: {},
    media: {}
  })

  const { theme } = useTheme();
  const colors = Colors[theme];

  const [linkDialogVisible, setLinkDialogVisible] = useState(false);
  const [activeMediaId, setActiveMediaId] = useState<string>('');
  const [linkInput, setLinkInput] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkError, setLinkError] = useState('');

  const handleMetricChange = (metricId: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      metrics: { 
        ...prev.metrics, 
        [metricId]: parseFloat(value.toFixed(1))
      }
    }))
  }

  const handlePromptChange = (promptId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      prompts: { ...prev.prompts, [promptId]: value }
    }))
  }

  const handleGameDetailsChange = (field: keyof GameDetails, value: string) => {
    setFormData(prev => ({
      ...prev,
      gameDetails: {
        ...prev.gameDetails,
        [field]: value
      }
    }))
  }

  const determineResult = (yourScore: string, opponentScore: string): 'win' | 'loss' | 'draw' | undefined => {
    const yourNum = parseInt(yourScore);
    const oppNum = parseInt(opponentScore);
    
    if (isNaN(yourNum) || isNaN(oppNum)) return undefined;
    
    if (yourNum > oppNum) return 'win';
    if (yourNum < oppNum) return 'loss';
    return 'draw';
  };
  const handleScoreChange = (team: 'yourTeam' | 'opponent', value: string) => {
    setFormData((prev: FormData) => {
      const currentScore: GameScore = prev.gameDetails?.score ?? { yourTeam: '', opponent: '' };
      const newScore: GameScore = {
        ...currentScore,
        [team]: value
      };
      
      // Automatically determine the result based on scores
      const result = determineResult(newScore.yourTeam, newScore.opponent);
      
      return {
        ...prev,
        gameDetails: {
          ...prev.gameDetails,
          score: newScore,
          result
        }
      };
    });
  };

  const handleSubmit = async () => {
    if (!formData.type) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select an entry type'
      })
      return
    }

    const config = entryTypeConfigs[formData.type]
    
    // Validate required metrics
    const missingMetrics = config.metrics.filter(
      m => formData.metrics[m.id] === undefined
    )
    if (missingMetrics.length > 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Please rate all metrics`
      })
      return
    }

    // Validate required prompts
    const requiredPrompts = config.prompts.filter(p => p.required)
    const missingPrompts = requiredPrompts.filter(p => !formData.prompts[p.id])
    if (missingPrompts.length > 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Please fill in: ${missingPrompts.map(p => p.label).join(', ')}`
      })
      return
    }

    if (formData.type === 'game') {
      if (!formData.gameDetails?.opponent) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Please enter the opponent name'
        })
        return
      }
      if (!formData.gameDetails?.result) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Please select the game result'
        })
        return
      }
    }

    try {
      // Here you would send the data to your backend
      console.log('Submitting entry:', {
        ...formData,
        timestamp: new Date().toISOString()
      })
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Journal entry saved successfully!'
      })
      
      // Reset form
      setFormData({
        type: '',
        metrics: {},
        prompts: {},
        media: {}
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save journal entry'
      })
      console.error(error)
    }
  }

  const handlePhotoUpload = async (mediaId: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (result.canceled) return;

      const newMedia = result.assets.map(asset => ({
        type: 'upload' as const,
        url: asset.uri,
        name: asset.uri.split('/').pop() || 'media'
      }));

      setFormData(prev => ({
        ...prev,
        media: {
          ...prev.media,
          [mediaId]: [...(prev.media[mediaId] || []), ...newMedia]
        }
      }));
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to upload photos'
      });
    }
  };

  const handleFileUpload = async (mediaId: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'video/*', 'application/pdf'],
        multiple: true,
        copyToCacheDirectory: true
      });

      if (result.canceled) return;

      const newMedia = result.assets.map(asset => ({
        type: 'upload' as const,
        url: asset.uri,
        name: asset.name
      }));

      setFormData(prev => ({
        ...prev,
        media: {
          ...prev.media,
          [mediaId]: [...(prev.media[mediaId] || []), ...newMedia]
        }
      }));
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to upload files'
      });
    }
  };

  const handleMediaUpload = async (mediaId: string) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Choose from Photos', 'Browse Files'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await handlePhotoUpload(mediaId);
          } else if (buttonIndex === 2) {
            await handleFileUpload(mediaId);
          }
        }
      );
    } else {
      // For Android, show a simple alert dialog
      Alert.alert(
        'Choose Upload Method',
        'Select where to upload from',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Photos', onPress: () => handlePhotoUpload(mediaId) },
          { text: 'Files', onPress: () => handleFileUpload(mediaId) },
        ]
      );
    }
  };

  const handleAddLink = (mediaId: string) => {
    setActiveMediaId(mediaId);
    setLinkInput('');
    setLinkTitle('');
    setLinkError('');
    setLinkDialogVisible(true);
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleLinkSubmit = () => {
    if (!linkInput) return;
    
    if (!validateUrl(linkInput)) {
      setLinkError('Please enter a valid URL');
      return;
    }

    setFormData(prev => ({
      ...prev,
      media: {
        ...prev.media,
        [activeMediaId]: [...(prev.media[activeMediaId] || []), {
          type: 'link',
          url: linkInput,
          title: linkTitle || linkInput,
        }]
      }
    }));

    setLinkDialogVisible(false);
    setLinkInput('');
    setLinkTitle('');
    setLinkError('');
  };

  const selectedConfig = formData.type ? entryTypeConfigs[formData.type] : null

  return (
    <View style={[SharedStyles.screenContainer, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text 
          variant="headlineMedium" 
          style={[styles.headerTitle, { color: colors.text }]}
        >
          New Entry
        </Text>
      </View>

      <ScrollView style={styles.form}>
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          style={[styles.input, { backgroundColor: colors.input }]}
          textColor={colors.text}
        />

        <Card style={[SharedStyles.card, styles.formCard]}>
          <Card.Content>
            <View style={styles.formSection}>
              <Text style={SharedStyles.label}>Entry Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.type}
                  onValueChange={(value: string) => setFormData({
                    type: value as EntryType,
                    metrics: {},
                    prompts: {},
                    media: {}
                  })}
                  style={[styles.picker, { color: Colors.dark.text }]}
                  dropdownIconColor={Colors.dark.text}
                >
                  <Picker.Item 
                    label="Select entry type" 
                    value="" 
                    color={Colors.dark.text}
                  />
                  {Object.entries(entryTypeConfigs).map(([type, config]) => (
                    <Picker.Item
                      key={type}
                      label={config.label}
                      value={type}
                      color={Colors.dark.text}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {formData.type === 'game' && (
              <View style={styles.formSection}>
                <TextInput
                  label="Opponent Name"
                  value={formData.gameDetails?.opponent || ''}
                  onChangeText={(value: string) => handleGameDetailsChange('opponent', value)}
                  style={[SharedStyles.input, styles.input]}
                />
                
                <View style={styles.scoreContainer}>
                  <View style={styles.scoreTeam}>
                    <Text style={styles.scoreLabel}>Your Team</Text>
                    <TextInput
                      label="Score"
                      value={formData.gameDetails?.score?.yourTeam || ''}
                      onChangeText={(value: string) => handleScoreChange('yourTeam', value)}
                      keyboardType="numeric"
                      style={[SharedStyles.input, styles.scoreInput]}
                    />
                  </View>
                  
                  <Text style={styles.scoreSeparator}>-</Text>
                  
                  <View style={styles.scoreTeam}>
                    <Text style={styles.scoreLabel}>Opponent</Text>
                    <TextInput
                      label="Score"
                      value={formData.gameDetails?.score?.opponent || ''}
                      onChangeText={(value: string) => handleScoreChange('opponent', value)}
                      keyboardType="numeric"
                      style={[SharedStyles.input, styles.scoreInput]}
                    />
                  </View>
                </View>

                <View style={styles.resultContainer}>
                  <Text style={SharedStyles.label}>Result</Text>
                  <SegmentedButtons
                    value={formData.gameDetails?.result || ''}
                    onValueChange={(value: string) => 
                      handleGameDetailsChange('result', value as 'win' | 'loss' | 'draw')
                    }
                    buttons={[
                      { 
                        value: 'win', 
                        label: 'Win',
                        style: formData.gameDetails?.result === 'win' ? styles.winButton : undefined
                      },
                      { 
                        value: 'loss', 
                        label: 'Loss',
                        style: formData.gameDetails?.result === 'loss' ? styles.lossButton : undefined
                      },
                      { 
                        value: 'draw', 
                        label: 'Draw',
                        style: formData.gameDetails?.result === 'draw' ? styles.drawButton : undefined
                      }
                    ]}
                    style={styles.resultButtons}
                  />
                </View>
              </View>
            )}

            {selectedConfig && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Rate Your Performance</Text>
                  {selectedConfig.metrics.map((metric) => (
                    <View key={metric.id} style={styles.metricContainer}>
                      <View style={styles.metricHeader}>
                        <Text style={styles.label}>{metric.label}</Text>
                        <Text style={styles.sliderValue}>
                          {(formData.metrics[metric.id] || 5).toFixed(1)}
                        </Text>
                      </View>
                      <Text style={styles.description}>{metric.description}</Text>
                      <View style={styles.sliderContainer}>
                        <Text style={styles.sliderMinMax}>{metric.min}</Text>
                        <Slider
                          minimumValue={metric.min}
                          maximumValue={metric.max}
                          step={0.1}
                          value={formData.metrics[metric.id] || 5}
                          onValueChange={(value: number) => handleMetricChange(metric.id, value)}
                          minimumTrackTintColor={colors.primary}
                          maximumTrackTintColor={colors.border}
                          thumbTintColor={colors.primary}
                          style={styles.slider}
                        />
                        <Text style={styles.sliderMinMax}>{metric.max}</Text>
                      </View>
                      <View style={styles.sliderLabels}>
                        <Text style={styles.sliderLabel}>Poor</Text>
                        <Text style={styles.sliderLabel}>Excellent</Text>
                      </View>
                    </View>
                  ))}
                </View>

                <Divider style={styles.divider} />
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Reflect on Your Performance</Text>
                  {selectedConfig.prompts.map((prompt) => (
                    <View key={prompt.id} style={styles.promptContainer}>
                      <Text style={styles.label}>
                        {prompt.label}
                        {prompt.required && <Text style={styles.required}> *</Text>}
                      </Text>
                      <TextInput
                        multiline
                        numberOfLines={4}
                        value={formData.prompts[prompt.id] || ''}
                        onChangeText={(value: string) => handlePromptChange(prompt.id, value)}
                        placeholder={prompt.placeholder}
                        style={styles.textArea}
                      />
                    </View>
                  ))}
                </View>

                <Divider style={styles.divider} />
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Media</Text>
                  {selectedConfig.media.map((mediaConfig) => (
                    <View key={mediaConfig.id} style={styles.mediaContainer}>
                      <Text style={styles.label}>
                        {mediaConfig.label}
                        {mediaConfig.required && <Text style={styles.required}> *</Text>}
                      </Text>
                      <Text style={styles.description}>{mediaConfig.description}</Text>
                      <View style={styles.mediaButtons}>
                        {mediaConfig.allowUpload && (
                          <Button 
                            mode="outlined" 
                            icon="upload"
                            onPress={() => handleMediaUpload(mediaConfig.id)}
                            style={styles.mediaButton}
                          >
                            Upload
                          </Button>
                        )}
                        {mediaConfig.allowLinks && (
                          <Button 
                            mode="outlined" 
                            icon="link"
                            onPress={() => handleAddLink(mediaConfig.id)}
                            style={styles.mediaButton}
                          >
                            Add Link
                          </Button>
                        )}
                      </View>
                      {formData.media[mediaConfig.id]?.map((media, index) => (
                        <View key={index} style={styles.mediaItem}>
                          <Text style={[styles.mediaName, { color: colors.text }]}>
                            {media.type === 'upload' ? media.name : (media.title || media.url)}
                          </Text>
                          <IconButton
                            icon="close"
                            size={20}
                            onPress={() => {
                              setFormData(prev => ({
                                ...prev,
                                media: {
                                  ...prev.media,
                                  [mediaConfig.id]: prev.media[mediaConfig.id].filter((_, i) => i !== index)
                                }
                              }));
                            }}
                          />
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
            >
              Save Entry
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        <Dialog 
          visible={linkDialogVisible} 
          onDismiss={() => {
            setLinkDialogVisible(false);
            setLinkInput('');
            setLinkTitle('');
            setLinkError('');
          }}
          style={[styles.linkDialog, { backgroundColor: colors.card }]}
        >
          <Dialog.Title style={{ color: colors.text }}>Add Media Link</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="URL"
              value={linkInput}
              onChangeText={(text) => {
                setLinkInput(text);
                setLinkError('');
              }}
              style={[styles.input, { backgroundColor: colors.input }]}
              textColor={colors.text}
              autoCapitalize="none"
              autoComplete="url"
              keyboardType="url"
              error={!!linkError}
            />
            {linkError ? (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {linkError}
              </Text>
            ) : null}
            
            <TextInput
              label="Title (Optional)"
              value={linkTitle}
              onChangeText={setLinkTitle}
              style={[styles.input, styles.linkInput, { backgroundColor: colors.input }]}
              textColor={colors.text}
              placeholder="Enter a descriptive title"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setLinkDialogVisible(false);
              setLinkInput('');
              setLinkTitle('');
              setLinkError('');
            }}>
              Cancel
            </Button>
            <Button 
              onPress={handleLinkSubmit}
              disabled={!linkInput}
            >
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  formCard: {
    marginTop: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  pickerContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: Colors.dark.text
  },
  required: {
    color: Colors.dark.error
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: Colors.dark.text
  },
  input: {
    marginBottom: 12,
    backgroundColor: Colors.dark.input
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  flex1: {
    flex: 1
  },
  divider: {
    marginVertical: 20
  },
  metricContainer: {
    marginBottom: 24,
    backgroundColor: Colors.dark.card,
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 16,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  slider: {
    flex: 1,
    height: 40, // Increased height for better touch target
  },
  sliderValue: {
    color: Colors.dark.primary,
    fontSize: 20,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  sliderMinMax: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  sliderLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
  promptContainer: {
    marginBottom: 16
  },
  textArea: {
    backgroundColor: Colors.dark.input,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top'
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 40, // Add extra padding at bottom
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 12,
  },
  scoreTeam: {
    flex: 1,
    alignItems: 'center',
  },
  scoreLabel: {
    color: Colors.dark.text,
    fontSize: 16,
    marginBottom: 8,
  },
  scoreInput: {
    width: '100%',
    textAlign: 'center',
  },
  scoreSeparator: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  resultContainer: {
    marginTop: 8,
  },
  resultButtons: {
    marginTop: 8,
  },
  winButton: {
    backgroundColor: Colors.dark.primary,
  },
  lossButton: {
    backgroundColor: Colors.dark.error,
  },
  drawButton: {
    backgroundColor: Colors.dark.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    flex: 1,
  },
  form: {
    padding: 16,
    paddingBottom: 80, // Add extra padding for scroll
  },
  mediaContainer: {
    marginBottom: 20,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  mediaButton: {
    flex: 1,
  },
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: Colors.dark.input,
  },
  mediaName: {
    flex: 1,
    marginRight: 8,
    fontSize: 14,
  },
  linkDialog: {
    borderRadius: 12,
  },
  linkInput: {
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
}) 