import { Sport } from '@/types/sports';

export const sports: Sport[] = [
  {
    id: 'baseball',
    name: 'Baseball'
  },
  {
    id: 'basketball',
    name: 'Basketball'
  },
  {
    id: 'football',
    name: 'Football'
  },
  {
    id: 'hockey',
    name: 'Hockey'
  },
  {
    id: 'lacrosse',
    name: 'Lacrosse'
  },
  {
    id: 'soccer',
    name: 'Soccer'
  },
  {
    id: 'softball',
    name: 'Softball'
  },
  {
    id: 'volleyball',
    name: 'Volleyball'
  },
  {
    id: 'other',
    name: 'Other',
    isCustom: true
  }
];

export const getSportById = (id: string): Sport | undefined => {
  return sports.find(sport => sport.id === id);
};