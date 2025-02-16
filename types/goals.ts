export interface GoalProgress {
  id: number;
  value: number;
  timestamp: string;
  note?: string;
}

export interface Goal {
  id: number;
  title: string;
  type: 'numeric' | 'boolean';
  target?: number;
  progress: GoalProgress[];
  deadline: string;
  completed: boolean;
  createdAt: string;
  unit?: string;
}

export type GoalFilter = 'all' | 'ongoing' | 'completed'; 