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
import { StyleSheet, View } from 'react-native';
import { Card, Text, IconButton, Menu, Button } from 'react-native-paper';
import { Target } from '@/types/targets';
import { Colors } from '@/constants/Colors';
import { format } from 'date-fns';
import { useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';

interface TargetCardProps {
  /** The target to display */
  target: Target;
  /** Callback when edit button is pressed */
  onEdit: (target: Target) => void;
  /** Callback when progress update button is pressed */
  onUpdateProgress: (target: Target) => void;
  /** Callback when view progress button is pressed */
  onViewProgress?: (target: Target) => void;
  /** Callback when priority toggle button is pressed */
  onTogglePriority: (target: Target) => Promise<void>;
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

const TargetCard: React.FC<TargetCardProps> = ({ target, onEdit, onUpdateProgress, onViewProgress, onTogglePriority }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const daysRemaining = getDaysRemaining(target.deadline);
  const progress = calculateProgress(target);

  return (
    <Card style={[styles.targetCard, { backgroundColor: colors.card }]}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{target.title}</Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            {!target.completed && (
              <Menu.Item 
                onPress={() => {
                  setMenuVisible(false);
                  onEdit(target);
                }} 
                title="Edit Target" 
              />
            )}
            <Menu.Item 
              onPress={() => {
                setMenuVisible(false);
                onViewProgress?.(target);
              }} 
              title="View Progress Log" 
            />
            {!target.completed && (
              <Menu.Item 
                onPress={() => {
                  setMenuVisible(false);
                  onTogglePriority(target);
                }} 
                title={target.isPriority ? "Remove Priority" : "Mark as Priority"}
                leadingIcon={target.isPriority ? "star-off" : "star"}
              />
            )}
          </Menu>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill, 
              { 
                width: `${progress}%`,
                backgroundColor: target.completed 
                  ? colors.success 
                  : target.isPriority 
                    ? colors.primary 
                    : colors.progressFill 
              }
            ]} />
          </View>
          <Text style={[styles.progressText, { color: colors.text }]}>
            {target.type === 'numeric' 
              ? `${target.progress.reduce((sum, p) => sum + p.value, 0)} / ${target.target} ${target.unit || ''}`
              : target.completed ? 'Completed' : 'In Progress'
            }
          </Text>
        </View>

        {target.plan && !target.completed && (
          <View style={[styles.planContainer, { backgroundColor: colors.input }]}>
            <Text style={[styles.planLabel, { color: colors.textSecondary }]}>Course of Action:</Text>
            <Text style={[styles.planText, { color: colors.text }]} numberOfLines={3}>{target.plan}</Text>
          </View>
        )}

        <View style={styles.footer}>
          {target.completed ? (
            <Text style={[styles.completedDate, { color: colors.success }]}>
              {target.completedAt 
                ? `Completed on ${format(new Date(target.completedAt), 'MMM d, yyyy')}`
                : 'Completed'
              }
            </Text>
          ) : (
            <>
              <Text style={[styles.deadline, { color: colors.textSecondary }]}>
                {daysRemaining > 0 
                  ? `${daysRemaining} days remaining`
                  : 'Deadline passed'
                }
              </Text>
              <Button 
                mode="contained"
                onPress={() => onUpdateProgress(target)}
              >
                Update Progress
              </Button>
            </>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  targetCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planContainer: {
    marginTop: 12,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  planLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  planText: {
    fontSize: 14,
    lineHeight: 20,
  },
  progressContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  progressBar: {
    height: 20,
    backgroundColor: Colors.dark.input,
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.dark.progressFill,
  },
  progressText: {
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  deadline: {
    fontSize: 14,
    flex: 1,
  },
  completedDate: {
    fontSize: 14,
    color: Colors.dark.success,
    flex: 1,
  },
});

export default TargetCard; 