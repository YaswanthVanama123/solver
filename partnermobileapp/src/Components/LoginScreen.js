import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';

const LoginScreen = () => {
  const [selectedCountryCode, setSelectedCountryCode] = useState('91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const validateCsToken = async () => {
      try {
        const pcsToken = await EncryptedStorage.getItem('pcs_token');
      
        if (pcsToken) {
          const response = await axios.post(`${process.env.BackendAPI1}/api/worker/authenticate`, {}, {
            headers: {
              'Authorization': `Bearer ${pcsToken}`
            }
          });
          console.log(response.data)
          if (response.data.success) {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
              })
            );
          }
        }
      } catch (error) {
        console.error('Error validating token:', error);
      }
    };
    validateCsToken();
  }, [navigation]);

  const loginBackend = async (phoneNumber) => {
    console.log(phoneNumber)
    try {
      const response = await axios.post(`${process.env.BackendAPI1}/api/worker/login`, { phone_number: phoneNumber });
      return response.data;
    } catch (error) {
      console.error('Error during backend login:', error);
      throw error;
    }
  };
 
  const login = async () => {
    if (!phoneNumber) {
      Alert.alert('Login Failed', 'Phone number and name are required.');
      return;
    }
    try {
      const tokenValue = await loginBackend(phoneNumber);
      console.log("log",tokenValue)
      const {token} = tokenValue
      console.log(token)
      await EncryptedStorage.setItem('pcs_token',(token));

      Alert.alert('Login Successful');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
        })
      );
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Login Failed', 'An error occurred during login.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Use KeyboardAvoidingView to handle keyboard visibility */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ImageBackground
          source={{ uri: 'https://i.postimg.cc/rFFQLGRh/Picsart-24-10-01-15-38-43-205.jpg' }}
          style={styles.backgroundImage}
          resizeMode="stretch"
        >
          <View style={styles.contentOverlay}>
            {/* Logo and Heading */}
            <View style={styles.description}>
              <View style={styles.logoContainer}>
                <Image
                  source={{ uri: 'https://i.postimg.cc/hjjpy2SW/Button-1.png' }} // Add your logo here
                  style={styles.logo}
                />
                <Text style={styles.heading}>Click <Text style={styles.solverText}>Solver</Text></Text>
              </View>
              <Text style={styles.subheading}>ALL HOME Service Expert</Text>
              <Text style={styles.tagline}>Instant Affordable Trusted</Text>
            </View>

            {/* Mobile Input */}
            <View style={styles.inputContainer}>
              <View style={styles.countryCodeContainer}>
                <Image
                  source={{ uri: 'https://i.postimg.cc/C1hkm5sR/india-flag-icon-29.png' }} // Add the India flag icon
                  style={styles.flagIcon}
                />
                <Text style={styles.picker}>91</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter Mobile Number"
                placeholderTextColor="#9e9e9e"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(text)}
              />
            </View>

            {/* Get Verification Code Button */}
            <TouchableOpacity style={styles.button} onPress={login}>
              <Text style={styles.buttonText}>Get Verification Code</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  solverText: {
    color: '#212121',
    fontWeight: 'bold', // Use 'bold' instead of hex for weight
  },
  description: {
    flexDirection: 'column',
    marginLeft: 10,
  },
  contentOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  heading: {
    fontSize: 26,
    lineHeight: 26,
    fontWeight: 'bold',
    color: '#212121',
    width: 100,
    alignItems: 'center',
  },
  subheading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingBottom: 70,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: '100%',
    height: 56,
    elevation: 5,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#ccc',
    paddingRight: 10,
    width: 80,
  },
  flagIcon: {
    width: 24,
    height: 24,
  },
  picker: {
    fontSize: 17,
    color: '#212121',
    padding: 10,
    fontWeight: 'bold',
  },
  input: {
    flex: 1,
    height: 56,
    paddingLeft: 10,
    color: '#212121',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FF5722',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    elevation: 5,
    marginTop: 25,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
