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

export interface Media {
  id: string;
  label: string;
  description: string;
  acceptedFormats: string[];
  maxSizeMB: number;
  required: boolean;
  multiple?: boolean;
  allowLinks?: boolean;
  allowUpload?: boolean;
}

interface EntryTypeConfig {
  label: string;
  metrics: Metric[];
  prompts: Prompt[];
  media: Media[];
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

const media: Media[] = [
  {
    id: 'mediaUpload',
    label: 'Upload Media (optional)',
    description: 'Attach any relevant media files (videos, photos, etc.)',
    acceptedFormats: ['image/*', 'video/*', 'application/pdf'],
    maxSizeMB: 50,
    required: false,
    multiple: true,
    allowLinks: true,
    allowUpload: true
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
        acceptedFormats: ['image/*', 'video/*', 'application/pdf'],
        maxSizeMB: 50,
        required: false,
        multiple: true,
        allowLinks: true,
        allowUpload: true
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
        description: 'How effective was the practice session in improving your skills?',
        min: 1,
        max: 10
      }
    ],
    prompts: [
      {
        id: 'focusAreas',
        label: 'Focus Areas',
        placeholder: 'What skills or aspects were emphasized today? Why are they important?',
        required: true
      },
      {
        id: 'improvements',
        label: 'Progress Made',
        placeholder: 'What noticeable improvements did you see?',
        required: true
      },
      {
        id: 'nextSteps',
        label: 'Next Steps',
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
        acceptedFormats: ['image/*', 'video/*', 'application/pdf'],
        maxSizeMB: 50,
        required: false,
        multiple: true,
        allowLinks: true,
        allowUpload: true
      }
    ]
  },
  workout: {
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
        acceptedFormats: ['image/*', 'video/*', 'application/pdf'],
        maxSizeMB: 50,
        required: false,
        multiple: true,
        allowLinks: true,
        allowUpload: true
      }
    ]
  },
  film: {
    label: 'Film Session',
    metrics: [
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
        acceptedFormats: ['image/*', 'video/*', 'application/pdf'],
        maxSizeMB: 50,
        required: false,
        multiple: true,
        allowLinks: true,
        allowUpload: true
      }
    ]
  }
}; 