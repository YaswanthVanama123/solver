import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import EncryptedStorage from "react-native-encrypted-storage";
import uuid from 'react-native-uuid';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';

const UserNotifications = () => {
  // Sample static data for notifications
  const [notificationsArray,setNotificationsArray] = useState([])
  const notifications = [
    { id: '1', title: 'New Service Request', body: 'You have a new service request from John Doe.' },
    { id: '2', title: 'Payment Received', body: 'You have received a payment of $50 from Jane Doe.' },
    { id: '3', title: 'Service Completed', body: 'Your service for Alice has been marked as completed.' },
  ];
  const navigation = useNavigation();
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;


  const fetchNotifications = async () => {
    const userId = await EncryptedStorage.getItem('cs_token');
    const fcmToken = await EncryptedStorage.getItem('fcm_token'); 
    console.log(process.env.REACT_APP_API_URL)
    const response = await axios.get(`${process.env.BACKEND}/api/user/notifications`, {
      headers: {
        Authorization: `Bearer ${userId}`,
      },
      params: {
        fcmToken: fcmToken, // Pass fcmToken as a query parameter
      },
    });
    
    const notifications = response.data;
    setNotificationsArray(notifications)
    console.log('User notifications:', notifications);
  };
  
  useEffect(() => {
    fetchNotifications();
  }, []);
  


  // Handle button click
  const handleButtonClick = (encodedid) => {
    console.log("encod",encodedid)
    //navigation.push('Acceptance', { userNotificationId: encodedid });
    // Here, you can also navigate to a different screen or perform other actions.
  };

  // Render each notification
  const renderItem = ({ item }) => (
    <View style={styles.notificationContainer}>
      <View style={styles.notificationHead}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationTitle}>{moment(item.receivedat).format('HH:mm')}</Text>
      </View>
      <Text style={styles.notificationBody}>{item.body}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleButtonClick(item.encodedid)}
      >
        <Text style={styles.buttonText}>View</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.notificationMainContainer, {minHeight:screenHeight}, {minWidth:screenWidth}]}>
      <Text style={styles.header}>Notifications</Text>
      <FlatList
        data={notificationsArray}
        renderItem={renderItem}
        keyExtractor={item => uuid.v4()}
      /> 
    </View>
  );
};

const styles = StyleSheet.create({
  notificationMainContainer: {
    backgroundColor: 'white',
    padding: 20,
    
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color:'#000'
  },
  notificationHead: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  notificationContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
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

export default UserNotifications;
