import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const Navigation = () => {
  const mapRef = useRef(null);
  const startPoint = [16.987142, 80.519353]; // Starting point (latitude, longitude)
  const endPoint = [17.1098751, 80.6093701]; // Ending point (latitude, longitude)

  useEffect(() => {
    const initializeMap = async () => {
      // Wait for map instance to be available
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (mapRef.current) {
            clearInterval(interval);
            resolve();
          }
        }, 100); // Check every 100ms
      });

      const map = mapRef.current;

      // Add start and end markers with popups
      const startMarker = L.marker(startPoint).addTo(map);
      const endMarker = L.marker(endPoint).addTo(map);

      startMarker.bindPopup('Starting Point').openPopup();
      endMarker.bindPopup('Destination').openPopup();

      // Initialize the routing control
      L.Routing.control({
        waypoints: [
          L.latLng(startPoint[0], startPoint[1]),
          L.latLng(endPoint[0], endPoint[1])
        ],
        routeWhileDragging: true,
        showAlternatives: false,
        createMarker: function(i, wp) {
          return L.marker(wp.latLng, {
            draggable: true,
            icon: L.icon({
              iconUrl: require('leaflet/dist/images/marker-icon.png').default,
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })
          });
        },
        router: L.Routing.osrmv1({
          serviceUrl: 'https://api.mapbox.com/directions/v5/mapbox/driving', // Example for Mapbox
          profile: 'mapbox/driving',
          accessToken: 'your-mapbox-access-token' // Replace with your Mapbox access token
        }),
        fitSelectedRoutes: true,
        show: true
      }).addTo(map);
    };

    initializeMap();
  }, [startPoint, endPoint]);

  return (
    <MapContainer
      ref={mapRef}
      style={{ height: '100vh', width: '100%' }}
      center={startPoint}
      zoom={13}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
};

export default Navigation;
