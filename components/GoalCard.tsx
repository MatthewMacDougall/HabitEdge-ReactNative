/**
 * GoalCard Component
 * 
 * Displays an individual goal with its progress, deadline, and actions.
 * Used in the goals list to show goal details and provide interaction options.
 * 
 * @example
 * <GoalCard
 *   goal={goalData}
 *   onEdit={() => handleEdit(goalData)}
 *   onUpdateProgress={() => handleProgress(goalData)}
 * />
 */
import { StyleSheet } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { Goal } from '@/types/goals';
import { Colors } from '@/constants/Colors';
import { format } from 'date-fns';

interface GoalCardProps {
  /** The goal to display */
  goal: Goal;
  /** Callback when edit button is pressed */
  onEdit: (goal: Goal) => void;
  /** Callback when progress update button is pressed */
  onUpdateProgress: (goal: Goal) => void;
}

/**
 * Calculates days remaining until deadline
 */
const getDaysRemaining = (deadline: string): number => {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculates progress percentage for a goal
 */
const calculateProgress = (goal: Goal): number => {
  if (goal.type === 'boolean') {
    return goal.completed ? 100 : 0;
  }
  if (!goal.target || !goal.progress) return 0;
  const total = goal.progress.reduce((sum, p) => sum + p.value, 0);
  return Math.min(100, (total / goal.target) * 100);
};

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onUpdateProgress }) => {
  const daysRemaining = getDaysRemaining(goal.deadline);
  const progress = calculateProgress(goal);

  return (
    <Card style={styles.goalCard}>
      <Card.Content>
        <Text style={styles.title}>{goal.title}</Text>
        {/* Add card implementation */}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  goalCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.dark.card,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
  },
  // Add other styles
}); 