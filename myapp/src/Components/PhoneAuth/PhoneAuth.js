import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import axios from 'axios';

import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
} from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDTGyG65VjkEE18KZJTo4cninZk7p1rEhc',
  authDomain: 'your-guider-fbcb0.firebaseapp.com',
  projectId: 'your-guider-fbcb0',
  storageBucket: 'your-guider-fbcb0.appspot.com',
  messagingSenderId: '544120482529',
  appId: '1:544120482529:web:ee90bf1a01fdef78e325a0',
  measurementId: 'G-MSGQ8C42CN',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const setupRecaptcha = () => {
  try {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
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

const PhoneAuth = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verificationId, setVerificationId] = useState(null);
  const [verificationError, setVerificationError] = useState('');
  const [continueEnabled, setContinueEnabled] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setupRecaptcha();
  }, []);

  useEffect(() => {
    const validateCsToken = async () => {
      const csToken = document.cookie.replace(
        /(?:(?:^|.*;\s*)cs\s*=\s*([^;]*).*$)|^.*$/,
        '$1',
      );
      if (csToken) {
        const isValid = await validateToken(csToken);
        if (isValid) {
          navigate('/', { replace: true });
        }
      }
    };
    validateCsToken();

    // Setup Recaptcha on component mount
  }, [navigate]);

  const validateToken = async (token) => {
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
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleSendVerification = async () => {
    const phoneNumberWithCode = `+91${phoneNumber}`; // Adjust according to your country code
    const appVerifier = window.recaptchaVerifier;

    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumberWithCode,
        appVerifier,
      );
      setVerificationId(confirmationResult.verificationId);
      setVerificationError('');
      setContinueEnabled(false);
      console.log('OTP sent');
    } catch (error) {
      console.error('Error during signInWithPhoneNumber:', error);
      // Handle error appropriately, e.g., display an error message to the user
    }
  };

  const handleInputChange = (e, index) => {
    const newOtp = [...otp];
    newOtp[index] = e.target.value;
    setOtp(newOtp);

    if (e.target.value && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    } else if (!e.target.value && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const loginBackend = async (phoneNumber) => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        phone_number: phoneNumber,
      });
      return response.data.token;
    } catch (error) {
      console.error('Error in loginBackend:', error);
      throw error; // Re-throw the error to handle it further if needed
    }
  };

  const verifyOTP = async () => {
    const enteredOTP = otp.join(''); // Assuming 'otp' is defined elsewhere
    const credential = PhoneAuthProvider.credential(verificationId, enteredOTP);

    try {
      const result = await signInWithCredential(auth, credential);
      console.log('User signed in successfully', result);

      // Assuming 'phoneNumber' is accessible in this scope
      const token = await loginBackend(phoneNumber);
      const csToken = `cs=${token}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
      document.cookie = csToken;

      navigate('/', { replace: true }); // Assuming 'navigate' is correctly imported or defined
    } catch (error) {
      console.error('Error during signInWithCredential:', error);
      // Handle error appropriately, e.g., display an error message to the user
    }
  };

  const renderOtpInputFields = () => {
    return (
      <div className="captainVerification">
        <div className="otp-container">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              className="otp-input"
              maxLength="1"
              value={digit}
              onChange={(e) => handleInputChange(e, index)}
            />
          ))}
        </div>
        {verificationError && (
          <p className="error-message">{verificationError}</p>
        )}
        <button type="button" className="login-button" onClick={verifyOTP}>
          Verify
        </button>
      </div>
    );
  };

  const renderPhoneNumberField = () => {
    return (
      <>
        <label className="input-label" htmlFor="phonenumber">
          Phone Number
        </label>
        <input
          type="tel"
          id="phonenumber"
          className="username-input-filed"
          placeholder="Enter your phone number"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
        />
        {verificationError && (
          <p className="error-message">{verificationError}</p>
        )}
        <button
          type="button"
          className="login-button"
          onClick={handleSendVerification}
        >
          Send Verification Code
        </button>
      </>
    );
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <img
          src="https://i.postimg.cc/Y0pNBXMk/Screenshot-73.png"
          className="login-website-logo-mobile-image"
          alt="website logo"
        />

        <form className="form-container">
          <img
            src="https://i.postimg.cc/Y0pNBXMk/Screenshot-73.png"
            className="login-website-logo-desktop-image"
            alt="website logo"
          />

          <div className="input-container">
            {continueEnabled
              ? renderPhoneNumberField()
              : renderOtpInputFields()}
          </div>
        </form>
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default PhoneAuth;
