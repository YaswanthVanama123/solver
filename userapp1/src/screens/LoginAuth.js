import React, { useState, useEffect } from 'react';
import { View, Button, TextInput, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';

function LoginAuth() {
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [confirm, setConfirm] = useState(null);
  const [code, setCode] = useState(Array(6).fill('')); // Array to store OTP digits

  // Handle login
  function onAuthStateChanged(user) {
    if (user) {
      // Handle the case where the user has successfully logged in
      console.log('User logged in successfully:', user);
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  // Handle the button press
  async function signInWithPhoneNumber() {
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);
    } catch (error) {
      console.log('Error signing in with phone number:', error);
    }
  }

  async function confirmCode() {
    try {
      const otpCode = code.join(''); // Join the code array into a string
      await confirm.confirm(otpCode);
    } catch (error) {
      console.log('Invalid code.');
    }
  }

  // Update the specific OTP digit
  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
  };

  if (!confirm) {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.phoneNumberInput}
          value={phoneNumber}
          onChangeText={text => setPhoneNumber(text)}
          placeholder="Enter your mobile number"
          keyboardType="phone-pad"
        />
        <Button title="Send OTP" onPress={signInWithPhoneNumber} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.otpContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.otpInput}
            value={digit}
            onChangeText={text => handleCodeChange(text, index)}
            keyboardType="numeric"
            maxLength={1}
          />
        ))}
      </View>
      <Button title="Confirm Code" onPress={confirmCode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  phoneNumberInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    width: 40,
    textAlign: 'center',
    fontSize: 18,
  },
});

export default LoginAuth;
