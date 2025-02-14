/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    primary: '#ff2828',
    secondary: '#f97316',
    error: '#dc2626',
    border: '#e5e7eb',
    card: '#fff',
    input: '#f9fafb',
    textSecondary: '#6b7280'
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    primary: '#ff6262',
    secondary: '#fb923c',
    error: '#ef4444',
    border: '#374151',
    card: '#111827',
    input: '#1f2937',
    textSecondary: '#9ca3af'
  },
};
