/**
 * Represents a goal in the application
 */
export interface Goal {
  /** Unique identifier for the goal */
  id: number;
  /** Title/description of the goal */
  title: string;
  /** Type of goal - either numeric (with progress) or boolean (complete/incomplete) */
  type: 'numeric' | 'boolean';
  /** Target value for numeric goals */
  target?: number;
  /** Unit of measurement for numeric goals (e.g., "kg", "miles") */
  unit?: string;
  /** Array of progress entries for the goal */
  progress: GoalProgress[];
  /** ISO string of when the goal should be completed */
  deadline: string;
  /** Whether the goal has been completed */
  completed: boolean;
  /** ISO string of when the goal was created */
  createdAt: string;
}

/**
 * Represents a progress entry for a goal
 */
export interface GoalProgress {
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
 * Filter options for displaying goals
 */
export type GoalFilter = 'all' | 'ongoing' | 'completed'; 