/**
 * TargetCard Component
 * 
 * Displays an individual target with its progress, deadline, and actions.
 * Used in the targets list to show target details and provide interaction options.
 * 
 * @example
 * <TargetCard
 *   target={targetData}
 *   onEdit={() => handleEdit(targetData)}
 *   onUpdateProgress={() => handleProgress(targetData)}
 * />
 */
import { StyleSheet } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { Target } from '@/types/targets';
import { Colors } from '@/constants/Colors';
import { format } from 'date-fns';

interface TargetCardProps {
  /** The target to display */
  target: Target;
  /** Callback when edit button is pressed */
  onEdit: (target: Target) => void;
  /** Callback when progress update button is pressed */
  onUpdateProgress: (target: Target) => void;
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
 * Calculates progress percentage for a target
 */
const calculateProgress = (target: Target): number => {
  if (target.type === 'boolean') {
    return target.completed ? 100 : 0;
  }
  if (!target.target || !target.progress) return 0;
  const total = target.progress.reduce((sum, p) => sum + p.value, 0);
  return Math.min(100, (total / target.target) * 100);
};

export const TargetCard: React.FC<TargetCardProps> = ({ target, onEdit, onUpdateProgress }) => {
  const daysRemaining = getDaysRemaining(target.deadline);
  const progress = calculateProgress(target);

  return (
    <Card style={styles.targetCard}>
      <Card.Content>
        <Text style={styles.title}>{target.title}</Text>
        {/* Add card implementation */}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  targetCard: {
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