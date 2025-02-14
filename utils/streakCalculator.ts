interface JournalEntry {
  timestamp: string;
}

export const calculateStreak = (entries: JournalEntry[]): number => {
  if (!entries.length) return 0;

  // Sort entries by date, newest first
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get the most recent entry's date
  const lastEntryDate = new Date(sortedEntries[0].timestamp);
  lastEntryDate.setHours(0, 0, 0, 0);

  // If the last entry is not from today or yesterday, streak is broken
  const daysSinceLastEntry = Math.floor((today.getTime() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceLastEntry > 1) return 0;

  // Calculate streak by checking consecutive days
  for (let i = 1; i < sortedEntries.length; i++) {
    const currentDate = new Date(sortedEntries[i].timestamp);
    const prevDate = new Date(sortedEntries[i - 1].timestamp);
    
    currentDate.setHours(0, 0, 0, 0);
    prevDate.setHours(0, 0, 0, 0);

    // Check if entries are from consecutive days
    const dayDifference = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDifference === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

// Helper function to check if user journaled today
export const hasJournaledToday = (entries: JournalEntry[]): boolean => {
  if (!entries.length) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return entries.some(entry => {
    const entryDate = new Date(entry.timestamp);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() === today.getTime();
  });
};

// Get the longest streak
export const getLongestStreak = (entries: JournalEntry[]): number => {
  if (!entries.length) return 0;

  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let currentStreak = 1;
  let longestStreak = 1;

  for (let i = 1; i < sortedEntries.length; i++) {
    const currentDate = new Date(sortedEntries[i].timestamp);
    const prevDate = new Date(sortedEntries[i - 1].timestamp);
    
    currentDate.setHours(0, 0, 0, 0);
    prevDate.setHours(0, 0, 0, 0);

    const dayDifference = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDifference === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
};

// Get streak data including additional statistics
export const getStreakStats = (entries: JournalEntry[]) => {
  return {
    currentStreak: calculateStreak(entries),
    longestStreak: getLongestStreak(entries),
    totalEntries: entries.length,
    hasJournaledToday: hasJournaledToday(entries),
    lastEntry: entries.length ? new Date(entries[0].timestamp) : null,
  };
}; 