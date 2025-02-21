import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Switch, Text, Divider, Portal, Dialog, Button } from 'react-native-paper';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SharedStyles } from '@/constants/Styles';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const colors = Colors[theme];
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEditProfile = () => {
    router.push('/(profile)/edit' as any);
  };

  const handleDeleteAccount = async () => {
    try {
      // Will implement full account deletion with Firebase
      await AsyncStorage.clear(); // For now, just clear local storage
      router.replace('/onboarding');
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

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
            Account
          </List.Subheader>
          <List.Item
            title="Edit Profile"
            description="Update your profile information"
            left={props => <List.Icon {...props} icon="account-edit" />}
            onPress={handleEditProfile}
            titleStyle={{ color: colors.text }}
            descriptionStyle={{ color: colors.textSecondary }}
          />
          <List.Item
            title="Delete Account"
            description="Permanently delete your account and data"
            left={props => <List.Icon {...props} icon="account-remove" color={Colors.dark.error} />}
            onPress={() => setShowDeleteConfirm(true)}
            titleStyle={{ color: Colors.dark.error }}
            descriptionStyle={{ color: colors.textSecondary }}
          />
          <Divider style={{ backgroundColor: colors.border }} />
        </List.Section>

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

      <Portal>
        <Dialog
          visible={showDeleteConfirm}
          onDismiss={() => setShowDeleteConfirm(false)}
          style={{ backgroundColor: colors.card }}
        >
          <Dialog.Title style={{ color: colors.text }}>Delete Account</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: colors.text }}>
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button 
              onPress={() => {
                setShowDeleteConfirm(false);
                handleDeleteAccount();
              }}
              textColor={Colors.dark.error}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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