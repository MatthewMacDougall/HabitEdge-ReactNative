/**
 * Represents a target in the application
 */
export interface Target {
  /** Unique identifier for the target */
  id: number;
  /** Title/description of the target */
  title: string;
  /** Type of target - either numeric (with progress) or boolean (complete/incomplete) */
  type: 'numeric' | 'boolean';
  /** Target value for numeric targets */
  target?: number;
  /** Unit of measurement for numeric targets (e.g., "kg", "miles") */
  unit?: string;
  /** Array of progress entries for the target */
  progress: TargetProgress[];
  /** ISO string of when the target should be completed */
  deadline: string;
  /** Whether the target has been completed */
  completed: boolean;
  /** ISO string of when the target was created */
  createdAt: string;
  /** Optional plan/course of action to achieve the target */
  plan?: string;
  /** Whether this target is marked as priority */
  isPriority?: boolean;
  completedAt?: string; // ISO string of when the target was completed
}

/**
 * Represents a progress entry for a target
 */
export interface TargetProgress {
  /** Unique identifier for the progress entry */
  id: number;
  /** Numeric value of progress made */
  value: number;
  /** Optional note about the progress entry */
  note?: string;
  /** ISO string of when the progress was logged */
  timestamp: string;
}

/**
 * Filter options for displaying targets
 */
export type TargetFilter = 'all' | 'ongoing' | 'completed'; 