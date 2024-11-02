import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, Button, Alert, BackHandler } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import EncryptedStorage from 'react-native-encrypted-storage';
import axios from 'axios';
import { useRoute, useNavigation, CommonActions, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Fontisto';
import FontAwesome6 from 'react-native-vector-icons/MaterialIcons';

// Set your Mapbox access token here
Mapbox.setAccessToken('pk.eyJ1IjoieWFzd2FudGh2YW5hbWEiLCJhIjoiY2x5Ymw5MXZpMWZseDJqcTJ3NXFlZnRnYyJ9._E8mIoaIlyGrgdeu71StDg');

const Navigation = () => { 
  const route = useRoute();
  const navigation = useNavigation();
  const [routeData, setRouteData] = useState(null);
  const [locationDetails, setLocationDetails] = useState({ startPoint: [80.519353, 16.987142], endPoint: [80.6093701, 17.1098751] });
  const [decodedId, setDecodedId] = useState(null);
  const [workerName, setWorkerName] = useState(null);
  const [pin, setPin] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [encodedData, setEncodedData] = useState(null);

  // Decode the encoded ID from route params
  useEffect(() => {
    const { encodedId } = route.params;
    setEncodedData(encodedId);
    if (encodedId) {
      try {
        setDecodedId(atob(encodedId));
      } catch (error) {
        console.error('Error decoding Base64:', error);
      }
    }
  }, [route.params]);

  // Handle back press and reset navigation state
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
          })
        );
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  // Handle booking cancellation
  const handleCancelBooking = async () => {
    try {
      const response = await axios.post(
        `${process.env.BACKENDAIP}/api/user/work/cancel`,
        { notification_id: decodedId },
      );

      if (response.status === 200) {
        const cs_token = await EncryptedStorage.getItem('cs_token');
        await axios.post(`${process.env.BACKENDAIP}/api/user/action`, {
          encodedId: encodedData,
          screen: ''
        }, {
          headers: {
            Authorization: `Bearer ${cs_token}`
          }
        });

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

  // Check verification status periodically
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const response = await axios.get(
          `${process.env.BACKENDAIP}/api/worker/verification/status`,
          { params: { notification_id: decodedId } },
        );

        if (response.data === 'true') {
          const cs_token = await EncryptedStorage.getItem('cs_token');
          await axios.post(`${process.env.BACKENDAIP}/api/user/action`, {
            encodedId: encodedData,
            screen: 'worktimescreen'
          }, {
            headers: {
              Authorization: `Bearer ${cs_token}`
            }
          });

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
      // verificationInterval = setInterval(checkVerificationStatus, 3000);
      checkVerificationStatus()
    }

    return () => clearInterval(verificationInterval);
  }, [decodedId, encodedData, navigation]);

  // Fetch worker and location details
  useEffect(() => {
    const fetchData = async () => {
      const jwtToken = await EncryptedStorage.getItem('cs_token');
      try {
        const response = await axios.post(
          `${process.env.BACKENDAIP}/api/worker/navigation/details`,
          { notificationId: decodedId },
          { headers: { Authorization: `Bearer ${jwtToken}` } },
        );
        if (response.status === 404) {
          navigation.navigate('SkillRegistration');
        } else {
          const { pin, name, phone_number } = response.data;
          setPin(pin);
          setWorkerName(name);
          setPhoneNumber(phone_number);
        }
      } catch (error) {
        console.error('Error fetching worker details:', error);
      }
    };

    if (decodedId) {
      fetchData();
    }
  }, [decodedId, navigation]);

  // Fetch location details and route
  useEffect(() => {
    const fetchLocationDetails = async () => {
      try {
        const response = await axios.get(
          `${process.env.BACKENDAIP}/api/user/location/navigation`,
          { params: { notification_id: decodedId } },
        );

        const { startPoint, endPoint } = response.data;
        const reversedStart = startPoint.map(coord => parseFloat(coord)).reverse();
        const reversedEnd = endPoint.map(coord => parseFloat(coord)).reverse();
        setLocationDetails({ startPoint: reversedStart, endPoint: reversedEnd });
        fetchRoute(reversedStart, reversedEnd);
      } catch (error) {
        console.error('Error fetching location details:', error);
      }
    };

    const fetchRoute = async (startPoint, endPoint) => {
      try {
        const response = await axios.get(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${startPoint.join(',')};${endPoint.join(',')}?alternatives=true&steps=true&geometries=geojson&access_token=pk.eyJ1IjoieWFzd2FudGh2YW5hbWEiLCJhIjoiY2x5Ymw5MXZpMWZseDJqcTJ3NXFlZnRnYyJ9._E8mIoaIlyGrgdeu71StDg`
        );

        if (response.data.routes?.length > 0) {
          const routeData = response.data.routes[0].geometry;
          setRouteData(routeData);
        } else {
          console.error('No routes found in the response.');
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    if (decodedId) {
      fetchLocationDetails();
      const intervalId = setInterval(fetchLocationDetails, 60000);
      return () => clearInterval(intervalId);
    }
  }, [decodedId]);

  return (
    <View style={styles.container}>
      <Mapbox.MapView style={styles.map}>
        <Mapbox.Camera zoomLevel={16} centerCoordinate={locationDetails.endPoint} />

        {routeData && (
          <Mapbox.ShapeSource id="routeSource" shape={routeData}>
            <Mapbox.LineLayer id="routeLine" style={styles.routeLine} />
          </Mapbox.ShapeSource>
        )}

        {/* Use PointAnnotation with a custom vector icon as a marker */}
        <Mapbox.PointAnnotation id="startPoint" coordinate={locationDetails.startPoint}>
          <View style={styles.markerContainer}>
            {/* Wrap Icon inside a view to ensure proper rendering */}
            <View style={styles.iconContainer}>
              <FontAwesome6 name="circle" size={20} color="#2196C4" />
            </View>
            <Text style={styles.markerLabel}></Text>
          </View>
        </Mapbox.PointAnnotation>

        <Mapbox.PointAnnotation id="endPoint" coordinate={locationDetails.endPoint}>
          <View style={styles.markerContainer}>
            <View style={styles.iconContainer}>
              <Icon name="map-marker-alt" size={25} color="red" />
            </View>
            <Text style={styles.markerLabel}></Text>
          </View>
        </Mapbox.PointAnnotation>
      </Mapbox.MapView>

      {/* Other UI components remain the same */}
      <Text style={styles.infoText}>Pin: {pin}</Text>
      <Text style={styles.infoText}>Worker Name: {workerName}</Text>
      <Text style={styles.infoText}>Phone Number: {phoneNumber}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Cancel Booking" onPress={handleCancelBooking} color="#007bff" />
      </View>
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'green',
    borderWidth: 3,
    borderColor: 'white',
  },
  endMarker: {
    backgroundColor: 'red',
  },
  markerLabel: {
    marginTop: 5,
    color: 'black',
  },
  routeLine: {
    lineColor: '#007bff',
    lineWidth: 5,
  },
  infoText: {
    padding: 10,
    fontSize: 16,
    color:'#000'
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
});

export default Navigation;
