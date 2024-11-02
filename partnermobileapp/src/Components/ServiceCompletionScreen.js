import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Button, TouchableOpacity, Dimensions, BackHandler } from 'react-native';
import Feather from 'react-native-vector-icons/Feather'
import Mapbox from '@rnmapbox/maps';
Mapbox.setAccessToken('pk.eyJ1IjoieWFzd2FudGh2YW5hbWEiLCJhIjoiY2x5Ymw5MXZpMWZseDJqcTJ3NXFlZnRnYyJ9._E8mIoaIlyGrgdeu71StDg');
import Octicons from 'react-native-vector-icons/Octicons'
import axios from 'axios';
import { useNavigation, useRoute, CommonActions, useFocusEffect } from "@react-navigation/native";
import EncryptedStorage from 'react-native-encrypted-storage';

const ServiceCompletionScreen = ({ route }) => {

  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const [location, setLocation] = useState('');
  const [lastLocation, setLastLocation] = useState(null);
  const [center,setCenter] = useState([ 0,0])
  const [paymentDetails, setPaymentDetails] = useState({});
  const [decodedId, setDecodedId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const navigation = useNavigation();


  useEffect(() => {
    const { encodedId } = route.params;
    console.log("encod",encodedId)
    if (encodedId) {
      const decoded = atob(encodedId);
      console.log(atob(encodedId))
      setDecodedId(decoded);
    }
  }, [route.params]);

  const onBackPress = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
      })
    );
    return true;
  };

  useEffect(() => {
    if (decodedId) {
      const fetchPaymentDetails = async () => {
        try {
          const response = await axios.post(`${process.env.BackendAPI1}/api/worker/payment/service/completed/details`, {
            notification_id: decodedId,
          });

          const { payment, payment_type,service,longitude,latitude,area,city,pincode,name } = response.data;
          setCenter([longitude,latitude])
          // Ensure totalAmount is a number
          const amount = Number(totalAmount) || 0;
          setPaymentDetails({
            payment_type,service,longitude,latitude,area,city,pincode,name
          });
          setTotalAmount(payment);
        } catch (error) {
          console.error('Error fetching payment details:', error);
        }
      };
      fetchPaymentDetails();
    }
  }, [decodedId]);

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

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Service Completed with {paymentDetails.name}</Text>
      <Text style={styles.subHeading}>Collected amount in {paymentDetails.payment_type}</Text>

      {/* Payment Section */}
      <View style={styles.amountContainer}>
        <View >
          <Text style={styles.amount}>₹{totalAmount}</Text>
        </View>
        <View>
        < Feather name='check-circle' size={40} color='#4CAF50' />
        </View>
      </View>

      {/* Date and Time Section */}
      <Text style={styles.date}>26/04/2023 05:45 PM</Text>

      {/* Service Type Section */}
      <Text style={styles.serviceType}>{paymentDetails.service}</Text>

      {/* Location Details */}
      <View style={styles.locationContainer}>
        
        <Image
          style={styles.locationIcon}
          source={{ uri: 'https://i.postimg.cc/rpb2czKR/1000051859-removebg-preview.png' }} // Pin icon
        />
        <Text style={styles.locationText}>{paymentDetails.area}{paymentDetails.city},{paymentDetails.pincode}</Text>
        <Text style={styles.time}>5:45 PM</Text>
      </View>

      {/* Map Section */}
      {/* <Image
        style={styles.mapImage}
        source={{ uri: 'https://i.postimg.cc/9Fr1wynK/Image-4.png' }} // Replace with your map image URI
      /> */}

      <Mapbox.MapView style={styles.map}>
        <Mapbox.Camera zoomLevel={17} centerCoordinate={center} />
        <Mapbox.PointAnnotation id="current-location" coordinate={center}>
          <View style={styles.markerContainer}>
            <Octicons name="dot-fill" size={25} color="#0E52FB" />
          </View>
        </Mapbox.PointAnnotation>
      </Mapbox.MapView>

      {/* Done Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.doneButton} onPress={onBackPress}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  buttonContainer:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'center'
  },
  doneButton: {
    borderWidth:1,
    borderColor:'#FF5722',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop:10,
    width:250
  },
  doneText: {
    color: '#FF5722',
    fontSize: 15,
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color:'#212121',
    paddingTop:30,
    paddingBottom:10
  },
  subHeading: {
    fontSize: 14,
    color: '#9e9e9e',
    textAlign: 'center',
    marginBottom: 20,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
    marginTop:20,
    gap:10
  },
  amount: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#000',
  },
  icon: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  date: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 5,
  },
  serviceType: {
    fontSize: 16,
    fontWeight:'bold',
    marginBottom: 20,
    color:'#212121'
  },
  locationContainer: {
    flexDirection: 'row',

    marginBottom: 15,
  },
  locationIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  locationText: {
    fontSize: 14,
    color: '#212121',
  },
  time: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 10,
  },
  mapImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    marginVertical:20
  },
  map:{
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    marginVertical:20
  },

});

export default ServiceCompletionScreen;
