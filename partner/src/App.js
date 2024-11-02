import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { getMessaging, onMessage } from "firebase/messaging";
import { initializeApp } from "firebase/app";
import NotFound from "./Components/NotFound/NotFound.js";
import LoginForm from "./Components/LoginForm/LoginForm.js";
import LocationTracker from "./Components/WorkersLocation/WorkersLocation.js";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute.js";
import WorkerAcceptance from "./Components/WorkerAcceptance/WorkerAcceptance.js";
import WorkerNavigation from "./Components/WorkerNavigation/WorkerNavigation.js";
import OTPVerification from "./Components/OtpVerification/OtpVerification.js";
import WorkersLocation from "./Components/WorkersLocation/WorkersLocation.js";
import TimingRoute from "./Components/TimingRoute/TimingRoute.js";
import PaymentPage from "./Components/PaymentPage/PaymentPage.js";
import Waiting from './Components/Waiting/Waiting.js'
import SkillRegistration from "./Components/SkillRegistration/SkillRegistration.js";
import HomeRoute from './Components/HomeRoute/HomeRoute.js'
import WorkerProfile from "./Components/WorkerProfile/WorkerProfile.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTGyG65VjkEE18KZJTo4cninZk7p1rEhc",
  authDomain: "your-guider-fbcb0.firebaseapp.com",
  projectId: "your-guider-fbcb0",
  storageBucket: "your-guider-fbcb0.appspot.com",
  messagingSenderId: "544120482529",
  appId: "1:544120482529:web:ee90bf1a01fdef78e325a0",
  measurementId: "G-MSGQ8C42CN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const App = () => {
  useEffect(() => {
    // Request notification permission
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Notification permission granted.");

        // Handle foreground messages
        onMessage(messaging, (payload) => {
          console.log("Foreground message received:", payload);

          // Customize the notification display
          const notificationTitle =
            payload.notification?.title || "Notification Title";
          const notificationOptions = {
            body: payload.notification?.body || "Notification Body",
            icon: payload.notification?.icon || "/default-icon.png",
            data: payload.data,
          };

          // Display the notification
          const notification = new Notification(
            notificationTitle,
            notificationOptions
          );

          // Handle notification click
          notification.onclick = (event) => {
            event.preventDefault(); // Prevent the browser from focusing the Notification's tab
            window.location.href = payload.data?.targetUrl || "/acceptance";
          };
        });
      } else {
        console.log("Unable to get permission to notify.");
      }
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomeRoute />} />
          <Route exact path="/worker/location" element={<LocationTracker />} />
          <Route path="/acceptance" element={<WorkerAcceptance />} />
          <Route path="/worker/navigation" element={<WorkerNavigation />} />
          <Route path="/worker/location" element={<WorkersLocation />} />
          <Route path="/service/timing" element={<TimingRoute />} />
          <Route path="/skill/registration" element={<SkillRegistration />} />
          <Route path="/otp/verification" element={<OTPVerification />} />
          <Route path="/payment/page" element={<PaymentPage/>} />
        </Route>
        <Route path="/waiting" element={<Waiting />} />
        <Route path="/not-found" element={<NotFound />} />
        <Route path="/profile" element={<WorkerProfile />}/>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
