import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "@fortawesome/fontawesome-free/css/all.css"; // Import FontAwesome CSS
import "./WorkerNavigation.css";

const WorkerNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const routingControlRef = useRef(null);
  const [decodedId, setDecodedId] = useState(null);
  const [addressDetails, setAddressDetails] = useState(null);
  const [locationDetails, setLocationDetails] = useState({
    startPoint: [16.987142, 80.519353],
    endPoint: [17.1098751, 80.6093701],
  });

  const [showMessageBox, setShowMessageBox] = useState(false);
  const [city, setCity] = useState(""); // State for city
  const [area, setArea] = useState(""); // State for area
  const [pincode, setPincode] = useState(""); // State for pincode
  const [alternatePhoneNumber, setAlternatePhoneNumber] = useState("");
  const [alternateName, setAlternateName] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const encodedId = queryParams.get("encodedId");

    if (encodedId) {
      try {
        const decodedId = atob(encodedId);
        setDecodedId(decodedId);
        console.log(decodedId); // Ensure the decoded ID is correct
      } catch (error) {
        console.error("Error decoding Base64:", error);
      }
    }
  }, [location.search]);

  const fetchLocationDetails = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/location/navigation",
        {
          params: { notification_id: decodedId },
        }
      );
      console.log(response);
      const { startPoint, endPoint } = response.data;
      setLocationDetails({ startPoint, endPoint });
    } catch (error) {
      console.error("Error fetching location details:", error);
    }
  };

  const fetchAddressDetails = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/user/address/details",
        {
          params: { notification_id: decodedId },
        }
      );
      console.log(response.data);
      const { city, area, alternate_phone_number, alternate_name, pincode } =
        response.data;
      setArea(area);
      setCity(city);
      setPincode(pincode);
      setAlternatePhoneNumber(alternate_phone_number);
      setAlternateName(alternate_name);
      setAddressDetails(response.data); // Set the fetched address details
    } catch (error) {
      console.error("Error fetching address details:", error);
    }
  };

  useEffect(() => {
    if (decodedId) {
      fetchLocationDetails();
      const intervalId = setInterval(fetchLocationDetails, 5000); // Fetch every 10 seconds
      return () => clearInterval(intervalId); // Cleanup interval on unmount
    }
  }, [decodedId]);

  useEffect(() => {
    if (decodedId) {
      fetchAddressDetails(); // Fetch address details when the page loads
    }
  }, [decodedId]);

  useEffect(() => {
    if (decodedId) {
      fetchLocationDetails();
      const intervalId = setInterval(fetchLocationDetails, 10000); // Fetch every 10 seconds
      return () => clearInterval(intervalId); // Cleanup interval on unmount
    }
  }, [decodedId]);

  const handleCancelBooking = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/worker/tryping/cancel",
        {
          notification_id: decodedId,
        }
      );

      if (response.status === 200) {
        navigate("/");
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

  const checkCancellationStatus = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/worker/cancelled/status",
        {
          params: { notification_id: decodedId },
        }
      );

      const { notificationStatus } = response.data;

      if (notificationStatus === "timeup") {
        setShowMessageBox(true);
        setTimeout(() => {
          setShowMessageBox(false);
        }, 3000);
      } else if (notificationStatus === "usercanceled") {
        navigate("/");
      }
    } catch (error) {
      console.error("Error checking cancellation status:", error);
    }
  };

  useEffect(() => {
    if (decodedId) {
      const intervalId = setInterval(checkCancellationStatus, 3000); // Check every 3 seconds
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
        className: "custom-div-icon",
      });

      const endIcon = L.divIcon({
        html: '<i class="fa-solid fa-location-dot" style="color: red; font-size: 24px;"></i>',
        className: "custom-div-icon",
      });

      const startMarker = L.marker(locationDetails.startPoint, {
        icon: startIcon,
      }).addTo(map);
      const endMarker = L.marker(locationDetails.endPoint, {
        icon: endIcon,
      }).addTo(map);

      startMarker.bindPopup("Starting Point").openPopup();
      endMarker.bindPopup("Destination").openPopup();

      routingControlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(
            locationDetails.startPoint[0],
            locationDetails.startPoint[1]
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
          serviceUrl: "https://router.project-osrm.org/route/v1",
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
  console.log(addressDetails);

  const handleLocationReached = () => {
    const encodedNotificationId = btoa(decodedId);
    navigate(`/otp/verification?encodedId=${encodedNotificationId}`); // Navigate to the OTP verification path
  };

  return (
    <div className="navigationMainContainer">
      <MapContainer
        ref={mapRef}
        style={{ height: "70vh", width: "100%" }}
        center={locationDetails.startPoint}
        zoom={17}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
      <div className="worker-routing-user-conatiner">
        <div className="routing-profile-container">
          <div>
            <img
              src="https://i.postimg.cc/FzxxDZfb/IMG-20220317-203743-removebg-preview.png"
              alt="profile"
              className="skilledProfile"
            />
          </div>
          <div className="commander-name-container">
            <h1 className="commander-name">{alternateName}</h1>
          </div>
        </div>
        <div className="pin-call-container">
          <div className="pin-container">
            <div>
              <p>
                Address: <span className="pin-head">{city}</span> ,{" "}
                <span>{area}</span>, <span>{pincode}</span>
              </p>
            </div>
          </div>
          <div className="pin-container">
            <div className="worker-navigation-phone-icon">
              <i className="fa-solid fa-phone"></i>
            </div>
            <div>
              <p>{alternatePhoneNumber}</p>
            </div>
          </div>
        </div>
        {/* <div>
          <p className="commander-count">
            {alternateName} has worked as 10 times as Commander
          </p>
        </div> */}

        <div className="actions">
          <button className="accept-button" onClick={handleCancelBooking}>
            Cancel booking
          </button>
          <button className="reject-button" onClick={handleLocationReached}>
            Location Reached
          </button>
        </div>
      </div>
      {showMessageBox && (
        <div className="message-box-user-navigation">
          <p>Your cancellation time of 4 minutes is over.</p>
        </div>
      )}
    </div>
  );
};

export default WorkerNavigation;
