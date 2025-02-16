import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform
} from 'react-native'
import {
  Text,
  Card,
  Button,
  TextInput,
  Portal,
  Modal,
  SegmentedButtons,
  IconButton,
  Divider,
  Surface,
  ProgressBar
} from 'react-native-paper'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'
import { Colors } from '../constants/Colors'
import { Goal, GoalFilter, GoalProgress } from '../types/goals'
import Toast from 'react-native-toast-message'
import { saveGoals, loadGoals } from '../utils/storage'
import { useFocusEffect } from '@react-navigation/native'
import { SharedStyles } from '@/constants/Styles'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'

/**
 * GoalsScreen Component
 * 
 * Main screen for managing user goals. Provides functionality to create, edit, 
 * delete, and track progress of both numeric and boolean goals.
 * 
 * Features:
 * - Create new goals with deadlines
 * - Track numeric progress or boolean completion
 * - Filter goals by status
 * - Edit existing goals
 * - Delete goals with confirmation
 * - Log progress updates
 */

// State interfaces
interface GoalState {
  /** All goals stored in the application */
  goals: Goal[];
  /** Loading state for initial data fetch */
  loading: boolean;
  /** Refresh state for pull-to-refresh */
  refreshing: boolean;
  /** Controls visibility of add/edit goal modal */
  showModal: boolean;
  /** Controls visibility of progress update modal */
  showProgressModal: boolean;
  /** Currently selected goal for editing/updating */
  selectedGoal: Goal | null;
  /** Controls visibility of date picker */
  showDatePicker: boolean;
  /** Current filter for goals list */
  filterType: GoalFilter;
  /** Current goal being created/edited */
  newGoal: Partial<Goal>;
  /** Progress update amount */
  progressUpdate: string;
  /** Optional note for progress update */
  progressNote: string;
  /** Timestamp for progress update */
  progressDate: string;
  /** Controls visibility of progress date picker */
  showProgressDatePicker: boolean;
  /** Whether the modal is in edit mode */
  isEditMode: boolean;
  /** Controls visibility of delete confirmation */
  showDeleteConfirm: boolean;
}

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [filterType, setFilterType] = useState<GoalFilter>('all')
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    type: 'numeric',
    target: undefined,
    progress: [],
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false
  })
  const [progressUpdate, setProgressUpdate] = useState('')
  const [progressNote, setProgressNote] = useState('')
  const [progressDate, setProgressDate] = useState(new Date().toISOString())
  const [showProgressDatePicker, setShowProgressDatePicker] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useFocusEffect(
    useCallback(() => {
      loadStoredGoals()
    }, [])
  )

  /**
   * Loads goals from storage and updates state
   * Handles loading state and error notifications
   * @throws Error if loading fails, but error is caught and displayed to user
   */
  const loadStoredGoals = async () => {
    try {
      setLoading(true)
      const storedGoals = await loadGoals()
      setGoals(storedGoals)
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load goals'
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Refreshes goals list when pulled down
   * Manages refreshing state during the operation
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadStoredGoals()
    setRefreshing(false)
  }, [])

  /**
   * Handles adding a new goal
   * Validates required fields and saves to storage
   * 
   * Validation:
   * - Title must not be empty
   * - Numeric goals must have a target value
   * 
   * @throws Error if saving fails, but error is caught and displayed to user
   */
  const handleAddGoal = async () => {
    if (!newGoal.title?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a goal title'
      })
      return
    }

    if (newGoal.type === 'numeric' && !newGoal.target) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please set a target value'
      })
      return
    }

    try {
      const goal: Goal = {
        id: Date.now(),
        title: newGoal.title!,
        type: newGoal.type!,
        target: newGoal.target,
        progress: [],
        deadline: newGoal.deadline!,
        completed: false,
        createdAt: new Date().toISOString(),
        unit: newGoal.unit
      }

      const updatedGoals = [...goals, goal]
      await saveGoals(updatedGoals)
      setGoals(updatedGoals)
      setShowModal(false)
      resetNewGoal()
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Goal added successfully!'
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add goal'
      })
    }
  }

  /**
   * Updates progress for a goal
   * Handles both numeric and boolean goals differently
   * 
   * For numeric goals:
   * - Validates progress value is a positive number
   * - Updates total progress
   * - Checks if target is reached
   * 
   * @throws Error if saving fails, but error is caught and displayed to user
   */
  const handleUpdateProgress = async () => {
    if (!selectedGoal) return

    if (selectedGoal.type === 'numeric') {
      const newProgress = Number(progressUpdate)
      if (isNaN(newProgress) || newProgress < 0) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Please enter a valid number'
        })
        return
      }

      try {
        const progressEntry: GoalProgress = {
          id: Date.now(),
          value: newProgress,
          timestamp: new Date().toISOString(),
          note: progressNote.trim() || undefined
        }

        const updatedGoals = goals.map(goal => {
          if (goal.id === selectedGoal.id) {
            const newTotal = calculateTotal([...goal.progress, progressEntry])
            return {
              ...goal,
              progress: [...goal.progress, progressEntry],
              completed: goal.target ? newTotal >= goal.target : false
            }
          }
          return goal
        })
        
        await saveGoals(updatedGoals)
        setGoals(updatedGoals)
        setShowProgressModal(false)
        setProgressUpdate('')
        setProgressNote('')
        setSelectedGoal(null)
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Progress logged!'
        })
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to log progress'
        })
      }
    }
  }

  /**
   * Resets the new goal form to default values
   * Used when closing modal or after successful submission
   */
  const resetNewGoal = () => {
    setNewGoal({
      type: 'numeric',
      target: undefined,
      progress: [],
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false
    })
  }

  /**
   * Calculates progress percentage for a goal
   * 
   * For boolean goals:
   * - Returns 100 if completed, 0 if not
   * 
   * For numeric goals:
   * - Calculates percentage based on total progress vs target
   * - Caps at 100% even if exceeded
   * 
   * @param goal Goal to calculate progress for
   * @returns Progress percentage between 0 and 100
   */
  const calculateProgress = (goal: Goal): number => {
    if (goal.type === 'boolean') {
      return goal.completed ? 100 : 0;
    }
    if (!goal.target || !goal.progress) return 0;
    const total = calculateTotal(goal.progress);
    return Math.min(100, (total / goal.target) * 100);
  }

  /**
   * Calculates days remaining until goal deadline
   * 
   * @param deadline ISO string of goal deadline
   * @returns Number of days remaining (can be negative if past deadline)
   */
  const getDaysRemaining = (deadline: string): number => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  /**
   * Filters goals based on current filter type
   * 
   * Filter types:
   * - 'all': Shows all goals
   * - 'ongoing': Shows incomplete goals
   * - 'completed': Shows completed goals
   * 
   * @returns Filtered array of goals
   */
  const filteredGoals = goals.filter(goal => {
    switch (filterType) {
      case 'completed':
        return goal.completed
      case 'ongoing':
        return !goal.completed
      default:
        return true
    }
  })

  /**
   * Calculates total progress for a numeric goal
   * 
   * @param progress Array of progress entries
   * @returns Sum of all progress values
   */
  const calculateTotal = (progress?: GoalProgress[]): number => {
    if (!progress) return 0;
    return progress.reduce((sum, p) => sum + p.value, 0);
  }

  /**
   * Updates completion status for boolean goals
   * 
   * @param completed New completion status
   * @throws Error if saving fails, but error is caught and displayed to user
   */
  const handleBooleanProgress = async (completed: boolean) => {
    if (!selectedGoal) return

    try {
      const updatedGoals = goals.map(goal => {
        if (goal.id === selectedGoal.id) {
          return { ...goal, completed }
        }
        return goal
      })
      
      await saveGoals(updatedGoals)
      setGoals(updatedGoals)
      setShowProgressModal(false)
      setSelectedGoal(null)
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Goal status updated!'
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update goal status'
      })
    }
  }

  /**
   * Prepares a goal for editing
   * Sets up edit mode and populates form with goal data
   * 
   * @param goal Goal to edit
   */
  const handleEditGoal = (goal: Goal) => {
    setNewGoal({
      ...goal,
      deadline: goal.deadline
    });
    setIsEditMode(true);
    setShowModal(true);
  }

  /**
   * Updates an existing goal
   * Validates required fields and saves changes
   * 
   * Validation:
   * - Title must not be empty
   * - Numeric goals must have a target value
   * 
   * @throws Error if saving fails, but error is caught and displayed to user
   */
  const handleUpdateGoal = async () => {
    if (!newGoal.title?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a goal title'
      });
      return;
    }

    if (newGoal.type === 'numeric' && !newGoal.target) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please set a target value'
      });
      return;
    }

    try {
      const updatedGoals = goals.map(goal => 
        goal.id === newGoal.id ? { ...newGoal as Goal } : goal
      );
      
      await saveGoals(updatedGoals);
      setGoals(updatedGoals);
      setShowModal(false);
      setIsEditMode(false);
      resetNewGoal();
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Goal updated successfully!'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update goal'
      });
    }
  };

  /**
   * Deletes a goal after confirmation
   * Removes goal from storage and updates state
   * 
   * @throws Error if saving fails, but error is caught and displayed to user
   */
  const handleDeleteGoal = async () => {
    if (!newGoal.id) return;
    
    try {
      const updatedGoals = goals.filter(goal => goal.id !== newGoal.id);
      await saveGoals(updatedGoals);
      setGoals(updatedGoals);
      setShowModal(false);
      setIsEditMode(false);
      resetNewGoal();
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Goal deleted successfully!'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete goal'
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    )
  }

  return (
    <View style={SharedStyles.screenContainer}>
      <View style={styles.headerContainer}>
        <Text variant="headlineMedium" style={styles.headerTitle}>Goals</Text>
        <Button
          mode="contained"
          onPress={() => setShowModal(true)}
          icon="plus"
          style={styles.addButton}
          labelStyle={styles.buttonLabel}
        >
          Add Goal
        </Button>
      </View>

      <SegmentedButtons
        value={filterType}
        onValueChange={value => setFilterType(value as GoalFilter)}
        buttons={[
          { value: 'all', label: 'All' },
          { value: 'ongoing', label: 'In Progress' },
          { value: 'completed', label: 'Completed' }
        ]}
        style={styles.filterButtons}
      />

      <ScrollView 
        style={styles.goalsList}
        contentContainerStyle={SharedStyles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.dark.primary}
          />
        }
      >
        {filteredGoals.length === 0 ? (
          <Surface style={styles.emptyState}>
            <MaterialCommunityIcons 
              name="target" 
              size={48} 
              color={Colors.dark.textSecondary} 
            />
            <Text style={styles.emptyStateText}>
              No goals found. Tap the "Add Goal" button to create one!
            </Text>
          </Surface>
        ) : (
          filteredGoals.map(goal => (
            <Card key={goal.id} style={styles.goalCard}>
              <Card.Content>
                <View style={styles.goalHeader}>
                  <View>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalSubtitle}>
                      {getDaysRemaining(goal.deadline)} days remaining
                    </Text>
                  </View>
                  <IconButton
                    icon="dots-vertical"
                    onPress={() => handleEditGoal(goal)}
                  />
                </View>
                
                <View style={styles.progressContainer}>
                  <ProgressBar
                    progress={calculateProgress(goal) / 100}
                    color={Colors.dark.primary}
                    style={styles.progressBar}
                  />
                  <Text style={styles.progressText}>
                    {goal.type === 'boolean' 
                      ? (goal.completed ? 'Completed' : 'In Progress')
                      : `${calculateTotal(goal.progress)}${goal.unit ? ` ${goal.unit}` : ''} 
                         ${goal.target ? ` / ${goal.target}${goal.unit ? ` ${goal.unit}` : ''}` : ''}`
                    }
                  </Text>
                </View>

                {goal.type === 'boolean' ? (
                  !goal.completed && (
                    <Button
                      mode="contained-tonal"
                      onPress={async () => {
                        try {
                          const updatedGoals = goals.map(g => 
                            g.id === goal.id ? { ...g, completed: true } : g
                          );
                          await saveGoals(updatedGoals);
                          setGoals(updatedGoals);
                          
                          Toast.show({
                            type: 'success',
                            text1: 'Success',
                            text2: 'Goal marked as complete!'
                          });
                        } catch (error) {
                          Toast.show({
                            type: 'error',
                            text1: 'Error',
                            text2: 'Failed to update goal'
                          });
                        }
                      }}
                      style={styles.updateProgressButton}
                    >
                      Mark as Complete
                    </Button>
                  )
                ) : (
                  <Button
                    mode="contained-tonal"
                    onPress={() => {
                      setSelectedGoal(goal);
                      setShowProgressModal(true);
                      setProgressUpdate('');
                    }}
                    style={styles.updateProgressButton}
                  >
                    Update Progress
                  </Button>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={showModal}
          onDismiss={() => {
            setShowModal(false);
            setIsEditMode(false);
            resetNewGoal();
          }}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            {isEditMode ? 'Edit Goal' : 'New Goal'}
          </Text>
          <TextInput
            label="Goal Title"
            value={newGoal.title || ''}
            onChangeText={(value) => setNewGoal({ ...newGoal, title: value })}
            style={styles.input}
          />

          <SegmentedButtons
            value={newGoal.type || 'numeric'}
            onValueChange={(value) => 
              setNewGoal({ ...newGoal, type: value as 'numeric' | 'boolean' })
            }
            buttons={[
              { value: 'numeric', label: 'Numeric' },
              { value: 'boolean', label: 'Completion' }
            ]}
            style={styles.typeButtons}
          />

          {newGoal.type === 'numeric' && (
            <View style={styles.row}>
              <TextInput
                label="Target"
                keyboardType="numeric"
                value={String(newGoal.target || '')}
                onChangeText={(value) => 
                  setNewGoal({ ...newGoal, target: Number(value) })
                }
                style={[styles.input, styles.flex1]}
              />
              <TextInput
                label="Unit"
                value={newGoal.unit || ''}
                onChangeText={(value) => setNewGoal({ ...newGoal, unit: value })}
                placeholder="goals, points, etc."
                style={[styles.input, styles.flex1]}
              />
            </View>
          )}

          <TouchableOpacity 
            onPress={() => setShowDatePicker(true)}
          >
            <TextInput
              label="Deadline"
              value={format(new Date(newGoal.deadline!), 'MMM d, yyyy')}
              editable={false}
              right={<TextInput.Icon 
                icon="calendar" 
                onPress={() => setShowDatePicker(true)}
              />}
              style={styles.input}
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={new Date(newGoal.deadline!)}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date && event.type !== 'dismissed') {
                  const selectedDate = new Date(date);
                  selectedDate.setHours(23, 59, 59, 999);
                  setNewGoal(prev => ({ 
                    ...prev, 
                    deadline: selectedDate.toISOString() 
                  }));
                }
              }}
              minimumDate={new Date()}
            />
          )}

          <View style={styles.modalButtons}>
            {isEditMode ? (
              <View style={styles.editButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setShowDeleteConfirm(true)}
                  style={[styles.modalButton, styles.deleteButton]}
                  textColor={Colors.dark.error}
                >
                  Delete
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowModal(false);
                    setIsEditMode(false);
                    resetNewGoal();
                  }}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleUpdateGoal}
                  style={styles.modalButton}
                >
                  Update
                </Button>
              </View>
            ) : (
              <View style={styles.centerButtons}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowModal(false);
                    resetNewGoal();
                  }}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAddGoal}
                  style={styles.modalButton}
                >
                  Add Goal
                </Button>
              </View>
            )}
          </View>
        </Modal>

        <Modal
          visible={showProgressModal}
          onDismiss={() => {
            setShowProgressModal(false);
            setSelectedGoal(null);
            setProgressUpdate('');
            setProgressNote('');
          }}
          contentContainerStyle={[styles.modal, styles.progressModal]}
        >
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              {selectedGoal?.type === 'boolean' ? 'Update Status' : 'Log Progress'}
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => {
                setShowProgressModal(false);
                setSelectedGoal(null);
                setProgressUpdate('');
                setProgressNote('');
              }}
            />
          </View>
          
          <ScrollView style={styles.modalScroll}>
            <Text style={styles.modalSubtitle}>{selectedGoal?.title}</Text>

            {selectedGoal?.type === 'boolean' ? (
              <View style={styles.booleanProgress}>
                <Button
                  mode={selectedGoal.completed ? 'outlined' : 'contained'}
                  onPress={() => handleBooleanProgress(false)}
                  style={styles.booleanButton}
                >
                  In Progress
                </Button>
                <Button
                  mode={selectedGoal.completed ? 'contained' : 'outlined'}
                  onPress={() => handleBooleanProgress(true)}
                  style={styles.booleanButton}
                >
                  Completed
                </Button>
              </View>
            ) : (
              <>
                <TextInput
                  label={`Progress Amount${selectedGoal?.unit ? ` (${selectedGoal.unit})` : ''}`}
                  value={progressUpdate}
                  onChangeText={setProgressUpdate}
                  keyboardType="numeric"
                  style={styles.input}
                />
                
                <TextInput
                  label="Note (optional)"
                  value={progressNote}
                  onChangeText={setProgressNote}
                  style={styles.input}
                  multiline
                />

                {selectedGoal?.target && (
                  <Text style={styles.modalHelper}>
                    Target: {selectedGoal.target}{selectedGoal.unit ? ` ${selectedGoal.unit}` : ''}
                    {'\n'}Current Total: {calculateTotal(selectedGoal.progress)}
                  </Text>
                )}
              </>
            )}
          </ScrollView>

          <View style={styles.singleButtonContainer}>
            <Button
              mode="contained"
              onPress={handleUpdateProgress}
              style={styles.fullWidthButton}
            >
              {selectedGoal?.type === 'boolean' ? 'Update' : 'Log Progress'}
            </Button>
          </View>
        </Modal>

        <Modal
          visible={showDeleteConfirm}
          onDismiss={() => setShowDeleteConfirm(false)}
          contentContainerStyle={[styles.modal, styles.confirmModal]}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>Delete Goal</Text>
          <Text style={styles.confirmText}>
            Are you sure you want to delete this goal? This action cannot be undone.
          </Text>
          <View style={styles.confirmButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowDeleteConfirm(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                setShowDeleteConfirm(false);
                handleDeleteGoal();
              }}
              style={[styles.modalButton, styles.confirmDeleteButton]}
              buttonColor={Colors.dark.error}
            >
              Delete
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    color: Colors.dark.text,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
  },
  buttonLabel: {
    color: Colors.dark.text,
  },
  filterButtons: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  goalsList: {
    flex: 1,
  },
  goalCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.dark.card,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
  },
  goalSubtitle: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  progressContainer: {
    marginVertical: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.dark.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.dark.primary,
    borderRadius: 4,
  },
  progressText: {
    marginTop: 4,
    textAlign: 'right',
    color: Colors.dark.textSecondary,
  },
  emptyState: {
    margin: 24,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
  },
  emptyStateText: {
    marginTop: 16,
    textAlign: 'center',
    color: Colors.dark.textSecondary,
    fontSize: 16,
  },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: Colors.dark.card,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalTitle: {
    color: Colors.dark.text,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    color: Colors.dark.text,
    fontSize: 16,
    marginBottom: 16,
  },
  modalHelper: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: Colors.dark.input,
  },
  typeButtons: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  modalButtons: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    minWidth: 100,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: Colors.dark.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  datePickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModal: {
    width: 340,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  datePickerContainer: {
    paddingHorizontal: 20,
  },
  datePickerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  datePickerButton: {
    width: '100%',
  },
  booleanProgress: {
    flexDirection: 'row',
    gap: 12,
  },
  booleanButton: {
    flex: 1,
  },
  updateProgressButton: {
    marginTop: 12,
  },
  progressModal: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: Platform.OS === 'ios' ? 80 : 40,
    maxHeight: '80%',
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  modalScroll: {
    padding: 20,
    paddingTop: 0,
  },
  singleButtonContainer: {
    padding: 20,
    paddingTop: 0,
  },
  fullWidthButton: {
    width: '100%',
  },
  centerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  deleteButton: {
    borderColor: Colors.dark.error,
    minWidth: 100,
  },
  confirmModal: {
    maxWidth: 400,
    alignSelf: 'center',
  },
  confirmText: {
    color: Colors.dark.text,
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  confirmDeleteButton: {
    backgroundColor: Colors.dark.error,
  },
}) 