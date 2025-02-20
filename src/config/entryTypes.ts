export enum EntryType {
  Game = 'game',
  Practice = 'practice',
  Workout = 'workout',
  Film = 'film'
}

export interface GameDetails {
  opponent?: string;
  result?: 'win' | 'loss' | 'draw';
  score?: string;
}

export interface Metric {
  id: string;
  label: string;
  description?: string;
  min?: number;
  max?: number;
  defaultValue?: number;
}

export interface Prompt {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  minLength?: number;
}

export interface MediaConfig {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  allowUpload?: boolean;
  allowLinks?: boolean;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export interface FilmDetails {
  filmType: 'pros' | 'opponents' | 'team' | 'other';
  otherDescription?: string;
}

export interface EntryTypeConfig {
  type: EntryType;
  label: string;
  description?: string;
  metrics: Metric[];
  prompts: Prompt[];
  media: MediaConfig[];
  filmDetails?: {
    label: string;
    description?: string;
    options: Array<{
      label: string;
      value: FilmDetails['filmType'];
    }>;
  };
}

// Common metrics shared across all entry types
const commonMetrics: Metric[] = [
  {
    id: 'overallRating',
    label: 'Performance Rating',
    description: 'How would you grade your overall performance?',
    min: 1,
    max: 10
  },
  {
    id: 'energy',
    label: 'Energy Level',
    description: 'How was your energy level?',
    min: 1,
    max: 10
  },
  {
    id: 'mentalFocus',
    label: 'Mental Focus',
    description: 'How focused were you throughout?',
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

const media: MediaConfig[] = [
  {
    id: 'mediaUpload',
    label: 'Upload Media (optional)',
    description: 'Attach any relevant media files (videos, photos, etc.)',
    acceptedTypes: ['image/*', 'video/*', 'application/pdf'],
    maxFiles: 50,
    required: false,
    allowUpload: true,
    allowLinks: true
  }
];

export const entryTypeConfigs: Record<EntryType, EntryTypeConfig> = {
  [EntryType.Game]: {
    type: EntryType.Game,
    label: 'Game',
    metrics: [
      ...commonMetrics,
      {
        id: 'teamwork',
        label: 'Teamwork',
        description: 'How would you rate your teamwork?',
        min: 1,
        max: 10
      },
      {
        id: 'teamPlay',
        label: 'Team Play',
        description: 'Grade the overall team performance',
        min: 1,
        max: 10
      }
    ],
    prompts: [
      {
        id: 'highlights',
        label: 'Positive',
        placeholder: 'What did you do well?',
        required: true
      },
      {
        id: 'improvements',
        label: 'Areas for Improvement',
        placeholder: 'What do you want to improve on moving forward?',
        required: true
      },
      {
        id: 'learnings',
        label: 'Key Learnings',
        placeholder: 'What did this game reveal about your strengths and weaknesses?'
      },
      {
        id: 'additionalNotes',
        label: 'Additional Notes',
        placeholder: 'Anything else you want to note about this game?',
      }
    ],
    media: [
      {
        id: 'gameMedia',
        label: 'Game Media',
        description: 'Upload game footage, photos, or stats',
        acceptedTypes: ['image/*', 'video/*', 'application/pdf'],
        maxFiles: 50,
        required: false,
        allowUpload: true,
        allowLinks: true
      }
    ]
  },
  [EntryType.Practice]: {
    type: EntryType.Practice,
    label: 'Practice',
    metrics: commonMetrics,
    prompts: [
      {
        id: 'highlights',
        label: 'Practice Areas',
        placeholder: 'What skills and aspects of the game were focused on today?',
        required: true
      },
      {
        id: 'nextSteps',
        label: 'Moving Forward',
        placeholder: 'What do you need to focus on to further improve these skills?',
        required: true
      },
      {
        id: 'additionalNotes',
        label: 'Additional Notes',
        placeholder: 'Anything else you want to note about this practice?',
      }
    ],
    media: [
      {
        id: 'practiceMedia',
        label: 'Practice Media',
        description: 'Upload practice footage, photos, or stats',
        acceptedTypes: ['image/*', 'video/*', 'application/pdf'],
        maxFiles: 50,
        required: false,
        allowUpload: true,
        allowLinks: true
      }
    ]
  },
  [EntryType.Workout]: {
    type: EntryType.Workout,
    label: 'Workout',
    metrics: [
      {
        id: 'overallRating',
        label: 'Performance Rating',
        description: 'How would you grade the workout?',
        min: 1,
        max: 10
      },
      {
        id: 'energyLevel',
        label: 'Energy Level',
        description: 'How strong and energized did you feel during the workout?',
        min: 1,
        max: 10
      },
      {
        id: 'mentalFocus',
        label: 'Mental Focus',
        description: 'How focused were you throughout the workout?',
        min: 1,
        max: 10
      },
      {
        id: 'effortLevel',
        label: 'Effort Level',
        description: 'How was your effort level during the workout?',
        min: 1,
        max: 10
      },
      {
        id: 'intensity',
        label: 'Intensity',
        description: 'How intense was the workout?',
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
        placeholder: 'What was the hardest part of the workout, and how did you push through it?',
        required: true
      },
      {
        id: 'movingForward',
        label: 'Looking Forward',
        placeholder: 'What will you improve on moving forward?',
        required: true
      },
      {
        id: 'additionalNotes',
        label: 'Additional Notes',
        placeholder: 'Anything else you want to note about the workout?',
      }
    ],
    media: [
      {
        id: 'workoutMedia',
        label: 'Workout Media',
        description: 'Upload workout footage, photos, or stats',
        acceptedTypes: ['image/*', 'video/*', 'application/pdf'],
        maxFiles: 50,
        required: false,
        allowUpload: true,
        allowLinks: true
      }
    ]
  },
  [EntryType.Film]: {
    type: EntryType.Film,
    label: 'Film Session',
    filmDetails: {
      label: 'Film Type',
      description: 'What type of film session was this?',
      options: [
        { label: 'Own Team', value: 'team' },
        { label: 'Opponents', value: 'opponents' },
        { label: 'Pros', value: 'pros' },
        { label: 'Other', value: 'other' }
      ]
    },
    metrics: [
      {
        id: 'overallRating',
        label: 'Rating',
        description: 'How would you rate the film session?',
        min: 1,
        max: 10
      },
      {
        id: 'effectiveness',
        label: 'Effectiveness',
        description: 'How effective was the film session?',
        min: 1,
        max: 10
      },
      {
        id: 'application',
        label: 'Practical Application',
        description: 'How applicable were the session to your game?',
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
        placeholder: 'What changes will you make in your game based on this session?',
        required: true
      },
      {
        id: 'questions',
        label: 'Questions/Clarifications',
        placeholder: 'Did any questions come up during the session?'
      },
      {
        id: 'additionalNotes',
        label: 'Additional Notes',
        placeholder: 'Anything else you want to note about the film session?',
      }
    ],
    media: [
      {
        id: 'filmMedia',
        label: 'Film Media',
        description: 'Upload film footage, photos, or stats',
        acceptedTypes: ['image/*', 'video/*', 'application/pdf'],
        maxFiles: 50,
        required: false,
        allowUpload: true,
        allowLinks: true
      }
    ]
  }
}; 