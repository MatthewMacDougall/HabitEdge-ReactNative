/**
 * JournalEntry Component
 * 
 * Displays a single journal entry with training details.
 * 
 * Features:
 * - Shows session summary
 * - Displays metrics
 * - Links to related targets
 * - Edit/delete options
 */

interface JournalEntryProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: number) => void;
} 