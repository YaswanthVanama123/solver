import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Button, Alert } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import EncryptedStorage from 'react-native-encrypted-storage';
import axios from 'axios';
import { useRoute, useNavigation, CommonActions } from '@react-navigation/native';

// Set your Mapbox access token here
Mapbox.setAccessToken('pk.eyJ1IjoieWFzd2FudGh2YW5hbWEiLCJhIjoiY2x5Ymw5MXZpMWZseDJqcTJ3NXFlZnRnYyJ9._E8mIoaIlyGrgdeu71StDg');

const Notifications = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [routeData, setRouteData] = useState(null);
  const [locationDetails, setLocationDetails] = useState({ startPoint: [80.519353, 16.987142], endPoint: [80.525467, 16.999680] });
  const [decodedId, setDecodedId] = useState(null);
  const [workerName, setWorkerName] = useState(null);
  const [pin, setPin] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [encodedData, setEncodedData] = useState(null);

  useEffect(() => {
    const encodedId  = 'MjU2';
    console.log('encoded id raa')
    setEncodedData(encodedId);
    if (encodedId) {
      try {
        const decodedId = atob(encodedId);
        console.log(decodedId)
        setDecodedId(decodedId);
      } catch (error) {
        console.error('Error decoding Base64:', error);
      }
    }
  }, []);

  const handleCancelBooking = async () => {
    try {
      const response = await axios.post(
        'http://10.0.2.2:5000/api/user/tryping/cancel',
        { notification_id: decodedId },
      );

      if (response.status === 200) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
          })
        );
      } else {
        Alert.alert('Cancellation failed', 'Your cancellation time of 2 minutes is over.');
      }
    } catch (error) {
      Alert.alert('Error', 'There was an error processing your cancellation.');
    }
  };

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const response = await axios.get(
          'http://10.0.2.2:5000/api/worker/verification/status',
          { params: { notification_id: decodedId } },
        );
        if (response.data === 'true') {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'worktimescreen', params: { encodedId: encodedData } }],
            })
          );
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
  }, [decodedId, navigation, encodedData]);

  useEffect(() => {
    const fetchData = async () => {
      const jwtToken = await EncryptedStorage.getItem('cs_token');
      try {
        const response = await axios.post(
          'http://10.0.2.2:5000/api/worker/navigation/details',
          { notificationId: decodedId },
          {
            headers: { Authorization: `Bearer ${jwtToken}` },
          },
        );
        if (response.status === 404) {
          navigation.navigate('SkillRegistration');
        }
        const { pin, name, phone_number } = response.data;
        console.log(response.data);
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
  }, [decodedId, navigation]);

  const fetchLocationDetails = async () => {
    try {
      const response = await axios.get(
        'http://10.0.2.2:5000/api/user/location/navigation',
        { params: { notification_id: decodedId } },
      );

      const { startPoint, endPoint } = response.data;
      console.log(endPoint);
      const parsedStartPoint = startPoint.map(coord => parseFloat(coord));
      const parsedEndPoint = endPoint.map(coord => parseFloat(coord));
      let reversedStart = [...parsedStartPoint].reverse();
      let reversedEnd = [...parsedEndPoint].reverse();
      console.log(reversedStart, reversedEnd);
      setLocationDetails({ startPoint: reversedStart, endPoint: reversedEnd });
    } catch (error) {
      console.error('Error fetching location details:', error);
    }
  };

  useEffect(() => {
    const startPoint = locationDetails.startPoint;
    const endPoint = locationDetails.endPoint;
    console.log(startPoint);
    console.log(endPoint);

    const fetchRoute = async () => {
      try {
        const response = await axios.get(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${startPoint.join(',')};${endPoint.join(',')}?alternatives=true&steps=true&geometries=geojson&access_token=pk.eyJ1IjoieWFzd2FudGh2YW5hbWEiLCJhIjoiY2x5Ymw5MXZpMWZseDJqcTJ3NXFlZnRnYyJ9._E8mIoaIlyGrgdeu71StDg`
        );

        if (response.data.routes && response.data.routes.length > 0) {
          const routeData = response.data.routes[0];
          if (routeData.geometry) {
            setRouteData(routeData.geometry);
            console.log(routeData.geometry);
          } else {
            console.error('Geometry property is missing in the route data.');
          }
        } else {
          console.error('No routes found in the response.');
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRoute();
  }, [locationDetails]);

  useEffect(() => {
    if (decodedId) {
      fetchLocationDetails();
      const intervalId = setInterval(() => {
        fetchLocationDetails();
      }, 40000);

      return () => clearInterval(intervalId);
    }
  }, [decodedId]);

  return (
    <View style={styles.container}>
      <Mapbox.MapView style={styles.map}>
        <Mapbox.Camera
          zoomLevel={14}
          centerCoordinate={locationDetails.startPoint}
        />
        {routeData && (
          <Mapbox.ShapeSource id="routeSource" shape={routeData}>
            <Mapbox.LineLayer
              id="routeLine"
              style={{ lineColor: '#007cbf', lineWidth: 5 }}
            />
          </Mapbox.ShapeSource>
        )}
      </Mapbox.MapView>
      <View style={styles.infoContainer}>
        <Text>{workerName} is arriving shortly</Text>
        <Text>PIN: {pin}</Text>
        <Text>Phone: {phoneNumber}</Text>
        <Button title="Cancel Booking" onPress={handleCancelBooking} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});

export default Notifications;
