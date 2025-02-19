/**
 * Represents a journal entry for tracking training sessions
 */
export interface JournalEntry {
  /** Unique identifier for the entry */
  id: number;
  /** Type of entry (game, practice, etc) */
  type: EntryType;
  /** Date of the session */
  date: string;
  /** Title/summary of the session */
  title: string;
  /** Metrics tracked during session (e.g., energy: 8, focus: 7) */
  metrics: Record<string, number>;
  /** Responses to entry type specific prompts */
  prompts: Record<string, string>;
  /** Optional media attachments */
  media?: {
    [key: string]: Array<{
      type: 'upload' | 'link';
      url: string;
      name?: string;
      title?: string;
    }>;
  };
  /** Optional game-specific details */
  gameDetails?: GameDetails;
  /** Creation timestamp */
  createdAt: string;
  /** Last modified timestamp */
  updatedAt: string;
}

/**
 * Types of entries that can be logged
 */
export enum EntryType {
  Game = 'game',
  Practice = 'practice',
  Workout = 'workout',
  Film = 'film'
}

/**
 * Game score details
 */
export interface GameScore {
  yourTeam: string;
  opponent: string;
}

/**
 * Form data for creating/editing entries
 */
export interface EntryFormData {
  type: string;
  metrics: Record<string, number>;
  prompts: Record<string, string>;
  media: Record<string, any>;
  gameDetails?: GameDetails;
}

// Then create a type guard or specific interface for game entries
export interface GameEntryFormData extends EntryFormData {
  type: 'game';
  gameDetails: GameDetails;
}

/**
 * Game details
 */
export interface GameDetails {
  opponent: string;
  result: 'win' | 'loss' | 'draw';
  score: GameScore;
}

export interface GameEntry extends JournalEntry {
  type: 'game';
  gameDetails: GameDetails;
} 