/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#FF4B4B';
const tintColorDark = '#FF6B6B';

export const Colors = {
  light: {
    text: '#000000',
    textSecondary: '#666666',
    background: '#FFFFFF',
    card: '#F5F5F5',
    tint: tintColorLight,
    tabIconDefault: '#CCCCCC',
    tabIconSelected: tintColorLight,
    border: '#EEEEEE',
    error: '#FF3B30',
    primary: '#FF4B4B',
    secondary: '#FF8C00',
    input: '#FFFFFF',
    icon: '#000000',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    background: '#121212',
    card: '#1E1E1E',
    tint: tintColorDark,
    tabIconDefault: '#666666',
    tabIconSelected: tintColorDark,
    border: '#333333',
    error: '#FF453A',
    primary: '#FF6B6B',
    secondary: '#FFA500',
    input: '#2A2A2A',
    icon: '#FFFFFF',
  },
};
