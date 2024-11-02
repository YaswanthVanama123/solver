import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './WaitingUser.css';

const WaitingUser = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [decodedId, setDecodedId] = useState(null);
  const [status, setStatus] = useState('waiting');
  const [cancelMessage, setCancelMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const encodedId = queryParams.get('encodedId');

    if (encodedId) {
      try {
        const decodedId = atob(encodedId);
        setDecodedId(decodedId);
      } catch (error) {
        console.error('Error decoding Base64:', error);
      }
    }
  }, [location.search]);

  useEffect(() => {
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href =
      'https://fonts.googleapis.com/css2?display=swap&family=Inter:wght@400;500;700;900&family=Noto+Sans:wght@400;500;700;900';
    document.head.appendChild(styleLink);
  }, []);

  useEffect(() => {
    let intervalId;

    const checkStatus = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/checking/status',
          {
            params: { user_notification_id: decodedId },
          },
        );
        console.log(response);
        const data = response.data;
        const { status, notification_id } = data;

        if (status === 'accept') {
          console.log('Someone accepted');
          setStatus('accepted');
          clearInterval(intervalId);
          const encodedNotificationId = btoa(notification_id);
          navigate(`/user/navigation?encodedId=${encodedNotificationId}`);
        } else {
          console.log('Waiting...');
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };

    if (decodedId) {
      intervalId = setInterval(checkStatus, 3000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [decodedId, navigate]);

  const handleCancel = async () => {
    console.log(decodedId);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/user/cancellation',
        {
          user_notification_id: decodedId,
        },
      );

      if (response.status === 200) {
        navigate('/');
      } else {
        setCancelMessage('Cancel timed out');
        setTimeout(() => {
          setCancelMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error calling cancellation API:', error);
      setCancelMessage('Cancel timed out');
      setTimeout(() => {
        setCancelMessage('');
      }, 3000);
    }
  };

  const confirmCancel = () => {
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    setShowConfirmation(false);
    handleCancel();
  };

  const handleCancelConfirm = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="waitingMainContainer">
      <div>
        <div className="WaitingImageMainContainer">
          <div className="waitingImageContainer">
            <div className="imageWrapper">
              <img
                src="https://cdn.usegalileo.ai/stability/a53b3684-8a02-4476-9d1a-ccb7e8960543.png"
                alt="Waiting"
              />
            </div>
          </div>
        </div>
        <h1>Finding the nearest worker for you</h1>
        <div className="pleaseWaitText">
          <h3>Please wait</h3>
        </div>
        <div className="wrapper">
          <div className="candles">
            <div className="light__wave"></div>
            <div className="candle1">
              <div className="candle1__body">
                <div className="candle1__eyes">
                  <span className="candle1__eyes-one"></span>
                  <span className="candle1__eyes-two"></span>
                </div>
                <div className="candle1__mouth"></div>
              </div>
              <div className="candle1__stick"></div>
            </div>
            <div className="candle2">
              <div className="candle2__body">
                <div className="candle2__eyes">
                  <div className="candle2__eyes-one"></div>
                  <div className="candle2__eyes-two"></div>
                </div>
              </div>
              <div className="candle2__stick"></div>
            </div>
            <div className="candle2__fire"></div>
            <div className="sparkles-one"></div>
            <div className="sparkles-two"></div>
            <div className="candle__smoke-one"></div>
            <div className="candle__smoke-two"></div>
          </div>
          <div className="floor"></div>
        </div>
      </div>
      <div className="WaitingButtonContainer">
        <p>We are currently finding the best nearby commander to help you out</p>
        <div className="buttonWrapper">
          <button onClick={confirmCancel}>Cancel</button>
        </div>
      </div>
      {showConfirmation && (
        <div className="overlay">
          <div className="cancelMessageBox">
            <p>Are you sure you want to cancel?</p>
            <div className="buttonWrapper">
              <button className="confirmButton" onClick={handleConfirm}>
                Yes
              </button>
              <button className="cancelButton" onClick={handleCancelConfirm}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {cancelMessage && <p>{cancelMessage}</p>}
    </div>
  );
};

export default WaitingUser;
