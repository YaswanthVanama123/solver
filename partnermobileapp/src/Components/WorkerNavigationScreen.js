import React, { useEffect, useState, useCallback,useRef } from 'react';
import { View, StyleSheet, Text, Button, Alert, Image, BackHandler, Linking, Platform,Animated,PanResponder, PermissionsAndroid, TouchableOpacity, DimensionsAnimated, Easing,Dimensions } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import EncryptedStorage from 'react-native-encrypted-storage';
import axios from 'axios';
import { useRoute, useNavigation, CommonActions, useFocusEffect } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'


 
// Set your Mapbox access token here
Mapbox.setAccessToken('pk.eyJ1IjoieWFzd2FudGh2YW5hbWEiLCJhIjoiY2x5Ymw5MXZpMWZseDJqcTJ3NXFlZnRnYyJ9._E8mIoaIlyGrgdeu71StDg');

const WorkerNavigationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation(); 
  const [routeData, setRouteData] = useState(null);
  const [locationDetails, setLocationDetails] = useState({ startPoint: [80.519353, 16.987142], endPoint: [80.6093701, 17.1098751] });
  const [decodedId, setDecodedId] = useState(null);
  const [addressDetails, setAddressDetails] = useState(null);
  const [showMessageBox, setShowMessageBox] = useState(false);

  useEffect(() => {
    const { encodedId } = route.params;
    if (encodedId) {
      try {
        setDecodedId(atob(encodedId));
      } catch (error) {
        console.error('Error decoding Base64:', error);
      }
    }
  }, [route.params]);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'This app needs access to your location',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Location permission denied');
          }
        } catch (err) {
          console.warn(err);
        }
      }
    };

    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (decodedId) {
      const intervalId = setInterval(checkCancellationStatus, 3000);
      return () => clearInterval(intervalId);
    }
  }, [decodedId]);

  useEffect(() => {
    if (decodedId) {
      fetchAddressDetails()
      fetchLocationDetails();
    }
  }, [decodedId]);

  const checkCancellationStatus = async () => {
    try {
      const response = await axios.get(`${process.env.BackendAPI1}/api/worker/cancelled/status`, {
        params: { notification_id: decodedId },
      });

      if (response.data.notificationStatus === "usercanceled") {
        const pcs_token = await EncryptedStorage.getItem('pcs_token');
        await axios.post(`${process.env.BackendAPI1}/api/worker/action`, {
          encodedId: '',
          screen: ''
        }, {
          headers: { Authorization: `Bearer ${pcs_token}` }
        });

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
          })
        );
      }
    } catch (error) {
      console.error("Error checking cancellation status:", error);
    }
  };

  const handleCancelBooking = async () => {
    try {
      const response = await axios.post(`${process.env.BackendAPI1}/api/worker/tryping/cancel`, {
        notification_id: decodedId,
      });

      if (response.status === 200) {
        const pcs_token = await EncryptedStorage.getItem('pcs_token');
        await axios.post(`${process.env.BackendAPI1}/api/worker/action`, {
          encodedId: '',
          screen: ''
        }, {
          headers: { Authorization: `Bearer ${pcs_token}` }
        });

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
          })
        );
      } else {
        Alert.alert('Error', 'Unable to cancel booking');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to cancel booking');
    }
  };

  const arrowAnimation = useRef(new Animated.Value(0)).current;

  const handleSwipe = () => {
    Animated.timing(arrowAnimation, {
      toValue: 1,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(arrowAnimation, {
        toValue: 0,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    });
  };

  const arrowPosition = arrowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10], // The distance you want the arrow to swipe
  });

  const fetchAddressDetails = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.BackendAPI1}/api/user/address/details`, {
        params: { notification_id: decodedId },
      });
      setAddressDetails(response.data);
      console.log(response.data)
    } catch (error) {
      console.error('Error fetching address details:', error);
    }
  }, [decodedId]);

  const fetchLocationDetails = async () => {
    try {
      const response = await axios.post(`${process.env.BackendAPI1}/api/service/location/navigation`, {
        notification_id: decodedId
      });
      
      
      const { startPoint, endPoint } = response.data;
      console.log(startPoint,endPoint)
      setLocationDetails({
        startPoint: startPoint.map(coord => parseFloat(coord)),
        endPoint: endPoint.map(coord => parseFloat(coord)),
      });
    } catch (error) {
      console.error('Error fetching location details:', error);
    }
  };

  useEffect(() => {
    if (locationDetails.startPoint && locationDetails.endPoint) {
      const fetchRoute = async () => {
        try {
          const response = await axios.get(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${locationDetails.startPoint.join(',')};${locationDetails.endPoint.join(',')}?alternatives=true&steps=true&geometries=geojson&access_token=pk.eyJ1IjoieWFzd2FudGh2YW5hbWEiLCJhIjoiY2x5Ymw5MXZpMWZseDJqcTJ3NXFlZnRnYyJ9._E8mIoaIlyGrgdeu71StDg`
          );

          if (response.data.routes.length > 0) {
            setRouteData(response.data.routes[0].geometry);
          } else {
            console.error('No routes found in the response.');
          }
        } catch (error) {
          console.error('Error fetching route:', error);
        }
      };
      fetchRoute();
    }
  }, [locationDetails]);

  const handleLocationReached = async () => {
    const encodedNotificationId = btoa(decodedId);
    navigation.push('OtpVerification', { encodedId: encodedNotificationId });
  };

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

  

  const openGoogleMaps = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${locationDetails.endPoint[1]},${locationDetails.endPoint[0]}&travelmode=driving`;
        Linking.openURL(url).catch(err => console.error('Error opening Google Maps:', err));
      },
      (error) => {
        console.error('Error getting current location:', error);
      }
    );
  };



  return (
    <View style={styles.container}>
      <Mapbox.MapView style={styles.map}>
        <Mapbox.Camera
          zoomLevel={14}
          centerCoordinate={locationDetails.startPoint}
        />

        {/* Marker for Start Point */}
        <Mapbox.PointAnnotation
          id="start-point"
          coordinate={locationDetails.startPoint}
        >
          {/* <Image
            source={{ uri: 'https://your-image-url/start-point.png' }} // Add your start marker image URL or local asset
            style={styles.markerImage}
          /> */}
          <FontAwesome6 name='location-dot' size={25} color='#4CAF50'/>
        </Mapbox.PointAnnotation>

        {/* Marker for End Point */}
        <Mapbox.PointAnnotation
          id="end-point"
          coordinate={locationDetails.endPoint}
        >
          {/* <Image
            source={{ uri: 'https://your-image-url/end-point.png' }} // Add your end marker image URL or local asset
            style={styles.markerImage}
          /> */}
          <FontAwesome6 name='location-dot' size={25} color='#ff4500'/>
        </Mapbox.PointAnnotation>

        {routeData && (
          <Mapbox.ShapeSource id="routeSource" shape={routeData}>
            <Mapbox.LineLayer
              id="routeLine"
              style={styles.routeLine}
            />
          </Mapbox.ShapeSource>
        )}
      </Mapbox.MapView>
      <TouchableOpacity style={styles.googleMapsButton} onPress={openGoogleMaps}>
          <Text style={styles.googleMapsText} >Google Maps</Text>
          <MaterialCommunityIcons name='navigation-variant' size={20} color='#C1C1C1'/>
        </TouchableOpacity>
  
        {addressDetails && (  // Check if 'address' exists
          <View style={styles.detailsContainer}>
            <View style={styles.minimumChargesContainer}>
              <Text style={styles.serviceFare}>Minimum Service Fare: <Text style={styles.amount}>₹199</Text></Text>
            </View>

            {/* Service Location */}
            <View style={styles.locationContainer}>
              <Image
                source={{ uri: 'https://i.postimg.cc/rpb2czKR/1000051859-removebg-preview.png' }} // Replace with your worker image URL or local asset
                style={styles.locationPinImage}
              />
              <View style={styles.locationDetails}>
                <Text style={styles.locationTitle}>{addressDetails.city}</Text>
                <Text style={styles.locationAddress}>
                  {addressDetails.area}, {addressDetails.pincode}
                </Text>
              </View>
            </View>

            {/* Service Type */}
            <View style={styles.serviceDetails}>
              <View>
                <Text style={styles.serviceType}>Service</Text>
              </View>
              <View style={styles.iconsContainer}>
                <TouchableOpacity style={styles.actionButton}>
                  <MaterialIcons name="call" size={18} color="#FF5722" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <AntDesign name="message1" size={18} color="#FF5722" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.serviceText}>AC Service & Repairing</Text>
            <Text style={styles.pickupText}>You are at pickup location</Text>

            {/* Arrival Button */}
            <TouchableOpacity style={styles.arrivalButton} onPress={handleLocationReached}>
              <Text style={styles.arrivalButtonText}>I've ARRIVED</Text>
            </TouchableOpacity>
          </View>
        )}

    </View>
  );
};

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // arrivalButton: {
  //   backgroundColor: '#3498db',
  //   padding: 15,
  //   borderRadius: 8,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  // arrivalButtonText: {
  //   color: '#fff',
  //   fontSize: 18,
  //   marginRight: 8,
  // },
  serviceText:{
    color:'#212121',
    fontWeight:'bold',
    fontSize:16,
    marginTop:5
  },
  iconsContainer:{
    display:'flex',
    flexDirection:'row',
    gap:10
  },
  circleContainer:{
    width:30,
    height:30,
    borderRadius:15,
    backgroundColor:'#EFDCCB'
  },
  locationPinImage: {
    width: 20,
    height: 20,
    marginRight: 10,             // Add margin if you want space between the image and text
  },
  amount:{
    color:'#212121',
    fontSize:16,
    fontWeight:'bold'
  },
  serviceDetails:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
   
  },
  minimumChargesContainer:{
    height:46,
    backgroundColor:'#f6f6f6',
    borderRadius:32,
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    paddingTop:5
  },
  map: {
    flex: 1,
    minHeight: 0.35 * screenHeight,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 16,
    color: '#555',
  },
  phone: {
    fontSize: 16,
    color: '#555',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  routeLine: {
    lineColor: '#0000ff',
    lineWidth: 5,
  },



  googleMapsButton: {
    position: 'absolute',
    top: 0.49 * screenHeight,
    right:10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    elevation: 5,
    width:140,
    height:40
  },
  googleMapsText: {
    fontSize: 14,
    color: '#212121',
    fontWeight:'bold'
  },
  detailsContainer: {
    flex: 2,
    backgroundColor: '#ffffff',
    padding: 15,
    paddingHorizontal:20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  serviceFare: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    fontSize:16,
    color:'#9e9e9e'
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  locationDetails: {
    marginLeft: 10,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color:'#212121',
    
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
  },
  serviceType: {
    fontSize: 16,
    marginTop: 10,
    color:'#9e9e9e'
  },
  pickupText: {
    fontSize: 16,
    color: '#212121',
    marginTop: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  actionButton: {
    backgroundColor: '#EFDCCB',
    height:35,
    width:35,
    borderRadius: 50,
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center'

  },
  arrivalButton: {
    backgroundColor: '#FF5722',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal:25
  },
  arrivalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WorkerNavigationScreen;
