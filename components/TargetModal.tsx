/**
 * TargetModal Component
 * 
 * Modal for creating or editing targets. Handles both numeric and boolean targets.
 * 
 * Features:
 * - Target title input
 * - Target type selection
 * - Target value for numeric targets
 * - Unit specification
 * - Deadline selection
 * - Delete option in edit mode
 * 
 * @example
 * <TargetModal
 *   visible={showModal}
 *   isEditMode={false}
 *   initialTarget={newTarget}
 *   onDismiss={() => setShowModal(false)}
 *   onSave={handleSaveTarget}
 * />
 */

import { StyleSheet } from 'react-native';
import { Modal, Portal, Text, Button, TextInput } from 'react-native-paper';
import { Target } from "@/types/targets";
import { useState } from "react";
import { Colors } from '@/constants/Colors';

interface TargetModalProps {
  /** Controls modal visibility */
  visible: boolean;
  /** Whether the modal is in edit mode */
  isEditMode: boolean;
  /** Initial target data for editing */
  initialTarget?: Partial<Target>;
  /** Callback when modal is dismissed */
  onDismiss: () => void;
  /** Callback when target is saved */
  onSave: (target: Partial<Target>) => Promise<void>;
  /** Optional callback for deleting target in edit mode */
  onDelete?: () => Promise<void>;
}

export const TargetModal: React.FC<TargetModalProps> = ({
  visible,
  isEditMode,
  initialTarget,
  onDismiss,
  onSave,
  onDelete,
}) => {
  /** Form state for target data */
  const [targetData, setTargetData] = useState<Partial<Target>>(initialTarget || {});
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