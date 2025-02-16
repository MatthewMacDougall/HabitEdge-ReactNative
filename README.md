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

### Journal
- Track daily training sessions
- Record workout details and notes
- Monitor progress over time

### Dashboard (Coming Soon)
- Overview of active targets
- Recent progress updates
- Quick-access to common actions
- Progress insights and statistics

## Technical Stack

- React Native with Expo
- TypeScript for type safety
- React Native Paper for UI components
- AsyncStorage for local data persistence
- React Navigation for routing

## Project Structure

```
src/
├── app/                # Expo Router app directory
│   ├── (tabs)/        # Tab-based navigation
│   └── _layout.tsx    # Root layout configuration
├── screens/           # Main screen components
│   ├── TargetsScreen.tsx     # Targets management
│   ├── JournalScreen.tsx   # Training journal
│   └── DashboardScreen.tsx # Overview dashboard
├── components/        # Reusable UI components
│   └── ui/           # Basic UI components
├── constants/        # App-wide constants
│   ├── Colors.ts    # Theme colors
│   └── Styles.ts    # Shared styles
├── types/           # TypeScript definitions
│   └── targets.ts     # Target-related types
└── utils/           # Utility functions
    └── storage.ts   # AsyncStorage helpers
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
