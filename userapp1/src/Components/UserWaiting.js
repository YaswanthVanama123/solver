import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, BackHandler, StyleSheet, Dimensions, Image } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute, CommonActions, useFocusEffect } from '@react-navigation/native';
import EncryptedStorage from 'react-native-encrypted-storage';
import LottieView from 'lottie-react-native';
import { Buffer } from 'buffer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Octicons from 'react-native-vector-icons/Octicons'
import Mapbox from '@rnmapbox/maps';
Mapbox.setAccessToken('pk.eyJ1IjoieWFzd2FudGh2YW5hbWEiLCJhIjoiY2x5Ymw5MXZpMWZseDJqcTJ3NXFlZnRnYyJ9._E8mIoaIlyGrgdeu71StDg');


const WaitingUser = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [decodedId, setDecodedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('waiting');
  const [cancelMessage, setCancelMessage] = useState('');
  const [city, setCity] = useState(null);
  const [area, setArea] = useState(null);
  const [pincode, setPincode] = useState(null);
  const [alternatePhoneNumber, setAlternatePhoneNumber] = useState(null);
  const [location,setLocation] = useState([])
  const [service, setService] = useState(null);
  const [alternateName, setAlternateName] = useState(null);
  const [encodedData, setEncodedData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const attemptCountRef = useRef(0);

  useEffect(() => {
    if (encodedData && encodedData !== 'No workers found within 2 km radius') {
      try {
        const decoded = Buffer.from(encodedData, 'base64').toString('utf-8');
        setDecodedId(decoded);
      } catch (error) {
        console.error('Error decoding Base64:', error);
      }
    }
  }, [encodedData]);

  const fetchData = async () => {
    const { area, city, pincode, alternateName, alternatePhoneNumber, serviceBooked, location } = route.params;
    setCity(city);
    setArea(area);
    setPincode(pincode);
    setAlternatePhoneNumber(alternatePhoneNumber);
    setAlternateName(alternateName);
    setService(serviceBooked);
    setLocation(location)

    try {
      const jwtToken = await EncryptedStorage.getItem('cs_token');
      if (!jwtToken) {
        Alert.alert('Error', 'No token found');
        return;
      }

      const response = await axios.post(
        `${process.env.BACKENDAIP}/api/workers-nearby`,
        { area, city, pincode, alternateName, alternatePhoneNumber, serviceBooked },
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );

      if (response.status === 200) {
        const encode = response.data;
        setEncodedData(encode);
        console.log(encode)
        if (encode && encode !== 'No workers found within 2 km radius') {
          await axios.post(
            `${process.env.BACKENDAIP}/api/user/action`,
            { encodedId: encode, screen: 'userwaiting', serviceBooked, area, city, pincode, alternateName, alternatePhoneNumber },
            { headers: { Authorization: `Bearer ${jwtToken}` } }
          );
        }
      } else {
        Alert.alert('Error', 'Unexpected response status');
      }
    } catch (error) {
      console.error('Error fetching nearby workers:', error);
      Alert.alert('Error', 'Failed to fetch nearby workers');
    }
  };

  useEffect(() => {
    const { encodedId } = route.params;
    if (encodedId && encodedData !== 'No workers found within 2 km radius') {
      setEncodedData(encodedId);
      try {
        const decoded = Buffer.from(encodedId, 'base64').toString('utf-8');
        setDecodedId(decoded);
      } catch (error) {
        console.error('Error decoding Base64:', error);
      }
    } else {
      fetchData();
    }
  }, [route.params]);

  const handleManualCancel = async () => {
    try {
      if (decodedId) {
        await axios.post(`${process.env.BACKENDAIP}/api/user/cancellation`, { user_notification_id: decodedId });

        const cs_token = await EncryptedStorage.getItem('cs_token');
        await axios.post(
          `${process.env.BACKENDAIP}/api/user/action/cancel`,
          { encodedId: encodedData, screen: 'userwaiting' },
          { headers: { Authorization: `Bearer ${cs_token}` } } 
        );
      }

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
        })
      );
    } catch (error) {
      console.error('Error calling cancellation API:', error);
      setCancelMessage('Cancel timed out');
      setTimeout(() => setCancelMessage(''), 3000);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
        })
      );
    }
  };

  const handleCancelAndRetry = async () => {
    attemptCountRef.current += 1;

    if (attemptCountRef.current > 3) {
      Alert.alert("No workers found", "Unable to find workers after 3 attempts. Please try again later.");
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
        })
      );
      return;
    }

    if (decodedId) {
      try {
        await axios.post(`${process.env.BACKENDAIP}/api/user/cancellation`, { user_notification_id: decodedId });
      } catch (error) {
        console.error("Error cancelling previous request:", error);
      }
    }

    const cs_token = await EncryptedStorage.getItem('cs_token');
    await axios.post(
      `${process.env.BACKENDAIP}/api/user/action/cancel`,
      { encodedId: encodedData, screen: 'userwaiting' },
      { headers: { Authorization: `Bearer ${cs_token}` } }
    );

    await fetchData();
  };

  useEffect(() => {
    let intervalId;
    if (decodedId || encodedData === 'No workers found within 2 km radius') {
      intervalId = setInterval(handleCancelAndRetry, 120000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [decodedId, encodedData]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get(`${process.env.BACKENDAIP}/api/checking/status`, {
          params: { user_notification_id: decodedId }
        });
    
        console.log('API Response:', response.data);
    
        const { status, notification_id } = response.data;
    
        // Update type checks to accommodate number type for notification_id
        if (typeof status !== 'string' || typeof notification_id !== 'number') {
          throw new TypeError('Unexpected type in API response');
        }
    
        if (status === 'accept') {
          setStatus('accepted');
          // Convert notification_id to a string if needed
          const encodedNotificationId = Buffer.from(notification_id.toString(), 'utf-8').toString('base64');
          const cs_token = await EncryptedStorage.getItem('cs_token');
    
          await axios.post(
            `${process.env.BACKENDAIP}/api/user/action/cancel`,
            { encodedId: encodedData, screen: 'userwaiting' },
            { headers: { Authorization: `Bearer ${cs_token}` } }
          );

          await axios.post(
            `${process.env.BACKENDAIP}/api/user/action`,
            { encodedId: encodedNotificationId, screen: 'UserNavigation', serviceBooked: service },
            { headers: { Authorization: `Bearer ${cs_token}` } }
          );



    
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'UserNavigation', params: { encodedId: encodedNotificationId, service: service } }]
            })
          );
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };
    
    
    

    if (decodedId) {
      // const intervalId = setInterval(checkStatus, 3000);
      // return () => clearInterval(intervalId);
      checkStatus()
    }
  }, [decodedId, navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert('Cancel', 'Are you sure you want to cancel?', [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', onPress: handleManualCancel },
        ]);
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        // Retrieve the stored time from EncryptedStorage
        const storedTime = await EncryptedStorage.getItem(`estimatedTime${service}`);
        console.log("Stored Time:", storedTime);
  
        // If no stored time, set it to current time in milliseconds
        if (!storedTime) {
          const currentTime = Date.now(); // in milliseconds
          await EncryptedStorage.setItem(`estimatedTime${service}`, currentTime.toString());
          setTimeLeft(600); // Set timer to 10 minutes (600 seconds)
        } else {
          // Convert stored time to integer (milliseconds)
          const savedTime = parseInt(storedTime, 10);
          const currentTime = Date.now(); // Current time in milliseconds
  
          // Calculate time difference in seconds
          const timeDifference = Math.floor((currentTime - savedTime) / 1000);
  
          // Calculate remaining time, ensuring it's non-negative
          const remainingTime = 600 - timeDifference; // 10 minutes = 600 seconds
          setTimeLeft(remainingTime > 0 ? remainingTime : 0);
        }
      } catch (error) {
        console.error('Error loading data from EncryptedStorage:', error);
      }
    };
  
    loadData();
  
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0)); // Countdown
    }, 1000); // Update every second
  
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);
  

    // Format time into MM:SS
    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

  return (
    // <View style={styles.container}>
    //   <Text style={styles.title}>Finding the nearest worker for you</Text>
    //   <View style={styles.loadingContainer}>
    //     {loading && (
    //       <LottieView
    //         source={require('../assets/waitingLoading.json')}   
    //         autoPlay
    //         loop
    //         style={styles.loadingAnimation}
    //       />
    //     )}
    //   </View>
    //   <View style={styles.waitingDetailsContainer}>
    //     <Text style={styles.estimatedTimeText}>Estimated waiting time</Text>
    //     <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
    //     {/* <Text style={styles.subtitle}>Please wait</Text> */}
    //     <View style={styles.locationMainContainer}>
    //       <View style={styles.locationIconContainer}>
    //         <MaterialCommunityIcons name="map-marker-outline" size={24} color="#4B5563" />
    //         <Text style={styles.locationHead}>Your Location</Text>
    //       </View>
    //       <View style={styles.locationSubContainer}>
    //         <Text style={styles.addressHeading}>City: <Text>{city}</Text></Text>
    //         <Text style={styles.addressHeading}>Area: <Text>{area}</Text></Text>
    //         <Text style={styles.addressHeading}>Pincode: <Text>{pincode}</Text></Text>
    //         <Text style={styles.addressHeading}>PhoneNumber: <Text>{alternatePhoneNumber}</Text></Text>
    //       </View>
    //     </View>
    //     <View style={styles.waitingText}>
    //       <View style={styles.locationInfoIconContainer}>
    //         <Octicons name="info" size={16} color="rgb(59, 130, 246);" />
    //         <Text style={styles.greet}>We are currently finding the best nearby worker to help you out</Text>
    //         </View>
    //     </View>
    //     <View style={styles.buttonContainer}>
          
    //       <TouchableOpacity style={styles.button} onPress={handleManualCancel}>
    //         <Text style={styles.buttonText}>Cancel</Text>
    //       </TouchableOpacity>
    //     </View>
    //     {cancelMessage && <Text style={styles.errorText}>{cancelMessage}</Text>}
    //   </View>
    // </View>
    <View style={styles.container}>
    {/* <View style={styles.loadingContainer}>
      {loading && (
        <LottieView
          source={require('../assets/waitingLoading.json')}   
          autoPlay
          loop
          style={styles.loadingAnimation}
        />
      )}
    </View> */}
<Mapbox.MapView style={styles.map}>
  <Mapbox.Camera
    zoomLevel={16}
    centerCoordinate={location}
  />
  
  {/* Center Marker */}
  <Mapbox.MarkerView coordinate={location}>
    <Image
      source={{ uri: 'https://i.postimg.cc/Y00Xwk5f/1000049891-removebg-preview.png' }} // Your marker image URL
      style={styles.markerImage}
    />
    </Mapbox.MarkerView>
  </Mapbox.MapView>
      <View style={styles.messageBox}>
        <View style={styles.innerButton}>
          <View style={styles.addingMessageBox} />

        </View>
        <View style={styles.detailsContainer}>
            <View>
              <Text style={styles.searchingText}>Searching for your</Text>
              <Text style={styles.serviceName}>Socket Reparing</Text>
            </View>
            <View>
              <TouchableOpacity style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        <View>
          <Text style={styles.locationDetails}><Text style={styles.locationHeadDetails}>Location: </Text>Vijayawada,RTC Workshop road</Text>
        </View>
        <View style={styles.horizontalLine} />
            <View style={styles.loadingContainer}>
              {loading && (
                <LottieView
                  source={require('../assets/waitingLoading.json')}   
                  autoPlay
                  loop
                  style={styles.loadingAnimation}
                />
              )}
            </View>
      </View> 

  </View>
  
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor:'f5f5f5',
  },
  locationHeadDetails:{
    color:'#121212',
    fontWeight:'bold',
    fontSize:16
  },
  serviceName:{
    color:'#121212',
    fontWeight:'bold',
    fontSize:18
  },
  searchingText:{
    color:'#121212',
    fontSize:14,
    fontWeight:'400'
  },
  horizontalLine: {
    width: Dimensions.get('window').width,
    height: 1, // Height of the line
    backgroundColor: '#E5E7EB', // Color of the line,
    marginTop:20,
    height:5
},
  locationDetails:{
    paddingLeft:10
  },
  cancelButtonText:{
    textAlign:'center'
  },
  cancelButton:{
    padding:10,
    borderWidth:0.5,
    borderColor:'#CEDEEB',
    width:90,
    borderRadius:20
  },
  innerButton:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'center'
  },
  addingMessageBox:{
    width:60,
    height:4,
    backgroundColor:'#E5E7EB',
    marginTop:10,
    borderRadius:10,
  },
  detailsContainer:{
    padding:10,
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between'
  },
  messageBox: {
    position: 'absolute',
    bottom: 0,                // Aligns it at the bottom
    height: '44%',            // 40% of the screen height
    width: '100%',            // Full width of the screen
    backgroundColor: '#f8f8f8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    display:'flex',
    flexDirection:'column'
  },
  messageText: {
    fontSize: 18,
    color: '#333',
  },
  map:{
    height:"60%"
  },
  markerImage: {
    width: 25, // Adjust size as needed
    height: 50, // Adjust size as needed
    resizeMode: 'contain',
  },
  locationSubContainer:{
    backgroundColor:'#d4d6d8',
    padding:20,
    marginTop:10,
    borderRadius:10
  },
  locationHead:{
    color:'#68707C',
    marginLeft:10,
    fontSize:15,
    fontWeight:'500'
  },
  locationIconContainer:{
    flexDirection: 'row',
    alignItems: 'center', // Center items vertically
  },
  locationInfoIconContainer:{
    flexDirection: 'row',
  },
  addressHeading:{
    color:'rgb(75, 85, 99)'
  },
  locationMainContainer:{
    backgroundColor:'#e9e9e6',
    padding:20,
    width:'100%',
    borderRadius:10,
    marginTop:15,
    marginBottom:10
  },
  waitingText:{
    backgroundColor:'#EFF6FF',
    padding:10,
    marginTop:20
  },
  waitingDetailsContainer:{
    display:'flex',
    alignItems:'center'
  },
  timer: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'rgb(59, 130, 246)',
    marginBottom:10
  },
  loadingContainer:{
    // width: Dimensions.get('window').width, // Set width to screen width
    marginHorizontal:'auto',
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    marginTop:40,
    height:'100%',
    
  },
  estimatedTimeText:{
    color:'#333333',
    fontSize:18,
    fontWeight:'600'
    // color: 'rgb(59, 130, 246)'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily:'Roboto',
    marginBottom: 15,
    color: '#000',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: '#888',
  },
  loadingAnimation: {
    width: 130,
    height: 130,
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  greet: {
    fontSize: 13,
    marginBottom: 10,
    textAlign: 'center',
    color: 'rgb(30, 64, 175)',
    marginLeft:10
  },
  button: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    fontSize: 14,
  },
});

export default WaitingUser;
