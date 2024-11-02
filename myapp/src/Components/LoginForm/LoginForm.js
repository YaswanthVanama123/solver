import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AuthService,
  isValidPhoneNumber,
  getToken,
} from '../AuthService/AuthService.js';
import './LoginForm.css';

const LoginForm = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [continueEnabled, setContinueEnabled] = useState(true);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const navigate = useNavigate(); // Get the navigate function

  useEffect(() => {
    const validateCsToken = async () => {
      const csToken = document.cookie.replace(
        /(?:(?:^|.*;\s*)cs\s*=\s*([^;]*).*$)|^.*$/,
        '$1',
      );
      if (csToken) {
        const isValid = await AuthService.validateToken(csToken);
        if (isValid) {
          navigate('/', { replace: true }); // Redirect to home if 'cs' token is valid
        }
      }
    };
    validateCsToken();
  }, [navigate]);

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleSendVerification = async () => {
    const fullPhoneNumber = `+91${phoneNumber}`;
    if (!isValidPhoneNumber(fullPhoneNumber)) {
      setVerificationError('Invalid phone number format.');
      return;
    }

    try {
      const verificationId =
        await AuthService.signInWithPhoneNumber(fullPhoneNumber);
      setVerificationId(verificationId);
      setVerificationError('');
      setContinueEnabled(false); // Move to OTP input field after sending verification
    } catch (error) {
      console.error('Error sending verification code:', error);
      setVerificationError(
        'Failed to send verification code. Please try again.',
      );
    }
  };

  const handleInputChange = (e, index) => {
    const newOtp = [...otp];
    newOtp[index] = e.target.value;
    setOtp(newOtp);

    // Move to the next input field or the previous one
    if (e.target.value && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    } else if (!e.target.value && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const verifyOTP = async () => {
    const enteredOTP = otp.join('');
    console.log('Entered OTP:', enteredOTP);

    try {
      await AuthService.verifyOTP(verificationId, enteredOTP);
      console.log('Phone number verified successfully');

      // After OTP verification, get the main token 'cs' from your backend
      const token = await AuthService.loginBackend(phoneNumber);

      // Create the 'cs' token cookie
      const csToken = `cs=${token}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
      document.cookie = csToken;

      // Navigate to "/" path
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setVerificationError('Failed to verify OTP. Please try again.');
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

export default LoginForm;
