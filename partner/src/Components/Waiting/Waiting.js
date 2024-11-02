import React from 'react';
import './Waiting.css'; // Assuming you have a CSS file for styling

const RideRequest = () => {
  const handleAccept = () => {
    // Handle accept logic here
    console.log("Ride accepted");
  };

  const handleDecline = () => {
    // Handle decline logic here
    console.log("Ride declined");
  };

  return (
    <div className='accept-main-container'>
    <div className="ride-request">
      <h1>New Ride Request</h1>
      <div className="info">
        <img src="https://via.placeholder.com/40" alt="User" />
        <div>
          <p>John Doe</p>
          <p>Passenger</p>
        </div>
      </div>
      <div className="location">
        <p>Pickup</p>
        <span>123 Main St, San Francisco, CA</span>
      </div>
      <div className="location">
        <p>Dropoff</p>
        <span>456 Oak Rd, San Francisco, CA</span>
      </div>
      <div className="estimate">
        <div>
          <p>Estimated Duration</p>
          <p>20 mins</p>
        </div>
        <div>
          <p>Estimated Distance</p>
          <p>5.2 miles</p>
        </div>
      </div>
      <div className="buttons">
        <button className="decline" onClick={handleDecline}>Decline</button>
        <button className="accept" onClick={handleAccept}>Accept</button>
      </div>
    </div>
    </div>
  );
};

export default RideRequest;
