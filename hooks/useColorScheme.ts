import { useColorScheme as useNativeColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useColorScheme() {
  const systemColorScheme = useNativeColorScheme();
  const [colorScheme, setColorScheme] = useState(systemColorScheme);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setColorScheme(savedTheme as 'light' | 'dark');
      }
    };
    loadTheme();
  }, []);

  return colorScheme ?? 'dark';
}
