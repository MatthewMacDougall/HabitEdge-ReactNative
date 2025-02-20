import { EntryFormData, GameDetails } from '@/types/journal'
import { EntryType } from '@/src/config/entryTypes'
import { format } from 'date-fns'

export function createEmptyEntry(): EntryFormData {
  return {
    type: EntryType.Game,
    date: format(new Date(), 'yyyy-MM-dd'),
    title: '',
    metrics: {},
    prompts: {},
    media: {},
    gameDetails: {
      opponent: '',
      score: { yourTeam: '0', opponent: '0' },
      result: 'draw'
    }
  }
} 