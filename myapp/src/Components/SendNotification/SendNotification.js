import React, { useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const SendNotification = () => {
  useEffect(() => {
    const sendNotification = async (token, title, body) => {
      try {
        const response = await axios.post('http://localhost:5000/api/send-notification', {
          token: token,
          payload: { title: title, body: body },
        });
        console.log('Notification response:', response.data);
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    };

    const token = Cookies.get('csm');
    if (token) {
      sendNotification(token, 'Test Notification', 'This is a test notification.');
    } else {
      console.error('FCM token not found in cookies.');
    }
  }, []);

  return (
    <div>
      <h1>Send Notification Example</h1>
      <p>Check console for notification status.</p>
    </div>
  );
};

export default SendNotification;
