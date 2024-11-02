import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert,SafeAreaView } from 'react-native';
import EncryptedStorage from "react-native-encrypted-storage";
import uuid from 'react-native-uuid';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'
import Entypo from 'react-native-vector-icons/Octicons'

const Notifications = () => {
  // Sample static data for notifications
  const [notificationsArray,setNotificationsArray] = useState([ [
    { id: '1', title: 'New Service Request', body: 'You have a new service request from John Doe.' },
    { id: '2', title: 'Payment Received', body: 'You have received a payment of $50 from Jane Doe.' },
    { id: '3', title: 'Service Completed', body: 'Your service for Alice has been marked as completed.' },
  ]])
  const notifications = [
    { id: '1', title: 'New Service Request', body: 'You have a new service request from John Doe.' },
    { id: '2', title: 'Payment Received', body: 'You have received a payment of $50 from Jane Doe.' },
    { id: '3', title: 'Service Completed', body: 'Your service for Alice has been marked as completed.' },
  ];
  const navigation = useNavigation();


  const fetchNotifications = async () => {
    const userId = await EncryptedStorage.getItem('pcs_token');
    const fcmToken = await EncryptedStorage.getItem('fcm_token');
    
    const response = await axios.get(`${process.env.BackendAPI1}/api/worker/notifications`, {
      headers: {
        Authorization: `Bearer ${userId}`,
      },
      params: {
        fcmToken: fcmToken, // Pass fcmToken as a query parameter
      },
    });
    
    const notifications = response.data;
    setNotificationsArray(notifications)
    const existingNotifications = await EncryptedStorage.getItem('notifications');
  };
  
  useEffect(() => {
    fetchNotifications();
  }, []); 
  


  const acceptRequest = (data) => {
    // If `data` is a string, uncomment the next line to parse it
    // data = JSON.parse(data);
    
    console.log("Accepted request data:", data); // Log the data for debugging
  
  
    // Further processing can be done here
  };
  
  
  

  // Render each notification
  const renderItem = ({ item }) => (
    <View style={styles.notificationContainer}>
      <View style={styles.serviceContainer}> 
        <View style={styles.labelContainer}>
          <Text style={styles.primaryText}>Service</Text>
        </View>
        <View style={styles.valueContainer}>
          <Text style={styles.secondaryText}>{item.title}</Text>
        </View>
      </View>
      <View style={styles.serviceContainer}> 
        <View style={styles.labelContainer}>
          <Text style={styles.primaryText}>Location</Text>
        </View>
        <View style={styles.valueContainer}>
          <Text style={styles.locationText}>{item.body}</Text>
        </View>
      </View>
      <View>
        <Text style={styles.notificationTime}>{item.receivedat}</Text>
      </View>
      <View style={styles.buttonsContainer}>
        <View>
          <Text style={styles.secondaryColor}>Reject</Text>
        </View>
        <View>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => acceptRequest(item.encodedid)} // Pass item.data to acceptRequest
          >
            <Text style={styles.secondaryButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  

  return (
    <SafeAreaView style={styles.screenContainer}>
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <FontAwesome6 name='arrow-left-long' size={20} color='#9e9e9e' style={styles.leftIcon} /> */}
        <Text style={styles.screenName}>Notifications</Text>
      </View>
      <View style={styles.notificationStatus}>
        <View style={styles.statusTextContainer}>
          <Entypo name="dot-fill" size={20} color='yellow' />
          <Text style={styles.notificationStatusText}>All</Text>
        </View>
        <View style={styles.statusTextContainer}>
          <Entypo name="dot-fill" size={20} color='#4CAF50' />
          <Text style={styles.notificationStatusText}>Accepted</Text>
        </View>

        <View style={styles.statusTextContainer}>
          <Entypo name="dot-fill" size={20} color='#FF5722' />
          <Text style={styles.notificationStatusText}>Rejected</Text>
        </View>
      </View>
      <FlatList
        data={notificationsArray}
        renderItem={renderItem}
        keyExtractor={item => uuid.v4()}
      />
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom:70
  },
  container: {

    padding: 20,
    backgroundColor: '#ffffff',
  },
  notificationTime:{
    color:'#9e9e9e',
    textAlign:'right',
    paddingBottom:10
  },
  secondaryButton:{
    backgroundColor:'#FF5722',
    width:120,
    height:36,
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10
  },
  secondaryButtonText:{
    color:'#ffffff',
    fontSize:14,
    lineHeight:16,
    fontWeight:'600'
  },
  buttonsContainer:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    marginTop:10
  },
  secondaryColor:{
    color:'#9e9e9e',
    fontSize:16
  },
  primaryText:{
    color:'#9E9E9E',
    fontSize:14,
  },
  secondaryText:{
    color:'#212121',
    fontSize:14,
    fontWeight:'bold'
  },
  locationText:{
    color:'#212121',
    fontSize:14,
  },
  serviceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align items at the top (for multiline text)
    marginBottom: 10, // Add space between rows
  },
  labelContainer: {
    flex: 1, // Ensures both labels have the same width
  },
  valueContainer: {
    flex: 3, // Ensures the value has more space
  },
  statusTextContainer: {
    flexDirection: 'row', // Aligns icon and text in the same row
    alignItems: 'center', // Vertically centers the text with the icon
  },
  notificationStatusText:{
    color:'#212121',
    fontSize:15,
    display:'flex',
    flexDirection:'row',
    alignSelf:'center',
    marginLeft:5
  },
  notificationStatus:{
    display:'flex',
    flexDirection:'row',
    gap:25,
    marginTop:15,
    paddingLeft:10,
    marginBottom:20
  },
  leftIcon: {
    position: 'absolute', // Ensure the icon stays on the left
    left: 10, // Adjust the position to your needs
  },
  screenName:{
    color:'#747476',
    fontSize:17,
    fontWeight:'bold'
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center', // Center vertically
    justifyContent: 'center', // Center all content horizontally
    paddingVertical: 5,
    position: 'relative',
  },
  notificationHead: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  notificationContainer: {
    padding: 15,
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    marginTop: 20,
    flexDirection: 'column',
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color:'#000'
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Notifications;
