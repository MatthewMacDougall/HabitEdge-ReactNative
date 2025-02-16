/**
 * Represents a journal entry for tracking training sessions
 */
export interface JournalEntry {
  /** Unique identifier for the entry */
  id: number;
  /** Date of the training session */
  date: string;
  /** Title/summary of the session */
  title: string;
  /** Detailed notes about the session */
  notes: string;
  /** Type of training performed */
  type: TrainingType;
  /** Rating of the session (1-5) */
  rating: number;
  /** Duration in minutes */
  duration: number;
  /** Associated targets worked on */
  relatedTargets?: number[];  // Changed from relatedTargets
  /** Metrics tracked during session */
  metrics?: SessionMetric[];
  /** Creation timestamp */
  createdAt: string;
  /** Last modified timestamp */
  updatedAt: string;
  gameDetails?: {
    score: GameScore;
    // other game details
  };
}

/**
 * Types of training that can be logged
 */
export type TrainingType = 
  | 'strength'
  | 'cardio'
  | 'skill'
  | 'recovery'
  | 'competition'
  | 'other';

/**
 * Metrics that can be tracked during a session
 */
export interface SessionMetric {
  /** Name of the metric */
  name: string;
  /** Value recorded */
  value: number;
  /** Unit of measurement */
  unit: string;
}

export interface GameScore {
  yourTeam: string;
  opponent: string;
} 