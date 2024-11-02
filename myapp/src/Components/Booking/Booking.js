import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from "js-cookie";
import './Booking.css';
import SearchBox from '../SearchBox/SearchBox';
import NavBar from '../BottomNav/BottomNav';



const Bookings = () => {
  const [bookingsData, setBookingsData] = useState([]);

  useEffect(() => {
    // Fetch bookings data from the backend
    const fetchBookings = async () => {
      try {
        const token = Cookies.get('cs'); // Get CSRF token from cookies
        const response = await axios.get('http://localhost:5000/api/user/bookings', {
          headers: {
            Authorization: `Bearer ${token}`, // Send the CSRF token as authorization
          },
        });
        console.log(response.data)
        setBookingsData(response.data);
      } catch (error) {
        console.error('Error fetching bookings data:', error);
      }
    };

    fetchBookings();
  }, []);

  function formatDate(created_at) {
    // Parse the input date string to a Date object
    const date = new Date(created_at);

    // Define an array of month names
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Extract the day, month, and year from the date object
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    // Return the formatted date string
    return `${month} ${String(day).padStart(2, '0')}, ${year}`;
}
  return (
    <div className="mainBookingContainer">
      <SearchBox />
    <div className="bookingHistoryContainer">
      <div className="filter">
        <button>
          <i className="fa-solid fa-filter"></i>
          Filter by status
        </button>
      </div>
      <div className="bookings">
        {bookingsData.map((booking, index) => (
          <div className="booking" key={index}>
            <div className="bookingCard">
              <div className="profileBooking">
                <div className="profile-icon profile-booking">
                <span> <i className="fa-regular fa-user"></i></span>
                </div> 
                  <div className="details">
                    <h2>{booking.service}</h2>
                    <p>Booked on: {formatDate(booking.created_at)}</p>
                  </div>
              </div>
              <div className="status">
                <span className="completed">Completed</span>
              </div>
            </div>
            <div className="amountDiv">
              <div>
                <p>Provider<br /> <span className="workerName">{booking.provider}</span></p>
              </div>
              <div>
                <p>Total <br /> <span className="rupeesAmount">{booking.payment}₹</span></p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination">
        <a href="#">Previous</a>
        <a href="#">1</a>
        <a href="#">2</a>
        <a href="#">3</a>
        <a href="#">Next</a>
      </div>
    </div>
        <NavBar />
    </div>
  );
};

export default Bookings;
