/**
 * Generated for: KAN-2
 * @generated
 */

import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const EmailInput = ({ value, onChangeText }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder='Enter email'
        keyboardType='email-address'
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    marginBottom: 5
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10
  }
});

export default EmailInput;