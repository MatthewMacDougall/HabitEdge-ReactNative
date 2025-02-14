import { StyleSheet } from 'react-native';
import { Colors } from './Colors';

export const SharedStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardTitle: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    color: Colors.dark.text,
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.dark.input,
    color: Colors.dark.text,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
    padding: 12,
  },
  buttonText: {
    color: Colors.dark.text,
    textAlign: 'center',
    fontWeight: 'bold',
  },
}); 