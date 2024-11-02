// setupRecaptcha.js
import firebase from './firebaseConfig';

const SetupRecaptcha = () => {
  try {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      'recaptcha-container',
      {
        size: 'invisible',
        callback: (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          console.log('reCAPTCHA solved');
        },
      },
    );
  } catch (error) {
    console.error('Error initializing reCAPTCHA verifier:', error);
  }
};

export default SetupRecaptcha;
