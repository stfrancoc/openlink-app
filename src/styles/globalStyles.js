import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#0f0f0f'
  },

  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 30,
    color: 'white',
    fontWeight: 'bold'
  },

  label: {
    color: '#aaa',
    marginBottom: 5
  },

  input: {
    height: 45,
    borderColor: '#333',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 8,
    color: 'white',
    backgroundColor: '#1a1a1a'
  },

  buttonGroup: {
    marginTop: 20,
    gap: 10
  },

  status: {
    marginTop: 30,
    textAlign: 'center',
    color: '#aaa'
  }
});