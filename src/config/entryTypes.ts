export type EntryType = 'game' | 'practice' | 'workout' | 'film';

export interface GameDetails {
  opponent?: string;
  result?: 'win' | 'loss' | 'draw';
  score?: string;
}

export interface Metric {
  id: string;
  label: string;
  description: string;
  min: number;
  max: number;
}

export interface Prompt {
  id: string;
  label: string;
  placeholder: string;
  required?: boolean;
}

interface EntryTypeConfig {
  label: string;
  metrics: Metric[];
  prompts: Prompt[];
}

// Common metrics shared across all entry types
const commonMetrics: Metric[] = [
  {
    id: 'overallRating',
    label: 'Overall Rating',
    description: 'Rate your overall performance',
    min: 1,
    max: 10
  },
  {
    id: 'energy',
    label: 'Energy Level',
    description: 'How was your energy throughout?',
    min: 1,
    max: 10
  },
  {
    id: 'mentalFocus',
    label: 'Mental Focus',
    description: 'How focused were you?',
    min: 1,
    max: 10
  },
  {
    id: 'effortLevel',
    label: 'Effort Level',
    description: 'How would you rate your effort level?',
    min: 1,
    max: 10
  }
];

export const entryTypeConfigs: Record<EntryType, EntryTypeConfig> = {
  game: {
    label: 'Game',
    metrics: [
      ...commonMetrics,
      {
        id: 'teamwork',
        label: 'Teamwork',
        description: 'How well did you work with your teammates?',
        min: 1,
        max: 10
      },
      {
        id: 'performance',
        label: 'Performance',
        description: 'Rate your individual performance',
        min: 1,
        max: 10
      }
    ],
    prompts: [
      {
        id: 'highlights',
        label: 'Key Highlights',
        placeholder: 'What were your best moments in the game?',
        required: true
      },
      {
        id: 'improvements',
        label: 'Areas for Improvement',
        placeholder: 'What could you have done better?',
        required: true
      },
      {
        id: 'learnings',
        label: 'Key Learnings',
        placeholder: 'What did you learn from this game?'
      }
    ]
  },
  practice: {
    label: 'Practice',
    metrics: [
      ...commonMetrics,
      {
        id: 'skillProgress',
        label: 'Skill Progress',
        description: 'How much did you improve your skills?',
        min: 1,
        max: 10
      },
      {
        id: 'effort',
        label: 'Effort Level',
        description: 'How much effort did you put in?',
        min: 1,
        max: 10
      }
    ],
    prompts: [
      {
        id: 'focusAreas',
        label: 'Focus Areas',
        placeholder: 'What skills or aspects did you work on?',
        required: true
      },
      {
        id: 'improvements',
        label: 'Progress Made',
        placeholder: 'What improvements did you notice?',
        required: true
      },
      {
        id: 'nextSteps',
        label: 'Next Steps',
        placeholder: 'What will you focus on next time?'
      }
    ]
  },
  workout: {
    label: 'Workout',
    metrics: [
      ...commonMetrics,
      {
        id: 'intensity',
        label: 'Intensity',
        description: 'How intense was your workout?',
        min: 1,
        max: 10
      },
      {
        id: 'recovery',
        label: 'Recovery',
        description: 'How well did you recover between sets?',
        min: 1,
        max: 10
      }
    ],
    prompts: [
      {
        id: 'exercises',
        label: 'Key Exercises',
        placeholder: 'What exercises did you focus on?',
        required: true
      },
      {
        id: 'challenges',
        label: 'Challenges',
        placeholder: 'What was challenging about this workout?',
        required: true
      },
      {
        id: 'adjustments',
        label: 'Adjustments',
        placeholder: 'What adjustments did you make during the workout?'
      }
    ]
  },
  film: {
    label: 'Film Session',
    metrics: [
      ...commonMetrics,
      {
        id: 'understanding',
        label: 'Understanding',
        description: 'How well did you understand the material?',
        min: 1,
        max: 10
      },
      {
        id: 'application',
        label: 'Practical Application',
        description: 'How applicable were the learnings?',
        min: 1,
        max: 10
      }
    ],
    prompts: [
      {
        id: 'keyTakeaways',
        label: 'Key Takeaways',
        placeholder: 'What were your main learnings from this session?',
        required: true
      },
      {
        id: 'implementation',
        label: 'Implementation Plan',
        placeholder: 'How will you apply these learnings?',
        required: true
      },
      {
        id: 'questions',
        label: 'Questions/Clarifications',
        placeholder: 'What questions came up during the session?'
      }
    ]
  }
}; 