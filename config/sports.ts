import { Sport } from '@/types/sports';

export const sports: Sport[] = [
  {
    id: 'basketball',
    name: 'Basketball'
  },
  {
    id: 'football',
    name: 'Football'
  },
  {
    id: 'baseball',
    name: 'Baseball'
  },
  {
    id: 'soccer',
    name: 'Soccer'
  },
  {
    id: 'tennis',
    name: 'Tennis'
  },
  {
    id: 'golf',
    name: 'Golf'
  },
  {
    id: 'volleyball',
    name: 'Volleyball'
  },
  {
    id: 'hockey',
    name: 'Hockey'
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

export const getMetricsForSport = (sportId: string): string[] => {
  const sport = getSportById(sportId);
  return sport?.metrics || [];
}; 