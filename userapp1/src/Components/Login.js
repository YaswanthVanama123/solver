import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const validateCsToken = async () => {
      try {
        const csToken = await EncryptedStorage.getItem('cs_token');
        if (csToken) {
          const response = await axios.post(`${process.env.BACKEND}/api/validate-token`, {}, {
            headers: {
              'Authorization': `Bearer ${csToken}`,
            },
          });
          if (response.data.isValid) {
            navigation.replace('Tabs', { screen: 'Home' });
          }
        }
      } catch (error) {
        console.error('Token validation error:', error);
      }
    };
    validateCsToken();
  }, [navigation]);

  const loginBackend = async () => {
    try {
      const response = await axios.post(`${process.env.BACKEND}/api/login`, { phone_number: phoneNumber });
      return response.data.token;
    } catch (error) {
      throw new Error('Error logging in: ' + error.message);
    }
  };

  const login = async () => {
    if (!phoneNumber || !name) {
      Alert.alert('Error', 'Phone number and name are required');
      return;
    }

    try {
      const token = await loginBackend();
      await EncryptedStorage.setItem('cs_token', token);

      Alert.alert('Login Successful');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
        })
      );
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'Error verifying OTP');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        maxLength={10}
      />
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <Button title="Login" onPress={login} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
});

export default Login;
