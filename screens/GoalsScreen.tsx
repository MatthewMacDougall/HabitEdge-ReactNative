import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
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
  Divider
} from 'react-native-paper'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'
import { Colors } from '../constants/Colors'
import { Goal } from '../types/goals'
import Toast from 'react-native-toast-message'
import { saveGoals, loadGoals } from '../utils/storage'
import { useFocusEffect } from '@react-navigation/native'

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Goals</Text>
        <Button
          mode="contained"
          onPress={() => setShowModal(true)}
          icon="plus"
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.light.primary} />
        ) : goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No goals yet. Tap the "Add Goal" button to create your first goal!
            </Text>
          </View>
        ) : (
          filteredGoals.map(goal => (
            <Card key={goal.id} style={styles.goalCard}>
              <Card.Title
                title={goal.title}
                subtitle={`${getDaysRemaining(goal.deadline)} days remaining`}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="delete"
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
                    style={styles.progressInput}
                  />
                ) : (
                  <Button
                    mode={goal.completed ? "contained" : "outlined"}
                    onPress={() => toggleComplete(goal.id)}
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
          contentContainerStyle={styles.modal}
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
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  filterButtons: {
    marginBottom: 16
  },
  goalsList: {
    flex: 1
  },
  goalCard: {
    marginBottom: 12,
    borderRadius: 12
  },
  progressContainer: {
    marginVertical: 8
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 4
  },
  progressText: {
    marginTop: 4,
    textAlign: 'right',
    color: Colors.light.textSecondary
  },
  progressInput: {
    marginTop: 8
  },
  modal: {
    backgroundColor: Colors.light.background,
    padding: 20,
    margin: 20,
    borderRadius: 12
  },
  modalTitle: {
    marginBottom: 16
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40
  },
  emptyStateText: {
    textAlign: 'center',
    color: Colors.light.textSecondary,
    fontSize: 16
  }
}) 