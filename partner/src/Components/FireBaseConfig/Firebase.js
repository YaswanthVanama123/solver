// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDTGyG65VjkEE18KZJTo4cninZk7p1rEhc",
  authDomain: "your-guider-fbcb0.firebaseapp.com",
  projectId: "your-guider-fbcb0",
  storageBucket: "your-guider-fbcb0.appspot.com",
  messagingSenderId: "544120482529",
  appId: "1:544120482529:web:ee90bf1a01fdef78e325a0",
  measurementId: "G-MSGQ8C42CN"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };
