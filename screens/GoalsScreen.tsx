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
  Surface
} from 'react-native-paper'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'
import { Colors } from '../constants/Colors'
import { Goal } from '../types/goals'
import Toast from 'react-native-toast-message'
import { saveGoals, loadGoals } from '../utils/storage'
import { useFocusEffect } from '@react-navigation/native'
import { SharedStyles } from '@/constants/Styles'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'ongoing' | 'completed'>('all')
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    type: 'numeric',
    target: undefined,
    current: 0,
    deadline: new Date().toISOString(),
    completed: false
  })

  useFocusEffect(
    useCallback(() => {
      loadStoredGoals()
    }, [])
  )

  const loadStoredGoals = async () => {
    setLoading(true)
    const storedGoals = await loadGoals()
    setGoals(storedGoals)
    setLoading(false)
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadStoredGoals()
    setRefreshing(false)
  }, [])

  useEffect(() => {
    if (!loading) {
      saveGoals(goals)
    }
  }, [goals, loading])

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

    const goal: Goal = {
      id: Date.now(),
      title: newGoal.title,
      type: newGoal.type!,
      target: newGoal.target,
      current: newGoal.current || 0,
      deadline: newGoal.deadline!,
      completed: false,
      createdAt: new Date().toISOString(),
      unit: newGoal.unit
    }

    const updatedGoals = [...goals, goal]
    setGoals(updatedGoals)
    await saveGoals(updatedGoals)
    
    setShowModal(false)
    setNewGoal({
      type: 'numeric',
      target: undefined,
      current: 0,
      deadline: new Date().toISOString(),
      completed: false
    })
    
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Goal added successfully!'
    })
  }

  const updateProgress = async (goalId: number, value: number) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const newCurrent = Math.min(value, goal.target || value)
        const completed = goal.type === 'numeric' ? 
          newCurrent >= (goal.target || 0) : value === 1
        return { ...goal, current: newCurrent, completed }
      }
      return goal
    })
    
    setGoals(updatedGoals)
    await saveGoals(updatedGoals)
  }

  const toggleComplete = async (goalId: number) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        return { ...goal, completed: !goal.completed }
      }
      return goal
    })
    
    setGoals(updatedGoals)
    await saveGoals(updatedGoals)
  }

  const deleteGoal = async (goalId: number) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId)
    setGoals(updatedGoals)
    await saveGoals(updatedGoals)
    
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Goal deleted'
    })
  }

  const calculateProgress = (goal: Goal): number => {
    if (goal.type === 'boolean') {
      return goal.completed ? 100 : 0
    }
    if (!goal.target) return 0
    return Math.min(100, (goal.current || 0) / goal.target * 100)
  }

  const getDaysRemaining = (deadline: string): number => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

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
        onValueChange={value => setFilterType(value as typeof filterType)}
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
        {loading ? (
          <ActivityIndicator size="large" color={Colors.dark.primary} />
        ) : goals.length === 0 ? (
          <Surface style={styles.emptyState}>
            <MaterialCommunityIcons 
              name="target" 
              size={48} 
              color={Colors.dark.textSecondary} 
            />
            <Text style={styles.emptyStateText}>
              No goals yet. Tap the "Add Goal" button to create your first goal!
            </Text>
          </Surface>
        ) : (
          filteredGoals.map(goal => (
            <Card key={goal.id} style={[SharedStyles.card, styles.goalCard]}>
              <Card.Title
                title={goal.title}
                titleStyle={styles.goalTitle}
                subtitle={`${getDaysRemaining(goal.deadline)} days remaining`}
                subtitleStyle={styles.goalSubtitle}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="delete"
                    iconColor={Colors.dark.error}
                    onPress={() => deleteGoal(goal.id)}
                  />
                )}
              />
              <Card.Content>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { width: `${calculateProgress(goal)}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {goal.type === 'numeric' 
                      ? `${goal.current}/${goal.target} ${goal.unit || ''}`
                      : goal.completed ? 'Completed' : 'In Progress'
                    }
                  </Text>
                </View>
                {goal.type === 'numeric' ? (
                  <TextInput
                    keyboardType="numeric"
                    value={String(goal.current)}
                    onChangeText={(value) => updateProgress(goal.id, Number(value))}
                    style={[SharedStyles.input, styles.progressInput]}
                    theme={{ colors: { text: Colors.dark.text } }}
                  />
                ) : (
                  <Button
                    mode={goal.completed ? "contained" : "outlined"}
                    onPress={() => toggleComplete(goal.id)}
                    style={styles.completeButton}
                  >
                    {goal.completed ? "Completed" : "Mark Complete"}
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
          onDismiss={() => setShowModal(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: Colors.dark.card }]}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>New Goal</Text>
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

          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              label="Deadline"
              value={format(new Date(newGoal.deadline!), 'MMM d, yyyy')}
              editable={false}
              right={<TextInput.Icon icon="calendar" />}
              style={styles.input}
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={new Date(newGoal.deadline!)}
              mode="date"
              onChange={(event, date) => {
                setShowDatePicker(false)
                if (date) {
                  setNewGoal({ ...newGoal, deadline: date.toISOString() })
                }
              }}
              minimumDate={new Date()}
            />
          )}

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowModal(false)}
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
        </Modal>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
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
    marginBottom: 12,
  },
  goalTitle: {
    color: Colors.dark.text,
    fontWeight: '600',
  },
  goalSubtitle: {
    color: Colors.dark.textSecondary,
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
  progressInput: {
    marginTop: 8,
    backgroundColor: Colors.dark.input,
  },
  completeButton: {
    marginTop: 8,
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
  input: {
    marginBottom: 12
  },
  typeButtons: {
    marginBottom: 12
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  flex1: {
    flex: 1
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16
  },
  modalButton: {
    minWidth: 100
  },
}) 