import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Alert
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
  ProgressBar,
  Menu
} from 'react-native-paper'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'
import { Colors } from '../constants/Colors'
import { Target, TargetFilter, TargetProgress } from '../types/targets'
import Toast from 'react-native-toast-message'
import { saveTargets, loadTargets } from '../utils/storage'
import { useFocusEffect } from '@react-navigation/native'
import { SharedStyles } from '@/constants/Styles'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { default as TargetCard } from '@/components/TargetCard'
import { useColorScheme } from '@/hooks/useColorScheme'

/**
 * TargetsScreen Component
 * 
 * Main screen for managing user targets. Provides functionality to create, edit, 
 * delete, and track progress of both numeric and boolean targets.
 * 
 * Features:
 * - Create new targets with deadlines
 * - Track numeric progress or boolean completion
 * - Filter targets by status
 * - Edit existing targets
 * - Delete targets with confirmation
 * - Log progress updates
 */

// State interfaces
interface TargetState {
  /** All targets stored in the application */
  targets: Target[];
  /** Loading state for initial data fetch */
  loading: boolean;
  /** Refresh state for pull-to-refresh */
  refreshing: boolean;
  /** Controls visibility of add/edit target modal */
  showModal: boolean;
  /** Controls visibility of progress update modal */
  showProgressModal: boolean;
  /** Currently selected target for editing/updating */
  selectedTarget: Target | null;
  /** Controls visibility of date picker */
  showDatePicker: boolean;
  /** Current filter for targets list */
  filterType: TargetFilter;
  /** Current target being created/edited */
  newTarget: Partial<Target>;
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
  /** Controls visibility of progress log modal */
  showProgressLog: boolean;
  /** Progress entry being edited */
  editingProgress: TargetProgress | null;
}

export default function TargetsScreen() {
  const [targets, setTargets] = useState<Target[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [filterType, setFilterType] = useState<TargetFilter>('all')
  const [newTarget, setNewTarget] = useState<Partial<Target>>({
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
  const [showProgressLog, setShowProgressLog] = useState(false)
  const [editingProgress, setEditingProgress] = useState<TargetProgress | null>(null)
  const [menuVisible, setMenuVisible] = useState(false)
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme]

  useFocusEffect(
    useCallback(() => {
      loadStoredTargets()
    }, [])
  )

  /**
   * Loads targets from storage and updates state
   * Handles loading state and error notifications
   * @throws Error if loading fails, but error is caught and displayed to user
   */
  const loadStoredTargets = async () => {
    try {
      setLoading(true)
      const storedTargets = await loadTargets()
      setTargets(storedTargets)
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load targets'
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Refreshes targets list when pulled down
   * Manages refreshing state during the operation
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadStoredTargets()
    setRefreshing(false)
  }, [])

  /**
   * Handles adding a new target
   * Validates required fields and saves to storage
   * 
   * Validation:
   * - Title must not be empty
   * - Numeric targets must have a target value
   * 
   * @throws Error if saving fails, but error is caught and displayed to user
   */
  const handleAddTarget = async () => {
    if (!newTarget.title?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a target title'
      })
      return
    }

    if (newTarget.type === 'numeric' && !newTarget.target) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please set a target value'
      })
      return
    }

    try {
      const target: Target = {
        id: Date.now(),
        title: newTarget.title!,
        type: newTarget.type!,
        target: newTarget.target,
        progress: [],
        deadline: newTarget.deadline!,
        completed: false,
        createdAt: new Date().toISOString(),
        unit: newTarget.unit
      }

      const updatedTargets = [...targets, target]
      await saveTargets(updatedTargets)
      setTargets(updatedTargets)
      setShowModal(false)
      resetNewTarget()
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Target added successfully!'
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add target'
      })
    }
  }

  /**
   * Updates progress for a target
   * Handles both numeric and boolean targets differently
   * 
   * For numeric targets:
   * - Validates progress value is a positive number
   * - Updates total progress
   * - Checks if target is reached
   * 
   * @throws Error if saving fails, but error is caught and displayed to user
   */
  const handleUpdateProgress = async () => {
    if (!selectedTarget) return;

    try {
      const now = new Date().toISOString();

      if (selectedTarget.type === 'boolean') {
        const updatedTargets = targets.map(target => {
          if (target.id === selectedTarget.id) {
            return {
              ...target,
              completed: true,
              completedAt: now,
              progress: [{
                id: Date.now(),
                value: 1,
                note: progressNote,
                timestamp: progressDate
              }]
            };
          }
          return target;
        });

        await saveTargets(updatedTargets);
        setTargets(updatedTargets);
      } else {
        const progress = {
          id: editingProgress?.id || Date.now(),
          value: parseFloat(progressUpdate),
          note: progressNote,
          timestamp: progressDate
        };

        const updatedTargets = targets.map(target => {
          if (target.id === selectedTarget.id) {
            const updatedProgress = isEditMode 
              ? target.progress.map(p => p.id === editingProgress?.id ? progress : p)
              : [...target.progress, progress];
            
            const newTotal = updatedProgress.reduce((sum, p) => sum + p.value, 0);
            const isNowCompleted = newTotal >= (target.target || 0);
            const wasCompletedBefore = target.completed;

            return {
              ...target,
              progress: updatedProgress,
              completed: isNowCompleted,
              completedAt: isNowCompleted && !wasCompletedBefore 
                ? now 
                : target.completedAt
            };
          }
          return target;
        });

        await saveTargets(updatedTargets);
        setTargets(updatedTargets);
      }
      
      // Reset form
      setProgressUpdate('');
      setProgressNote('');
      setProgressDate(new Date().toISOString());
      setShowProgressModal(false);
      setIsEditMode(false);
      setEditingProgress(null);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: selectedTarget.type === 'boolean' 
          ? 'Target marked as complete!'
          : (isEditMode ? 'Progress updated successfully!' : 'Progress logged successfully!')
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update progress'
      });
    }
  };

  /**
   * Resets the new target form to default values
   * Used when closing modal or after successful submission
   */
  const resetNewTarget = () => {
    setNewTarget({
      type: 'numeric',
      target: undefined,
      progress: [],
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false
    })
  }

  /**
   * Calculates progress percentage for a target
   * 
   * For boolean targets:
   * - Returns 100 if completed, 0 if not
   * 
   * For numeric targets:
   * - Calculates percentage based on total progress vs target
   * - Caps at 100% even if exceeded
   * 
   * @param target Target to calculate progress for
   * @returns Progress percentage between 0 and 100
   */
  const calculateProgress = (target: Target): number => {
    if (target.type === 'boolean') {
      return target.completed ? 100 : 0;
    }
    if (!target.target || !target.progress) return 0;
    const total = calculateTotal(target.progress);
    return Math.min(100, (total / target.target) * 100);
  }

  /**
   * Calculates days remaining until target deadline
   * 
   * @param deadline ISO string of target deadline
   * @returns Number of days remaining (can be negative if past deadline)
   */
  const getDaysRemaining = (deadline: string): number => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  /**
   * Filters targets based on current filter type
   * 
   * Filter types:
   * - 'all': Shows all targets
   * - 'ongoing': Shows incomplete targets
   * - 'completed': Shows completed targets
   * 
   * @returns Filtered array of targets
   */
  const filteredTargets = targets.filter(target => {
    switch (filterType) {
      case 'completed':
        return target.completed
      case 'ongoing':
        return !target.completed
      default:
        return true
    }
  })

  /**
   * Calculates total progress for a numeric target
   * 
   * @param progress Array of progress entries
   * @returns Sum of all progress values
   */
  const calculateTotal = (progress?: TargetProgress[]): number => {
    if (!progress) return 0;
    return progress.reduce((sum, p) => sum + p.value, 0);
  }

  /**
   * Updates completion status for boolean targets
   * 
   * @param completed New completion status
   * @throws Error if saving fails, but error is caught and displayed to user
   */
  const handleBooleanProgress = async (completed: boolean) => {
    if (!selectedTarget) return

    try {
      const updatedTargets = targets.map(target => {
        if (target.id === selectedTarget.id) {
          return { ...target, completed }
        }
        return target
      })
      
      await saveTargets(updatedTargets)
      setTargets(updatedTargets)
      setShowProgressModal(false)
      setSelectedTarget(null)
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Target status updated!'
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update target status'
      })
    }
  }

  /**
   * Prepares a target for editing
   * Sets up edit mode and populates form with target data
   * 
   * @param target Target to edit
   */
  const handleEditTarget = (target: Target) => {
    setNewTarget({
      ...target,
      deadline: target.deadline
    });
    setIsEditMode(true);
    setShowModal(true);
  }

  /**
   * Updates an existing target
   * Validates required fields and saves changes
   * 
   * Validation:
   * - Title must not be empty
   * - Numeric targets must have a target value
   * 
   * @throws Error if saving fails, but error is caught and displayed to user
   */
  const handleUpdateTarget = async () => {
    if (!newTarget.title?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a target title'
      });
      return;
    }

    if (newTarget.type === 'numeric' && !newTarget.target) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please set a target value'
      });
      return;
    }

    try {
      const updatedTargets = targets.map(target => 
        target.id === newTarget.id ? { ...newTarget as Target } : target
      );
      
      await saveTargets(updatedTargets);
      setTargets(updatedTargets);
      setShowModal(false);
      setIsEditMode(false);
      resetNewTarget();
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Target updated successfully!'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update target'
      });
    }
  };

  /**
   * Deletes a target after confirmation
   * Removes target from storage and updates state
   * 
   * @throws Error if saving fails, but error is caught and displayed to user
   */
  const handleDeleteTarget = async () => {
    if (!newTarget.id) return;
    
    try {
      const updatedTargets = targets.filter(target => target.id !== newTarget.id);
      await saveTargets(updatedTargets);
      setTargets(updatedTargets);
      setShowModal(false);
      setIsEditMode(false);
      resetNewTarget();
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Target deleted successfully!'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete target'
      });
    }
  };

  /**
   * Handles viewing progress for a target
   * Sets up progress log modal and populates it with target progress
   * 
   * @param target Target to view progress for
   */
  const handleViewProgress = (target: Target) => {
    setSelectedTarget(target);
    setShowProgressLog(true);
  };

  const handleTogglePriority = async (target: Target) => {
    try {
      // First remove priority from any other target
      const updatedTargets = targets.map(t => ({
        ...t,
        isPriority: t.id === target.id ? !t.isPriority : false
      }));
      
      await saveTargets(updatedTargets);
      setTargets(updatedTargets);
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: target.isPriority ? 'Priority removed' : 'Target marked as priority'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update priority'
      });
    }
  };

  // Add handler for deleting progress
  const handleDeleteProgress = async (progressId: number) => {
    if (!selectedTarget) return;

    try {
      const updatedTargets = targets.map(target => {
        if (target.id === selectedTarget.id) {
          return {
            ...target,
            progress: target.progress.filter(p => p.id !== progressId)
          };
        }
        return target;
      });

      await saveTargets(updatedTargets);
      setTargets(updatedTargets);
      setShowProgressModal(false);
      setIsEditMode(false);
      setEditingProgress(null);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Progress entry deleted successfully!'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete progress'
      });
    }
  };

  // Add helper function to check if a target is completed
  const isTargetCompleted = (target: Target): boolean => {
    if (target.type === 'boolean') {
      return target.completed;
    }

    // For numeric targets, check if total progress meets or exceeds target value
    const totalProgress = target.progress.reduce((sum, p) => sum + p.value, 0);
    return totalProgress >= (target.target || 0);
  };

  // Update the targets list with filtered results
  const getFilteredTargets = () => {
    switch (filterType) {
      case 'ongoing':
        return targets.filter(target => !isTargetCompleted(target));
      case 'completed':
        return targets.filter(target => isTargetCompleted(target));
      default:
        return targets;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={[SharedStyles.screenContainer, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text 
          variant="headlineMedium" 
          style={[styles.headerTitle, { color: colors.text }]}
        >
          Targets
        </Text>
        <Button
          mode="contained"
          onPress={() => setShowModal(true)}
          icon="plus"
        >
          Add Target
        </Button>
      </View>

      <SegmentedButtons
        value={filterType}
        onValueChange={(value) => setFilterType(value as TargetFilter)}
        buttons={[
          { value: 'all', label: 'All' },
          { value: 'ongoing', label: 'In Progress' },
          { value: 'completed', label: 'Completed' }
        ]}
        style={styles.filterButtons}
      />

      <ScrollView 
        style={styles.targetsList}
        contentContainerStyle={[
          SharedStyles.contentContainer,
          styles.scrollContent,
          getFilteredTargets().length === 0 && styles.emptyContainer
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {getFilteredTargets().length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <MaterialCommunityIcons 
              name="target" 
              size={48} 
              color={colors.primary} 
            />
            <Text style={[styles.emptyStateText, { color: colors.text }]}>
              {filterType === 'all' 
                ? "You haven't set any targets yet."
                : filterType === 'ongoing'
                  ? "No targets in progress."
                  : "No completed targets yet."}
            </Text>
            {filterType === 'all' && (
              <Button
                mode="contained"
                onPress={() => {
                  setIsEditMode(false);
                  setShowModal(true);
                }}
                style={{ marginTop: 16 }}
              >
                Add Your First Target
              </Button>
            )}
          </View>
        ) : (
          getFilteredTargets().map(target => (
            <TargetCard
              key={target.id}
              target={target}
              onEdit={() => handleEditTarget(target)}
              onUpdateProgress={() => {
                setSelectedTarget(target);
                setShowProgressModal(true);
              }}
              onViewProgress={() => handleViewProgress(target)}
              onTogglePriority={handleTogglePriority}
            />
          ))
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={showModal}
          onDismiss={() => {
            setShowModal(false)
            setIsEditMode(false)
            resetNewTarget()
          }}
          contentContainerStyle={[
            styles.modal, 
            { 
              backgroundColor: colors.card,
              borderTopColor: colors.border 
            }
          ]}
        >
          <ScrollView>
            <Text 
              variant="titleLarge" 
              style={[styles.modalTitle, { color: colors.text }]}
            >
              {isEditMode ? 'Edit Target' : 'Add Target'}
            </Text>
            <TextInput
              label="Title"
              value={newTarget.title || ''}
              onChangeText={(value) => setNewTarget(prev => ({ ...prev, title: value }))}
              style={[styles.input, { backgroundColor: colors.input }]}
              textColor={colors.text}
            />

            <SegmentedButtons
              value={newTarget.type || 'numeric'}
              onValueChange={(value) => 
                setNewTarget({ ...newTarget, type: value as 'numeric' | 'boolean' })
              }
              buttons={[
                { value: 'numeric', label: 'Progress Target' },
                { value: 'boolean', label: 'Milestone' }
              ]}
              style={styles.typeButtons}
            />

            {newTarget.type === 'numeric' && (
              <View style={styles.row}>
                <TextInput
                  label="Target"
                  keyboardType="numeric"
                  value={String(newTarget.target || '')}
                  onChangeText={(value) => 
                    setNewTarget({ ...newTarget, target: Number(value) })
                  }
                  style={[styles.input, styles.flex1]}
                />
                <TextInput
                  label="Unit"
                  value={newTarget.unit || ''}
                  onChangeText={(value) => setNewTarget({ ...newTarget, unit: value })}
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
                value={format(new Date(newTarget.deadline!), 'MMM d, yyyy')}
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
                value={new Date(newTarget.deadline!)}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date && event.type !== 'dismissed') {
                    const selectedDate = new Date(date);
                    selectedDate.setHours(23, 59, 59, 999);
                    setNewTarget(prev => ({ 
                      ...prev, 
                      deadline: selectedDate.toISOString() 
                    }));
                  }
                }}
                minimumDate={new Date()}
              />
            )}

            <TextInput
              label="Course of Action (Optional)"
              placeholder="What's your plan to achieve this target?"
              value={newTarget.plan || ''}
              onChangeText={(value) => setNewTarget(prev => ({ ...prev, plan: value }))}
              multiline
              numberOfLines={4}
              style={[styles.input, styles.textArea]}
            />

            <View style={styles.modalButtons}>
              {isEditMode ? (
                <View style={styles.editButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setShowModal(false);
                      setIsEditMode(false);
                      resetNewTarget();
                    }}
                    style={styles.modalButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleUpdateTarget}
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
                      resetNewTarget();
                    }}
                    style={styles.modalButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleAddTarget}
                    style={styles.modalButton}
                  >
                    Add Target
                  </Button>
                </View>
              )}
            </View>
          </ScrollView>
        </Modal>

        <Modal
          visible={showProgressModal}
          onDismiss={() => {
            setShowProgressModal(false);
            setIsEditMode(false);
            setEditingProgress(null);
            setProgressUpdate('');
            setProgressNote('');
            setProgressDate(new Date().toISOString());
          }}
          contentContainerStyle={[
            styles.modal,
            styles.progressModal,
            { backgroundColor: colors.card }
          ]}
        >
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {selectedTarget?.type === 'boolean' ? 'Update Completion' : (isEditMode ? 'Edit Progress' : 'Update Progress')}
            </Text>
            <IconButton
              icon="close"
              onPress={() => {
                setShowProgressModal(false);
                setIsEditMode(false);
                setEditingProgress(null);
                setProgressUpdate('');
                setProgressNote('');
                setProgressDate(new Date().toISOString());
              }}
            />
          </View>
          
          <ScrollView style={styles.modalScroll}>
            <Text style={[styles.modalSubtitle, { color: colors.text }]}>
              {selectedTarget?.title}
            </Text>

            {selectedTarget?.type === 'boolean' ? (
              // Boolean target content
              <TextInput
                label="Note (Optional)"
                value={progressNote}
                onChangeText={setProgressNote}
                style={[styles.input, { backgroundColor: colors.input }]}
                textColor={colors.text}
                multiline
              />
            ) : (
              // Numeric target content
              <>
                <TextInput
                  label="Progress"
                  value={progressUpdate}
                  onChangeText={setProgressUpdate}
                  keyboardType="numeric"
                  style={[styles.input, { backgroundColor: colors.input }]}
                  textColor={colors.text}
                />
                
                <TextInput
                  label="Note (Optional)"
                  value={progressNote}
                  onChangeText={setProgressNote}
                  style={[styles.input, { backgroundColor: colors.input }]}
                  textColor={colors.text}
                  multiline
                />
              </>
            )}

            <DateTimePicker
              value={new Date(progressDate)}
              onChange={(event, date) => {
                if (date) setProgressDate(date.toISOString());
              }}
            />
          </ScrollView>

          <View style={styles.submitButtonContainer}>
            <Button 
              mode="contained"
              onPress={handleUpdateProgress}
              style={styles.submitButton}
              disabled={selectedTarget?.type === 'numeric' && !progressUpdate}
            >
              {selectedTarget?.type === 'boolean' ? 'Mark as Complete' : (isEditMode ? 'Update' : 'Log Progress')}
            </Button>
          </View>
        </Modal>

        <Modal
          visible={showDeleteConfirm}
          onDismiss={() => setShowDeleteConfirm(false)}
          contentContainerStyle={[
            styles.modal, 
            styles.confirmModal,
            { backgroundColor: colors.card }
          ]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Delete Target
          </Text>
          <Text style={[styles.confirmText, { color: colors.text }]}>
            Are you sure you want to delete this target? This action cannot be undone.
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
                handleDeleteTarget();
              }}
              style={[styles.modalButton, styles.confirmDeleteButton]}
              buttonColor={colors.error}
            >
              Delete
            </Button>
          </View>
        </Modal>

        <Modal
          visible={showProgressLog}
          onDismiss={() => {
            setShowProgressLog(false);
            setSelectedTarget(null);
          }}
          contentContainerStyle={[
            styles.modal, 
            styles.progressLogModal,
            { backgroundColor: colors.card }
          ]}
        >
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Progress Log</Text>
              {selectedTarget?.completed && selectedTarget.completedAt && (
                <Text style={[styles.completionStatus, { color: colors.success }]}>
                  Completed on {format(new Date(selectedTarget.completedAt), 'MMM d, yyyy')}
                </Text>
              )}
            </View>
            <IconButton
              icon="close"
              onPress={() => {
                setShowProgressLog(false);
                setSelectedTarget(null);
              }}
            />
          </View>

          <ScrollView style={styles.modalScroll}>
            {selectedTarget?.progress.length === 0 ? (
              <Text style={[styles.emptyLogText, { color: colors.textSecondary }]}>
                No progress entries yet.
              </Text>
            ) : (
              selectedTarget?.progress.map((progress) => (
                <TouchableOpacity
                  key={progress.id}
                  style={styles.logEntry}
                  onPress={() => {
                    setProgressUpdate(progress.value.toString());
                    setProgressNote(progress.note || '');
                    setProgressDate(progress.timestamp);
                    setIsEditMode(true);
                    setShowProgressLog(false); // Close log first
                    setShowProgressModal(true);
                    setEditingProgress(progress);
                  }}
                >
                  <View style={styles.logHeader}>
                    <View>
                      <Text style={[styles.logDate, { color: colors.textSecondary }]}>
                        {format(new Date(progress.timestamp), 'MMM d, yyyy')}
                      </Text>
                      <Text style={[styles.logValue, { color: colors.text }]}>
                        {progress.value} {selectedTarget.unit}
                      </Text>
                      {progress.note && (
                        <Text style={[styles.logNote, { color: colors.textSecondary }]}>
                          {progress.note}
                        </Text>
                      )}
                    </View>
                    <Menu
                      visible={progress.id === editingProgress?.id}
                      onDismiss={() => setEditingProgress(null)}
                      anchor={
                        <IconButton
                          icon="dots-vertical"
                          size={20}
                          onPress={() => setEditingProgress(progress)}
                        />
                      }
                    >
                      <Menu.Item
                        onPress={() => {
                          setProgressUpdate(progress.value.toString());
                          setProgressNote(progress.note || '');
                          setProgressDate(progress.timestamp);
                          setIsEditMode(true);
                          setShowProgressLog(false);
                          setShowProgressModal(true);
                          setEditingProgress(progress);
                        }}
                        title="Edit"
                      />
                      <Menu.Item
                        onPress={() => handleDeleteProgress(progress.id)}
                        title="Delete"
                        titleStyle={{ color: colors.error }}
                      />
                    </Menu>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  filterButtons: {
    margin: 16,
  },
  targetsList: {
    flex: 1,
  },
  targetCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  targetTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  targetSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  progressContainer: {
    marginVertical: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 4,
    textAlign: 'right',
  },
  emptyState: {
    margin: 24,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
  },
  modal: {
    margin: 20,
    borderRadius: 12,
    width: '90%',
    maxWidth: 350,
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 0,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  modalHelper: {
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
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
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
    top: '50%',
    left: '50%',
    transform: [
      { translateX: -175 },
      { translateY: -180 }
    ],
    width: 350,
    maxHeight: 360,
    padding: 0,
    zIndex: 999,
    marginHorizontal: 'auto',
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 24,
      },
    }),
  },
  modalScroll: {
    padding: 16,
    paddingTop: 8,
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
    marginBottom: 12,
  },
  confirmModal: {
    maxWidth: 400,
    alignSelf: 'center',
  },
  confirmText: {
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  logEntry: {
    padding: 16,
    backgroundColor: Colors.dark.input,
    borderRadius: 8,
    marginBottom: 12,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logDate: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  logValue: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '500',
  },
  logNote: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  progressLogModal: {
    maxWidth: 500,
    height: '80%',
    alignSelf: 'center',
    padding: 0,
  },
  emptyLogText: {
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  submitButtonContainer: {
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    backgroundColor: Colors.dark.card,
  },
  submitButton: {
    marginVertical: 8,
    backgroundColor: Colors.dark.primary,
  },
  completionStatus: {
    fontSize: 12,
    marginTop: 4,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
}) 