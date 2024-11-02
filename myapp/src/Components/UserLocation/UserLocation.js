import React, { useState, useEffect, useCallback, useRef } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookie from 'js-cookie';
import './UserLocation.css';

const UserLocation = () => {
  const [latitude, setLatitude] = useState(20.5937); // Default latitude of India
  const [longitude, setLongitude] = useState(78.9629); // Default longitude of India
  const [suggestions, setSuggestions] = useState([]);
  const [locationInput, setLocationInput] = useState('');
  const [currentLocationMarker, setCurrentLocationMarker] = useState(null);
  const [alternatePhoneNumber, setAlternatePhoneNumber] = useState('');
  const [alternateName, setAlternateName] = useState('');
  const [city, setCity] = useState(''); // State for city
  const [area, setArea] = useState(''); // State for area
  const [pincode, setPincode] = useState(''); // State for pincode
  const [service,setService] = useState('')
  

  const [currentPlace, setCurrentPlace] = useState({});
  const [showMessageBox, setShowMessageBox] = useState(false); // State for displaying message box
  const mapRef = useRef(null);
  const platformRef = useRef(null);
  const behaviorRef = useRef(null);
  const uiRef = useRef(null);

  const { name } = useParams(); // Destructure the name parameter

  useEffect(() => {
    setService(name); // Set the service state with the name parameter
  }, [name]);

  useEffect(() => {
    requestNotificationPermission();
    requestLocationPermission();
    initializeMap();
    getCurrentLocation(); // Ensure this is called to fetch location on page load

    return () => {
      if (mapRef.current) {
        mapRef.current.removeObjects(mapRef.current.getObjects());
      }
    };
  }, []);

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        console.log(
          permission === 'granted'
            ? 'Notification permission granted'
            : 'Notification permission denied',
        );
      });
    }
  };

  const requestLocationPermission = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => console.log('Location permission granted'),
        (error) => console.error('Location permission denied:', error.message),
      );
    }
  };

  const initializeMap = () => {
    if (mapRef.current) {
      return; // If map is already initialized, return
    }

    platformRef.current = new H.service.Platform({
      apikey: 'Wt0nBkP_kcThUD6OQ4GzIZJycwbtzxeGl-4NOT9BLiw',
    });
    const defaultLayers = platformRef.current.createDefaultLayers();
    const mapInstance = new H.Map(
      document.getElementById('loc'),
      defaultLayers.vector.normal.map,
      {
        zoom: 5,
        center: { lat: latitude, lng: longitude },
        pixelRatio: window.devicePixelRatio || 1,
      },
    );

    // Enable the map interaction behaviors (zooming and panning)
    behaviorRef.current = new H.mapevents.Behavior(
      new H.mapevents.MapEvents(mapInstance),
    );

    // Add the default UI components (like zoom buttons)
    uiRef.current = H.ui.UI.createDefault(mapInstance, defaultLayers);

    mapInstance.addEventListener('tap', handleMapTap);

    mapRef.current = mapInstance; // Store the map instance in the ref

    // Show current location marker initially
    updateMap(latitude, longitude);

    // Creating and appending pin button to map container
    const pinButton = document.createElement('i');
    pinButton.classList.add('bi', 'bi-crosshair2', 'pin-icon');

    // Adding click event listener to pin button
    pinButton.addEventListener('click', async () => {
      try {
        const position = await getCurrentPosition();
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        await sendDataToServer(
          position.coords.longitude,
          position.coords.latitude,
        );
        updateMap(position.coords.latitude, position.coords.longitude);

        // Adding or updating the current location marker
        if (!currentLocationMarker) {
          const newMarker = createCustomMarker(
            position.coords.latitude,
            position.coords.longitude,
          );
          mapRef.current.addObject(newMarker);
          setCurrentLocationMarker(newMarker);
        } else {
          currentLocationMarker.setGeometry({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        }
      } catch (error) {
        console.error('Error fetching location:', error);
        console.log('Error fetching location. Please try again later.');
      }
    });

    // Appending pin button to map container
    document.getElementById('loc').appendChild(pinButton);
  };

  const createCustomMarker = (lat, lng) => {
    const iconMarkup = `<i class="fa-sharp fa-solid fa-map-pin customMapIcon"></i>`;
    const icon = new H.map.DomIcon(iconMarkup);
    return new H.map.DomMarker({ lat, lng }, { icon });
  };

  const updateCurrentLocationMarker = useCallback(
    (newMarker) => {
      if (mapRef.current) {
        mapRef.current.getObjects().forEach((object) => {
          if (object instanceof H.map.DomMarker) {
            mapRef.current.removeObject(object);
          }
        });
        mapRef.current.addObject(newMarker);
      }
      setCurrentLocationMarker(newMarker);
    },
    [mapRef, setCurrentLocationMarker],
  );

  const handleMapTap = (evt) => {
    const coord = mapRef.current.screenToGeo(
      evt.currentPointer.viewportX,
      evt.currentPointer.viewportY,
    );
    const lat = coord.lat;
    const lng = coord.lng;
    setLatitude(lat);
    setLongitude(lng);
    updateMap(lat, lng);
    sendDataToServer(lng, lat);
    fetchAndSetPlaceDetails(lat, lng); // Fetch place details for the tapped location
    setSuggestions([]);
  };

  const getCurrentLocation = async () => {
    try {
      const position = await getCurrentPosition();
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      setLatitude(lat);
      setLongitude(lng);
      await sendDataToServer(lng, lat);
      updateMap(lat, lng);
      fetchAndSetPlaceDetails(lat, lng); // Fetch place details for the current location
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      } else {
        reject('Geolocation is not supported by this browser.');
      }
    });
  };

  const sendDataToServer = async (longitude, latitude) => {
    try {
      const token = Cookie.get('cs');
      const response = await axios.post(
        'http://localhost:5000/api/user/location',
        { longitude, latitude },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        console.log('User location sent to backend successfully');
      }
    } catch (error) {
      console.error('Failed to send user location to backend:', error);
    }
  };

  const fetchPlaceSuggestions = async (query) => {
    try {
      const response = await axios.get(
        `https://us1.locationiq.com/v1/autocomplete.php?key=pk.8bbe50a42004401570a4c08ad0e05f89&q=${query}`,
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching place suggestions:', error);
      return [];
    }
  };

  const handleSuggestionClick = (place) => {
    setLocationInput(`${place.display_name}, ${place.address.postcode}`);

    setCurrentPlace({
      name: place.display_name,
      pincode: place.address.postcode,
    });
    console.log(place)
    setCity(place.address.city || place.address.city || place.address.village ||place.address.town || place.address.name); // Set city to the place name if city is not available
    setArea(place.address.neighbourhood || place.address.suburb || place.address.area || place.address.area || place.address.road || ''); // Set area
    setPincode(place.address.postcode || '');

    let latitude = place.lat;
    let longitude = place.lon;

    updateMap(latitude, longitude);



    setSuggestions([]);
  };

  const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const handleLocationInputChange = (e) => {
    const query = e.target.value.trim();
    setLocationInput(query); // Update the locationInput state directly

    if (query.length >= 2) {
      fetchPlaceSuggestions(query).then((suggestions) => {
        setSuggestions(suggestions);
      });
    } else {
      setSuggestions([]);
    }
  };

  const removeCurrentLocationMarker = () => {
    if (currentLocationMarker) {
      mapRef.current.removeObject(currentLocationMarker);
      setCurrentLocationMarker(null);
    }
  };

  const updateMap = (lat, lng) => {
    if (mapRef.current) {
      mapRef.current.setCenter({ lat, lng });
      mapRef.current.setZoom(15);
      const newMarker = createCustomMarker(lat, lng);
      updateCurrentLocationMarker(newMarker);
    }
  };

  const handleConfirmLocation = async () => {
    setShowMessageBox(true); // Show message box when Confirm Location button is clicked
    const token = Cookie.get('cs');
    try {
      const response = await axios.get('http://localhost:5000/api/get/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      console.log(data);
      setAlternatePhoneNumber(data.phone_number || ''); // Set alternate phone number from response
      setAlternateName(data.name);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const fetchAndSetPlaceDetails = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://us1.locationiq.com/v1/reverse.php?key=pk.8bbe50a42004401570a4c08ad0e05f89&lat=${latitude}&lon=${longitude}&format=json`,
      );

      if (response.status === 200) {
        const address = response.data.address;

        const placeDetails = {
          city: address.city || address.village || address.town || '',
          area: address.neighbourhood || address.suburb || address.town || address.area || address.road || '',
          pincode: address.postcode || '',
        };
        console.log(placeDetails)
        setCity(placeDetails.city); // Set the city state
        setArea(placeDetails.area); // Set the area state
       setPincode(placeDetails.pincode); // Set the pincode state
      }
    } catch (error) {
      console.error('Failed to fetch place details:', error);
    }
  };

  const fetchPlaceDetails = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://us1.locationiq.com/v1/reverse.php?key=pk.8bbe50a42004401570a4c08ad0e05f89&lat=${latitude}&lon=${longitude}&format=json`,
      );
      // console.log('Place details:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return {};
    }
  };

  const navigate = useNavigate();


  const handleBookCommander = async () => {
    const jwtToken = Cookie.get('cs');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/workers-nearby',
        {area,
          city,
          pincode,
          alternateName,
          alternatePhoneNumber,
          service
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      );

      const data = response.data;
      console.log(data);

      if (response.status === 200) {
        navigate(`/loading/route?encodedId=${data}`, { replace: true });
      } else {
        console.error('Unexpected response status:', response.status);
      }
    } catch (error) {
      console.error('Error while fetching nearby workers:', error);
      // Handle error as needed
    }
  };

  return (
    <div className="user-location-container">
      <div
        id="loc"
        style={{
          width: '100%',
          height: '80vh',
          background: 'grey',
          position: 'relative',
        }}
      ></div>
      <div id="search-container" className="search-box">
        <input
          type="search"
          id="location-input"
          className="search-box1"
          placeholder="Enter your location"
          value={locationInput}
          onChange={handleLocationInputChange}
        />
        <i className="fa-solid fa-magnifying-glass search-icon locationSearchIcon"></i>
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion.display_name}
            </li>
          ))}
        </ul>
      </div>
      <div className="bookingcard" id="booking-card">
        <div>
          <h1 className="chargesDetails">
            Minimum 1st half an hour charges 149₹
          </h1>
        </div>
        <div>
          <h1 className="chargesDetailsExtra">
            After next every half and hour 49₹ charged
          </h1>
        </div>
        <div>
          <button
            type="button"
            className="btn confirmLocation"
            onClick={handleConfirmLocation}
          >
            Confirm Location
          </button>
        </div>
      </div>
      {showMessageBox && (
        <div>
          <div
            className="backdrop"
            onClick={() => setShowMessageBox(false)}
          ></div>
          <div
            className={`message-box-location ${showMessageBox ? 'show-message-box' : ''}`}
          >
            <h3 className="complete-address-head">Enter complete address!</h3>
            <form>
              <label htmlFor="city" className="messageBox-label">
                City
              </label>
              <br />
              <input
                type="text"
                id="city"
                className="complete-address-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <br />
              <label htmlFor="area" className="messageBox-label">
                Area
              </label>
              <br />
              <input
                type="text"
                id="area"
                className="complete-address-input"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
              <br />
              <label htmlFor="Pincode" className="messageBox-label">
                Pincode
              </label>
              <br />
              <input
                type="text"
                id="Pincode"
                className="complete-address-input"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
              <br />
              <label
                htmlFor="alternatePhoneNumber"
                className="messageBox-label"
              >
                Alternate phone number
              </label>
              <br />
              <input
                type="tel"
                id="alternatePhoneNumber"
                className="complete-address-input"
                value={alternatePhoneNumber}
                onChange={(e) => setAlternatePhoneNumber(e.target.value)}
              />
              <br />
              <label htmlFor="alternateName" className="messageBox-label">
                Alternate name
              </label>
              <br />
              <input
                type="text"
                id="alternateName"
                className="complete-address-input"
                value={alternateName}
                onChange={(e) => setAlternateName(e.target.value)}
              />
              <div className="booking-card">
                <div>
                  <p className="youBooking">You are booking</p>
                </div>
                <div>
                  <p className="bookingServiceName">{service}</p>
                </div>
              </div>
              <p></p>
              <div className="bookButtonContainer">
                <button
                  className="bookCaptainButton"
                  type="button"
                  onClick={handleBookCommander}
                >
                  Book Commander
                </button>
              </div>
            </form>

            <button
              className="closeButton"
              onClick={() => setShowMessageBox(false)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLocation;
