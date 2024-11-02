import React, { useState,useEffect } from 'react';
import axios from 'axios';
import firebase from 'firebase/compat/app'; // Import Firebase app compatibility version
import 'firebase/compat/messaging'; // Import Firebase messaging compatibility version
import Cookies from 'js-cookie'; // Import js-cookie
import { useNavigate } from 'react-router-dom';

import './LoginPage.css';

const firebaseConfig = {
  apiKey: "AIzaSyDTGyG65VjkEE18KZJTo4cninZk7p1rEhc",
  authDomain: "your-guider-fbcb0.firebaseapp.com",
  projectId: "your-guider-fbcb0",
  storageBucket: "your-guider-fbcb0.appspot.com",
  messagingSenderId: "544120482529",
  appId: "1:544120482529:web:ee90bf1a01fdef78e325a0",
  measurementId: "G-MSGQ8C42CN"
};

firebase.initializeApp(firebaseConfig);

const LoginPage = () => {
  const [phoneNumber, setphoneNumber] = useState('');
  const [name, setname] = useState('');

  const navigate = useNavigate(); // Get the navigate function


  useEffect(() => {
    const validateCsToken = async () => {
      const csToken = document.cookie.replace(/(?:(?:^|.*;\s*)cs\s*=\s*([^;]*).*$)|^.*$/, "$1");
      if (csToken) {
        try {
          const response = await axios.post('http://localhost:5000/api/validate-token', {}, {
            headers: {
              'Authorization': `Bearer ${csToken}`
            }
          });
          console.log(response)
          if (response.data.isValid) {
            navigate('/', { replace: true }); // Redirect to home if 'pcs' token is valid
          } else {
            navigate('/login', { replace: true }); // Redirect to login if not successful
          }
        } catch (error) {
          console.error('Error validating token:', error);
          return false;
        }

      }
    };
    validateCsToken();
  }, [navigate]);







  const loginBackend = async (phoneNumber) => {
    const response = await axios.post('http://localhost:5000/api/login', { phone_number: phoneNumber });
    return response.data.token;
  };
  const onChangeUsername = (event) => {
    setphoneNumber(event.target.value);
  };

  const onChangePassword = (event) => {
    setname(event.target.value);
  };

  const login = async () => {
    try {
      // After OTP verification, get the main token 'cs' from your backend
      const token = await loginBackend(phoneNumber, name);
      // Create the 'cs' token cookie
      const csToken = `cs=${token}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
      document.cookie = csToken;
      // Navigate to "/" path
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error verifying OTP:', error);
    }

  };

  const renderPasswordField = () => (
    <>
      <label className="input-label" htmlFor="name">
        Name
      </label>
      <input
        type="text"
        id="name"
    className="username-input-filed"
        value={name}
        onChange={onChangePassword}
      />
    </>
  );

  const renderUsernameField = () => (
    <>
      <label className="input-label" htmlFor="phoneNumber">
        Phone number
      </label>
      <input
        type="tel"
        id="phoneNumber"
        className="username-input-filed"
        value={phoneNumber}
        onChange={onChangeUsername}
      />
    </>
  );

  return (
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
        <div className="input-container">{renderUsernameField()}</div>
        <div className="input-container">{renderPasswordField()}</div>
        <button type="button" className="login-button"  onClick={login}>
          Login
        </button>

      </form>
    </div>
  );
};

export default LoginPage;
