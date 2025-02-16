/**
 * ProgressModal Component
 * 
 * Modal for updating goal progress. Provides different interfaces for
 * numeric and boolean goals.
 * 
 * Features:
 * - Numeric input for progress amount
 * - Optional note field
 * - Current total display
 * - Boolean toggle for completion status
 * 
 * @example
 * <ProgressModal
 *   visible={showModal}
 *   goal={selectedGoal}
 *   onDismiss={() => setShowModal(false)}
 *   onUpdate={handleProgressUpdate}
 * />
 */

interface ProgressModalProps {
  /** Controls modal visibility */
  visible: boolean;
  /** The goal being updated */
  goal: Goal | null;
  /** Callback when modal is dismissed */
  onDismiss: () => void;
  /** Callback when progress is updated */
  onUpdate: (progress: number, note?: string) => Promise<void>;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  visible,
  goal,
  onDismiss,
  onUpdate,
}) => {
  /** Progress amount for numeric goals */
  const [amount, setAmount] = useState('');
  /** Optional note for progress entry */
  const [note, setNote] = useState('');

  return (
    <Modal visible={visible} onDismiss={onDismiss}>
      {/* Modal implementation */}
    </Modal>
  );
}; 