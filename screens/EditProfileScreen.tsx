import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { SharedStyles } from '@/constants/Styles';
import { useTheme } from '@/contexts/ThemeContext';
import { UserRegistration } from '@/types/onboarding';
import Toast from 'react-native-toast-message';

export default function EditProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = Colors[theme];
  const [userData, setUserData] = useState<UserRegistration | null>(null);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userJson = await AsyncStorage.getItem('userRegistration');
      if (userJson) {
        const user = JSON.parse(userJson);
        setUserData(user);
        setName(user.name);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Name is required'
      });
      return;
    }

    // Validate password change if attempted
    if (newPassword || currentPassword || confirmPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        Toast.show({
          type: 'error',
          text1: 'All password fields are required'
        });
        return;
      }

      if (currentPassword !== userData?.password) {
        Toast.show({
          type: 'error',
          text1: 'Current password is incorrect'
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        Toast.show({
          type: 'error',
          text1: 'New passwords do not match'
        });
        return;
      }

      if (newPassword.length < 6) {
        Toast.show({
          type: 'error',
          text1: 'Password must be at least 6 characters'
        });
        return;
      }
    }

    try {
      setLoading(true);
      const updatedUser = {
        ...userData,
        name: name.trim(),
        password: newPassword || userData?.password
      };
      await AsyncStorage.setItem('userRegistration', JSON.stringify(updatedUser));
      Toast.show({
        type: 'success',
        text1: 'Profile updated successfully'
      });
      router.back();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to update profile'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={[SharedStyles.screenContainer, { backgroundColor: colors.background }]}
      contentContainerStyle={SharedStyles.contentContainer}
    >
      <Surface style={[styles.formContainer, { backgroundColor: colors.card }]}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
          Profile Information
        </Text>
        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          style={[styles.input, { backgroundColor: colors.input }]}
          textColor={colors.text}
        />

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
          Change Password
        </Text>
        <TextInput
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={!showPassword}
          right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
          style={[styles.input, { backgroundColor: colors.input }]}
          textColor={colors.text}
        />
        <TextInput
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showPassword}
          style={[styles.input, { backgroundColor: colors.input }]}
          textColor={colors.text}
        />
        <TextInput
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          style={[styles.input, { backgroundColor: colors.input }]}
          textColor={colors.text}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          loading={loading}
        >
          Save Changes
        </Button>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 24,
  },
}); 