import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookie from 'js-cookie';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import '@fortawesome/fontawesome-free/css/all.css'; // Import FontAwesome CSS
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const routingControlRef = useRef(null);
  const [decodedId, setDecodedId] = useState(null);
  const [workerName,setWorkerName] = useState(null);
  const [pin,setPin] = useState(null);
  const [phoneNumber,setPhoneNumber] = useState(null)
  const [encodedId,setEncodedId] = useState(null)
  const [locationDetails, setLocationDetails] = useState({
    startPoint: [16.987142, 80.519353],
    endPoint: [17.1098751, 80.6093701],
  });
  const [showMessageBox, setShowMessageBox] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const encodedId = queryParams.get('encodedId');
    setEncodedId(encodedId)
    if (encodedId) {
      try {
        const decodedId = atob(encodedId);
        setDecodedId(decodedId);
        console.log(decodedId); // Ensure the decoded ID is correct
      } catch (error) {
        console.error('Error decoding Base64:', error);
      }
    }
  }, [location.search]);

  const fetchLocationDetails = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/user/location/navigation',
        {
          params: { notification_id: decodedId },
        },
      );
      console.log(response);
      const { startPoint, endPoint } = response.data;
      setLocationDetails({ startPoint, endPoint });
    } catch (error) {
      console.error('Error fetching location details:', error);
    }
  };

  useEffect(() => {
    if (decodedId) {
      fetchLocationDetails();
      const intervalId = setInterval(fetchLocationDetails, 10000); // Fetch every 10 seconds
      return () => clearInterval(intervalId); // Cleanup interval on unmount
    }
  }, [decodedId]);

  useEffect(() => {
    const initializeMap = async () => {
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (mapRef.current) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });

      const map = mapRef.current;

      const startIcon = L.divIcon({
        html: '<i class="fa-regular fa-circle-dot" style="color: green; font-size: 24px;"></i>',
        className: 'custom-div-icon',
      });

      const endIcon = L.divIcon({
        html: '<i class="fa-solid fa-location-dot" style="color: red; font-size: 24px;"></i>',
        className: 'custom-div-icon',
      });

      const startMarker = L.marker(locationDetails.startPoint, {
        icon: startIcon,
      }).addTo(map);
      const endMarker = L.marker(locationDetails.endPoint, {
        icon: endIcon,
      }).addTo(map);

      startMarker.bindPopup('Starting Point').openPopup();
      endMarker.bindPopup('Destination').openPopup();

      routingControlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(
            locationDetails.startPoint[0],
            locationDetails.startPoint[1],
          ),
          L.latLng(locationDetails.endPoint[0], locationDetails.endPoint[1]),
        ],
        routeWhileDragging: true,
        showAlternatives: false,
        createMarker: function (i, wp) {
          return L.marker(wp.latLng, {
            draggable: true,
            icon: i === 0 ? startIcon : endIcon,
          });
        },
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
        }),
        fitSelectedRoutes: false,
        show: false,
      });

      if (routingControlRef.current) {
        setTimeout(() => {
          routingControlRef.current.addTo(map);
        }, 1000);
      }

      setTimeout(() => {
        routingControlRef.current.addTo(map);
      }, 1000);

      map.setView(locationDetails.startPoint, 17);
    };

    initializeMap();
  }, [locationDetails]);

  const handleCancelBooking = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/user/tryping/cancel',
        {
          notification_id: decodedId,
        },
      );

      if (response.status === 200) {
        navigate('/');
      } else {
        setShowMessageBox(true);
        setTimeout(() => {
          setShowMessageBox(false);
        }, 3000);
      }
    } catch (error) {
      setShowMessageBox(true);
      setTimeout(() => {
        setShowMessageBox(false);
      }, 3000);
    }
  };

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/worker/verification/status',
          {
            params: { notification_id: decodedId },
          },
        );
        // Log the response and its type for debugging
        console.log(`Response data: ${response.data}`);
        console.log(`Type of response.data: ${typeof response.data}`);
  
        // Ensure response.data is a boolean
        if (response.data === "true") {
          clearInterval(verificationInterval); // Clear the interval if the status is true
          navigate(`/Timing/count?encodedId=${encodedId}`);
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    };
  
    let verificationInterval;
    if (decodedId) {
      verificationInterval = setInterval(checkVerificationStatus, 3000); // Check every 3 seconds
    }
  
    return () => clearInterval(verificationInterval); // Cleanup interval on unmount
  }, [decodedId, navigate]);
  

  useEffect(() => {
    const fetchData = async () => {
      const jwtToken = Cookie.get('pcs');
      try {
        const response = await axios.post('http://localhost:5000/api/worker/navigation/details', 
          { notificationId: decodedId }, // Send notificationId in the body
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
        console.log(response);
        if(response.status === 404){
          navigate(`/skill/registration`);
        }
        const { pin, name, phone_number } = response.data;
        setPin(pin);
        setWorkerName(name);
        setPhoneNumber(phone_number);
      } catch (error) {
        console.error('There was an error fetching the data!', error);
      }
    };

    if (decodedId) {
      fetchData();
    }
  }, [decodedId, navigate]);

  useEffect(() => {
    let cancelStatusInterval;

    const checkCancelStatus = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/user/cancelled/status',
          {
            params: { notification_id: decodedId },
          },
        );
        console.log(response);
        if (response.data === 'timeup') {
          clearInterval(cancelStatusInterval);
        } else if (response.data === 'workercanceled') {
          clearInterval(cancelStatusInterval);
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking cancel status:', error);
      }
    };

    if (decodedId) {
      cancelStatusInterval = setInterval(checkCancelStatus, 3000); // Check every 3 seconds
    }

    return () => clearInterval(cancelStatusInterval); // Cleanup interval on unmount
  }, [decodedId, navigate]);

  return (
    <div className="navigationMainContainer">
      <MapContainer
        ref={mapRef}
        style={{ height: '100vh', width: '100%' }}
        center={locationDetails.startPoint}
        zoom={17}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
      <div className="routing-user-conatiner">
        <div className="routing-profile-container">
          <div>
            <img
              src="https://i.postimg.cc/FzxxDZfb/IMG-20220317-203743-removebg-preview.png"
              alt="profile"
              className="skilledProfile"
            />
          </div>
          <div className="commander-name-container">
            <h1 className="commander-name">{workerName} is arriving shortly</h1>
          </div>
        </div>
        <div className="pin-call-container">
          <div className="pin-container">
            <div>
              <p className="pin-head">PIN:</p>
            </div>
            <div>
              <p>{pin}</p>
            </div>
          </div>
          <div className="pin-container">
            <div>
              <i className="fa-solid fa-phone"></i>
            </div>
            <div>
              <p>{phoneNumber}</p>
            </div>
          </div>
        </div>
        <div>
          <p className="commander-count">
            Yaswanth has worked as 10 times as Commander
          </p>
        </div>
        <div className="user-commander-cancelButton-container">
          <button
            type="button"
            className="user-commander-cancelButton"
            onClick={handleCancelBooking}
          >
            Cancel Booking
          </button>
        </div>
      </div>
      {showMessageBox && (
        <div className="message-box-user-navigation">
          <p>Your cancellation time of 2 minutes is over.</p>
        </div>
      )}
    </div>
  );
};

export default Navigation;
