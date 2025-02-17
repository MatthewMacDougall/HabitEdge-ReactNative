import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Switch, Text, Divider } from 'react-native-paper';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SharedStyles } from '@/constants/Styles';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const colors = Colors[theme];

  return (
    <View style={[SharedStyles.screenContainer, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text 
          variant="headlineMedium" 
          style={[styles.headerTitle, { color: colors.text }]}
        >
          Settings
        </Text>
      </View>

      <ScrollView>
        <List.Section>
          <List.Subheader style={{ color: colors.textSecondary }}>
            Appearance
          </List.Subheader>
          <List.Item
            title="Dark Mode"
            description="Toggle dark/light theme"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                color={colors.primary}
              />
            )}
            titleStyle={{ color: colors.text }}
            descriptionStyle={{ color: colors.textSecondary }}
          />
          <Divider style={{ backgroundColor: colors.border }} />
        </List.Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
}); 