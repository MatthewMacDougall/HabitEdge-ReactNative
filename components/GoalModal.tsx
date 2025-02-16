/**
 * GoalModal Component
 * 
 * Modal for creating or editing goals. Handles both numeric and boolean goals.
 * 
 * Features:
 * - Goal title input
 * - Goal type selection
 * - Target value for numeric goals
 * - Unit specification
 * - Deadline selection
 * - Delete option in edit mode
 * 
 * @example
 * <GoalModal
 *   visible={showModal}
 *   isEditMode={false}
 *   initialGoal={newGoal}
 *   onDismiss={() => setShowModal(false)}
 *   onSave={handleSaveGoal}
 * />
 */

import { StyleSheet } from 'react-native';
import { Modal, Portal, Text, Button, TextInput } from 'react-native-paper';
import { Goal } from "@/types/goals";
import { useState } from "react";
import { Colors } from '@/constants/Colors';

interface GoalModalProps {
  /** Controls modal visibility */
  visible: boolean;
  /** Whether the modal is in edit mode */
  isEditMode: boolean;
  /** Initial goal data for editing */
  initialGoal?: Partial<Goal>;
  /** Callback when modal is dismissed */
  onDismiss: () => void;
  /** Callback when goal is saved */
  onSave: (goal: Partial<Goal>) => Promise<void>;
  /** Optional callback for deleting goal in edit mode */
  onDelete?: () => Promise<void>;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  visible,
  isEditMode,
  initialGoal,
  onDismiss,
  onSave,
  onDelete,
}) => {
  /** Form state for goal data */
  const [goalData, setGoalData] = useState<Partial<Goal>>(initialGoal || {});
  /** Controls delete confirmation dialog */
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Text>Modal Content</Text>
        {/* Other modal content */}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    padding: 20,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
  },
  // Add other styles
}); 