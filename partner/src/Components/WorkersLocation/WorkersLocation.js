import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

function WorkersLocation() {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    const pcsToken = Cookies.get('pcs'); // Get the PCS token from cookies

    const sendLocationToBackend = async (latitude, longitude) => {

      try {
       const response =  await axios.post(
          'http://localhost:5000/api/worker/location/update',
          {
            latitude,
            longitude,
          },
          {
            headers: {
              Authorization: `Bearer ${pcsToken}`, // Use the PCS token from the cookie
            },
          }
        );
        console.log(response)
      } 
 
      catch (error) {
        console.error('Error sending location to backend:', error);
      }
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        sendLocationToBackend(latitude, longitude);
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: Infinity,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <div>
      <h1>Location Tracker</h1>
      <p>
        Latitude: {location.latitude}
        <br />
        Longitude: {location.longitude}
      </p>
    </div>
  );
}

export default WorkersLocation;
