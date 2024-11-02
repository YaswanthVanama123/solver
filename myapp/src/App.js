import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserLocation from './Components/UserLocation/UserLocation.js';
import Home from './Components/Home/Home.js';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute.js';
import NotFound from './Components/NotFound/NotFound.js';
import FcmToken from './Components/FcmToken/FcmToken.js';
import SendNotification from './Components/SendNotification/SendNotification.js';
import WaitingUser from './Components/WaitingUser/WaitingUser.js';
import AcceptanceRoute from './Components/AcceptanceRoute/AcceptanceRoute.js';
import Navigation from './Components/Navigation/Navigation.js';
import TimingRoute from './Components/TimingRoute/TimingRoute.js';
import PhoneAuth from './Components/PhoneAuth/PhoneAuth.js';
import LoginForm from './Components/LoginForm/LoginForm.js';
import Payment from './Components/Payment/Payment.js';
import RatingRoute from './Components/RatingRoute/RatingRoute.js';
import LoginPage from './Components/LoginPage/LoginPage.js';
import Booking from './Components/Booking/Booking.js'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/login" element={<LoginPage />} />
        <Route exact path="/loginform" element={<PhoneAuth />} />
        <Route element={<ProtectedRoute />}>
          <Route
            exact
            path="/userlocation/:title/:name"
            element={<UserLocation />}
          />
          <Route exact path="/acceptance" element={<AcceptanceRoute />} />
          <Route exact path="/loading/route" element={<WaitingUser />} />
          <Route exact path="/send" element={<SendNotification />} />
          <Route exact path="/user/navigation" element={<Navigation />} />
          <Route exact path='/my/bookings' element={<Booking />} />
          <Route exact path="/Timing/count" element={<TimingRoute />} />
          <Route exact path='/Payment/page' element={<Payment />} />
          <Route exact path='/rating' element={<RatingRoute />} />
        </Route>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/cms" element={<FcmToken />} />

        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
