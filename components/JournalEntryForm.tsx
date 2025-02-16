/**
 * JournalEntryForm Component
 * 
 * Form for creating/editing journal entries.
 * 
 * Features:
 * - Date selection
 * - Training type selection
 * - Duration input
 * - Notes editor
 * - Metric tracking
 * - Target linking
 */

interface JournalEntryFormProps {
  initialData?: Partial<JournalEntry>;
  onSave: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
} 