import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  PhoneAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { getMessaging } from 'firebase/messaging';
import axios from 'axios';

// Initialize Firebase
export const firebaseConfig = {
  apiKey: 'AIzaSyDTGyG65VjkEE18KZJTo4cninZk7p1rEhc',
  authDomain: 'your-guider-fbcb0.firebaseapp.com',
  projectId: 'your-guider-fbcb0',
  storageBucket: 'your-guider-fbcb0.appspot.com',
  messagingSenderId: '544120482529',
  appId: '1:544120482529:web:ee90bf1a01fdef78e325a0',
  measurementId: 'G-MSGQ8C42CN',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const messaging = getMessaging(app); // Initialize Firebase Messaging

export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted');
    } else {
      console.log('Notification permission denied');
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
}

export async function getToken() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const fcmToken = await messaging.getToken();
      console.log('FCM Registration Token:', fcmToken);
      return fcmToken;
    } else {
      console.log('Notification permission denied');
      throw new Error('Notification permission denied');
    }
  } catch (error) {
    console.error('Error getting permission or token:', error);
    throw error;
  }
}

export const vapidKey =
  'BBhglaAqN2hegvhH-dPEb9_D2pAJ4vftDdIjC5RQuHd6RB3EbIM_u1pq-pGxNrKGuLrCe5cqWrmQqQEudk_b7HA';

export const AuthService = {
  auth,
  signInWithPhoneNumber: async (phoneNumber) => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        'recaptcha-container',
        {
          size: 'invisible',
          callback: (response) => {
            console.log('Recaptcha resolved');
          },
        },
        auth,
      );
    }

    try {
      const verificationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        window.recaptchaVerifier,
      );
      return verificationResult.verificationId;
    } catch (error) {
      console.error('Error sending verification code:', error);
      throw new Error('Failed to send verification code. Please try again.');
    }
  },

  verifyOTP: async (verificationId, enteredOTP) => {
    const credential = PhoneAuthProvider.credential(verificationId, enteredOTP);
    await signInWithCredential(auth, credential);
    return true;
  },

  loginBackend: async (phoneNumber) => {
    const response = await axios.post('http://localhost:5000/api/login', {
      phone_number: phoneNumber,
    });
    return response.data.token;
  },

  validateToken: async (token) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/validate-token',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data.isValid;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  },
};

export const isValidPhoneNumber = (number) => {
  const phoneNumberPattern = /^\+91\d{10}$/;
  return phoneNumberPattern.test(number);
};
