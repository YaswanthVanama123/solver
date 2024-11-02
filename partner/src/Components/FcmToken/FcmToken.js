import React, { useEffect } from 'react';
import firebase from 'firebase/compat/app'; // Import Firebase app compatibility version
import 'firebase/compat/messaging'; // Import Firebase messaging compatibility version
import Cookies from 'js-cookie'; // Import js-cookie
import axios from 'axios'; // Import axios
import './FcmToken.css'

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

const FcmToken = () => {
  useEffect(() => {
    const getToken = async () => {
      try {
        const messaging = firebase.messaging();
        const token = await messaging.getToken();
        console.log('FCM token:', token);
        console.log(token)

        // Store the token in a cookie named 'csm' without an expiration date
        Cookies.set('csm', token);

        // Send the token to your backend
        const workerId = 1; // Example worker ID, replace with the actual ID
        await axios.post('http://localhost:5000/api/worker/store-fcm-token', {
          workerId,
          fcmToken: token,
        });

        console.log('Token sent to the backend successfully');
      } catch (error) {
        console.error('Error getting FCM token or sending to the backend:', error);
      }
    };

    getToken();
  }, []);

  return (
    <div>
      <img src = "https://i.postimg.cc/d1x5RQCS/Screenshot-78-removebg-1.png" alt="logo" className='csLogo'/>
      <h1>FCM Token Generation Example</h1>
      <p>Check console for FCM token.</p>
    </div>
  );
};

export default FcmToken;
