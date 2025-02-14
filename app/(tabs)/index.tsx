import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import DashboardScreen from '@/screens/DashboardScreen';

export default function TabDashboardScreen() {
  return <DashboardScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
