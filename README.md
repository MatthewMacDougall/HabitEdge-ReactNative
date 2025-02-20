# HabitEdge

A mobile application designed to help athletes track their targets, habits, and progress in their sport.

## Features

### Targets Management
- Create and track both numeric and boolean (completion-based) targets
- Set deadlines and track progress over time
- Filter targets by status (All, In Progress, Completed)
- Log incremental progress for numeric targets
- Mark boolean targets as complete
- Edit and delete existing targets

### Training Journal
- Log different types of training sessions (practice, game, etc.)
- Record workout details, scores, and notes
- Edit and delete journal entries
- Filter and search through past entries
- Monitor progress over time

### Dashboard
- Overview of active targets
- Recent journal entries
- Quick-access to common actions
- Progress insights and statistics

### Profile & Settings
- View and edit user profile information
- Access detailed performance insights
- Customize app preferences
- Manage notification settings
- View app statistics and usage metrics

## Technical Stack

- React Native with Expo Router
- TypeScript for type safety
- React Native Paper for UI components
- AsyncStorage for local data persistence

## Project Structure

```
app/
├── (tabs)/              # Tab-based navigation
│   ├── dashboard.tsx    # Dashboard screen
│   ├── entries/        # Journal entries routes
│   │   ├── [id].tsx    # Entry details/edit
│   │   └── index.tsx   # Entries list
│   ├── insights.tsx    # Insights screen
│   ├── profile.tsx     # Profile screen
│   ├── settings.tsx    # Settings screen
│   └── targets/       # Targets routes
│       ├── [id].tsx   # Target details/edit
│       └── index.tsx  # Targets list
├── _layout.tsx         # Root layout configuration
├── onboarding.tsx      # Onboarding screen
└── +not-found.tsx      # 404 screen
components/
├── __tests__/         # Component tests
├── dialogs/           # Dialog components
├── sections/          # Screen sections
├── ui/                # UI components
├── JournalEntry.tsx
├── ProgressBar.tsx
├── SearchBar.tsx
├── TargetCard.tsx
└── [other .tsx files] # Individual components
constants/
├── Colors.ts         # Theme colors
└── Styles.ts         # Shared styles
screens/              # Screen components
├── JournalListScreen.tsx
├── EditJournalEntryScreen.tsx
├── TargetListScreen.tsx
└── EditTargetScreen.tsx
types/
├── journal.ts        # Journal-related types
├── navigation.ts     # Navigation types
└── targets.ts        # Target-related types
utils/
├── storage.ts        # AsyncStorage helpers
└── formValidation.ts # Form validation helpers
```

## Getting Started

1. Install dependencies
```bash
npm install
```

2. Start the development server
```bash
npx expo start
```

3. Run on your preferred platform
- Press 'i' for iOS simulator
- Press 'a' for Android emulator
- Scan QR code with Expo Go app for physical device

## Development

### Environment Setup
- Node.js 16 or later
- Expo CLI
- iOS Simulator or Android Emulator
- Git

### Code Style
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
