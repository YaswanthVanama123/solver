import React, { useState,useEffect,useRef } from 'react';
import {
  Dimensions,
  StyleSheet,
  Switch,
  View,
  Text,
  Touchable,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
Mapbox.setAccessToken('pk.eyJ1IjoieWFzd2FudGh2YW5hbWEiLCJhIjoiY2x5Ymw5MXZpMWZseDJqcTJ3NXFlZnRnYyJ9._E8mIoaIlyGrgdeu71StDg');
import BackgroundGeolocation, {
  Location,
  Subscription 
} from "react-native-background-geolocation";
import EncryptedStorage from 'react-native-encrypted-storage';
import haversine from 'haversine';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment-timezone';
import Entypo from 'react-native-vector-icons/Entypo';
import Octicons from 'react-native-vector-icons/Octicons';
import AntDesign from 'react-native-vector-icons/AntDesign'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, CommonActions, useFocusEffect } from "@react-navigation/native";
import axios from 'axios';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import Feather from 'react-native-vector-icons/Feather'


const HelloWorld = () => {
  const [enabled, setEnabled] = React.useState(true);
  const [location, setLocation] = React.useState('');
  const [lastLocation, setLastLocation] = React.useState(null);
  const [center,setCenter] = useState([0, 0])
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const navigation = useNavigation();
  const [notificationsArray,setNotificationsArray] =useState([])
  const [fcm,setFcm] = useState(null);
  const [screenName,setScreenName] = useState(null)
  const [params,setParams] = useState(null)
  const [messageBoxDisplay, setMessageBoxDisplay] = useState(false);


  const [isEnabled, setIsEnabled] = useState(false);
  const navigationRef = useRef(null);

  // const toggleSwitch = () => {
  //   setIsEnabled(prevState => {
  //     const newEnabledState = !prevState;
  //     if (newEnabledState) {
  //       // Start tracking when enabled
  //       BackgroundGeolocation.start();
  //     } else {
  //       // Stop tracking when disabled
  //       BackgroundGeolocation.stop();
  //       setLocation('');
  //     }
  //     return newEnabledState;
  //   });
  // };

  const toggleSwitch = async () => {
    setIsEnabled(prevState => {
      const newEnabledState = !prevState;

      if (newEnabledState) {
        // Start tracking when enabled
        BackgroundGeolocation.start();
      } else {
        // Stop tracking when disabled
        BackgroundGeolocation.stop();
        setLocation('');
      }

      // Store the new enabled state in EncryptedStorage
      EncryptedStorage.setItem('trackingEnabled', JSON.stringify(newEnabledState)).catch(error => {
        console.error('Error saving enabled state:', error);
      });

      return newEnabledState;
    });
  };

  const fetchTrackingState = async () => {
    try {
      const storedState = await EncryptedStorage.getItem('trackingEnabled');
      if (storedState !== null) {
        setIsEnabled(JSON.parse(storedState)); // Update the state from storage
      }
    } catch (error) {
      console.error('Error fetching tracking state:', error);
    }
  };

  useEffect(() => {
    const fetchTrackDetails = async () => {
      try {
        const pcs_token = await EncryptedStorage.getItem('pcs_token');
        
        if(pcs_token){
        const response = await axios.get(`${process.env.BackendAPI1}/api/worker/track/details`, {
          headers: { Authorization: `Bearer ${pcs_token}` },
        });
        console.log(response)
        const { route, parameter } = response.data;
        const params = JSON.parse(parameter)
        
   
        if(route === "" || route === null || route === undefined ){
          setMessageBoxDisplay(false)
        }
        else{
          setMessageBoxDisplay(true) 
        }
        
        // Update state with the response data
        setScreenName(route);
        setParams(params);
      }
      } catch (error) {
        console.error('Error fetching track details:', error);
      }
    };

    fetchTrackDetails();
  }, []);

  useEffect(() => {
    fetchTrackingState(); // Fetch the switch state when component mounts
  }, []);

  useEffect(() => {
    if (isEnabled) {
      BackgroundGeolocation.start(); // Start tracking if enabled
    } else {
      BackgroundGeolocation.stop(); // Stop tracking if disabled
    }
  }, [isEnabled]);

  const earningsScreen = ()=>{
    navigation.push('Earnings');
  }

  const sendCoordinatesToServer = async (latitude, longitude) => {
    try {
      const Item = await EncryptedStorage.getItem('unique');
      if (Item) {
        const locationsCollection = firestore().collection('locations');
        const locationData = {
          location: new firestore.GeoPoint(latitude, longitude),
          timestamp: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
          worker_id: parseInt(Item, 10) // Convert Item to an integer
        };
        const snapshot = await locationsCollection
          .where('worker_id', '==', locationData.worker_id)
          .limit(1)
          .get();
        if (!snapshot.empty) {
          const docId = snapshot.docs[0].id;
          await locationsCollection.doc(docId).update({
            location: locationData.location,
            timestamp: locationData.timestamp
          });
          console.log('Location data updated with (0, 0) coordinates.');
        } else {
          await locationsCollection.add(locationData);
          console.log('New location data with (0, 0) sent to Firestore successfully.');
        }
      }
    } catch (error) {
      console.error('Error sending (0, 0) coordinates to Firestore:', error);
    }
  };
  

  React.useEffect(() => {
    const initializeGeolocation = async () => {
      const pcsToken = await EncryptedStorage.getItem('pcs_token');
      
      if (pcsToken) {
        const onLocation: Subscription = BackgroundGeolocation.onLocation(async (location) => {
          const priviousLocation = await EncryptedStorage.getItem('workerPreviousLocation');
  
          if (priviousLocation) {
            const locationData = JSON.parse(priviousLocation);
            const { coords } = location;
            setCenter([coords.longitude, coords.latitude]);
            console.log(coords);
            const distance = haversine(
              { latitude: locationData.latitude, longitude: locationData.longitude },
              { latitude: coords.latitude, longitude: coords.longitude },
              { unit: 'km' }
            );
  
            if (distance >= 1) { // 1 kilometer
              sendLocationToServer(location); // Send updated location to server
              const { latitude, longitude } = location.coords;
              await EncryptedStorage.setItem('workerPreviousLocation', JSON.stringify({ latitude, longitude }));
            }
          } else {
            const { latitude, longitude } = location.coords;
            await EncryptedStorage.setItem('workerPreviousLocation', JSON.stringify({ latitude, longitude }));
            sendLocationToServer(location);
          }
        });
  
        const onGeofence: Subscription = BackgroundGeolocation.onGeofence(async (geofence) => {
          if (geofence.action === 'ENTER') {
            console.log(`Entered geofence: ${geofence.identifier}`);
            // Start sending geolocation updates when user re-enters a geofence
            BackgroundGeolocation.start();
          } else if (geofence.action === 'EXIT') {
            console.log(`Exited geofence: ${geofence.identifier}`);
            // Send (0, 0) coordinates to the backend when user exits a geofence
            sendCoordinatesToServer(0, 0);
            BackgroundGeolocation.stop(); // Stop location tracking when exiting geofence
            await EncryptedStorage.setItem('workerPreviousLocation', JSON.stringify(null)); // Clear stored location
          }
        });
  
        const geofences = [
          {
            identifier: 'Gampalagudem',
            radius: 10000, // 10 km radius
            latitude: 16.998121,
            longitude: 80.5230137,
            notifyOnEntry: true,
            notifyOnExit: true,
          },
          {
            identifier: 'Los Angeles',
            radius: 10000, // 10 km radius
            latitude: 34.0522,
            longitude: -118.2437,
            notifyOnEntry: true,
            notifyOnExit: true,
          },
          {
            identifier: 'Chicago',
            radius: 10000, // 10 km radius
            latitude: 41.8781,
            longitude: -87.6298,
            notifyOnEntry: true,
            notifyOnExit: true,
          }
        ];
  
        BackgroundGeolocation.ready({
          desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
          distanceFilter: 1, // Update location every 1 meter
          stopTimeout: 5,
          debug: true,
          logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
          stopOnTerminate: false,
          startOnBoot: true,
          batchSync: false,
          autoSync: true,
        }).then((state) => {
          setEnabled(state.enabled);
          geofences.forEach((geofence) => {
            BackgroundGeolocation.addGeofence(geofence).then(() => {
              console.log(`Geofence for ${geofence.identifier} added successfully`);
            }).catch((error) => {
              console.error(`Failed to add geofence for ${geofence.identifier}: `, error);
            });
          });
        });
  
        return () => {
          onLocation.remove();
          onGeofence.remove();
        };
      } else {
        console.log('pcs_token is not available, skipping location tracking.');
      }
    };
  
    initializeGeolocation();
  }, []);
  
  React.useEffect(() => {
    if (enabled) {
      BackgroundGeolocation.start();
    } else {
      BackgroundGeolocation.stop();
      setLocation('');
    }
  }, [enabled]);

  const sendLocationToServer = async (location) => {
    try {
      const Item = await EncryptedStorage.getItem('unique');
      if (Item) {
        const locationsCollection = firestore().collection('locations');
        const { latitude, longitude } = location.coords;
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        if (isNaN(lat) || isNaN(lon)) {
          throw new Error('Invalid latitude or longitude values');
        }
        const locationData = {
          location: new firestore.GeoPoint(lat, lon),
          timestamp: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
          worker_id: parseInt(Item, 10) // Convert Item to an integer
        };
        const snapshot = await locationsCollection
          .where('worker_id', '==', locationData.worker_id)
          .limit(1)
          .get();
        if (!snapshot.empty) {
          const docId = snapshot.docs[0].id;
          await locationsCollection.doc(docId).update({
            location: locationData.location,
            timestamp: locationData.timestamp
          });
          console.log('Location data updated successfully.');
        } else {
          await locationsCollection.add(locationData);
          console.log('New location data sent to Firestore successfully.');
        }
      }
    } catch (error) {
      console.error('Error sending location data to Firestore:', error);
    }
  };

  // const fetchNotifications = async () => {

  //   const userId = await EncryptedStorage.getItem('pcs_token');
  //   const fcmToken = await EncryptedStorage.getItem('fcm_token');
   
  //   const response = await axios.get(`${process.env.BackendAPI1}/api/worker/notifications`, {
  //     headers: {
  //       Authorization: `Bearer ${userId}`,
  //     },
  //     params: {
  //       fcmToken: fcmToken, // Pass fcmToken as a query parameter
  //     },
  //   });
    
  //   const notifications = response.data;
  //   setNotificationsArray(notifications)
  //   console.log('User notifications:', notifications);
  // };

  const acceptRequest = async (data) => { 
    const decodedId = atob(data);
    console.log("dec",decodedId)
    try {
      const jwtToken = await EncryptedStorage.getItem('pcs_token');
      const response = await axios.post(`${process.env.BackendAPI1}/api/accept/request`,
        { user_notification_id: decodedId },
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );

      if (response.status === 200) {
        const { notificationId } = response.data;
        const encodedNotificationId = btoa(notificationId);
        const pcs_token = await EncryptedStorage.getItem('pcs_token'); 
          
        // Send data to the backend
        await axios.post(`${process.env.BackendAPI1}/api/worker/action`, {
          encodedId: encodedNotificationId,
          screen: 'WorkerNavigation'
        }, { 
          headers: {
            Authorization: `Bearer ${pcs_token}`
          }
        });

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'WorkerNavigation', params: { encodedId: encodedNotificationId } }],
          })
        );
      } else {
        console.error('Unexpected response status:', response.status);
        const pcs_token = await EncryptedStorage.getItem('pcs_token'); 
          
        // Send data to the backend
        await axios.post(`${process.env.BackendAPI1}/api/worker/action`, {
          encodedId: "",
          screen: ''
        }, {
          headers: {
            Authorization: `Bearer ${pcs_token}`
          }
        });


        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
          })
        );
      }
    } catch (error) {
      console.error('Error while sending acceptance:', error);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
        })
      );
    }
  };
  
  useEffect(() =>{
    const notifications = async () =>{
      const existingNotifications = await EncryptedStorage.getItem('Requestnotifications');
      let notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
      console.log("use",notifications)
      // setNotificationsArray(notifications);

      // Manually parse receivedAt (from DD/MM/YYYY, HH:mm:ss to MM/DD/YYYY HH:mm:ss)


      const currentDate = new Date();

      // Filter notifications received within the past 10 minutes
      const filteredNotifications = notifications.filter((noti) => {
        const [notiDatePart, notiTimePart] = noti.receivedAt.split(', ');
        const [notiDay, notiMonth, notiYear] = notiDatePart.split('/');
        const parsedNotiReceivedAt = `${notiYear}-${notiMonth}-${notiDay}T${notiTimePart}`;
        const notiReceivedAt = new Date(parsedNotiReceivedAt);

        const timeDifferenceInMinutes = (currentDate - notiReceivedAt) / (1000 * 60); // milliseconds to minutes
        console.log(notiReceivedAt, currentDate, timeDifferenceInMinutes, noti.receivedAt);

        return timeDifferenceInMinutes <= 10;
      });

      // Update the notifications array with the filtered notifications
      notifications = filteredNotifications;
      console.log("Filtered Notifications:", notifications);

      // Update the notifications array and store locally
      setNotificationsArray(notifications);

      // Store updated notifications in local storage
      await EncryptedStorage.setItem('Requestnotifications', JSON.stringify(notifications));
    }
    notifications()
  },[])

  // useEffect(() => {
  //   const notifications = async () => {
  //     const existingNotifications = await EncryptedStorage.getItem('Requestnotifications');
  //     let notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
  //     console.log("not",notifications)
  //     // Get the current time
  //     const currentTime = new Date();
  
  //     // Filter notifications from the past 10 minutes
  //     const filteredNotifications = notifications.filter(notification => {
  //       const notificationDate = notification.data.date; // Assuming format 'YYYY-MM-DD'
  //       const notificationTime = notification.data.time; // Assuming format 'HH:mm'
  //       console.log(notificationDate,notificationTime)
  //       // Combine date and time into a single string
  //       const notificationDateTimeString = `${notificationDate}T${notificationTime}:00`;
  //       const notificationDateTime = new Date(notificationDateTimeString);
  
  //       // Calculate the difference in minutes
  //       const timeDifference = (currentTime - notificationDateTime) / (1000 * 60); // Difference in minutes
  
  //       // Return true if the notification is within the past 10 minutes
  //       return timeDifference <= 10 && timeDifference >= 0;
  //     });
  
  //     console.log("Filtered Notifications", filteredNotifications);
  //     setNotificationsArray(filteredNotifications);
  //   };
    
  //   notifications();
  // }, []);
  

  useEffect(() => {
    async function requestUserPermission() {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
      }
    }


    async function requestNotificationPermission() {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: "Notification Permission",
          message:
            "This app needs access to your notifications " +
            "so you can receive important updates.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the notifications");
      } else {
        console.log("Notification permission denied");
      }
    }

    const getTokens = async () => {
      try {
        const token = await messaging().getToken();
        console.log("work",token)
        setFcm(token)
        // Store or update the FCM token in encrypted storage
        await EncryptedStorage.setItem('fcm_token', token);

        // Retrieve pcs_token from storage
        const pcs_token = await EncryptedStorage.getItem('pcs_token');
        
        // Send the token to the backend
        
        await axios.post(`${process.env.BackendAPI1}/api/worker/store-fcm-token`, 
          { fcmToken: token },
          { headers: { Authorization: `Bearer ${pcs_token}` } }
        );

      } catch (error) {
        console.error('Error storing FCM token in the backend:', error);
      }
    };

    requestUserPermission();
    getTokens();
    requestNotificationPermission();

    // Create notification channel
    PushNotification.createChannel(
      { 
        channelId: "default-channel-id", 
        channelName: "Default Channel", 
        channelDescription: "A default channel", 
        soundName: "default", 
        importance: 4, 
        vibrate: true, 
      },
      (created) => console.log(`createChannel returned '${created}'`) 
    );

    const storeNotificationInBackend = async (notification, fcm) => {
      try {
        const pcs_token = await EncryptedStorage.getItem('pcs_token');
        const fcmToken = await EncryptedStorage.getItem('fcm_token');
        await axios.post(
          `${process.env.BackendAPI1}/api/worker/store-notification`, 
          { notification, fcmToken }, // data object
          { headers: { Authorization: `Bearer ${pcs_token}` } } // configuration with headers
        );
    
        console.log('Notification stored in backend:', notification);
      } catch (error) {
        console.error('Failed to store notification in backend:', error);
      }
    };
    
     
    // const storeNotificationLocally = async (notification) => {
    //   console.log("stored in locally is it true",notification)
    //   try {
    //     const existingNotifications = await EncryptedStorage.getItem('Requestnotifications');
    //     let notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
    //     console.log(notifications)
    //     notifications.push(notification);
    //     console.log("exist",existingNotifications)

        
    //     setNotificationsArray(notifications);
    
    //     await EncryptedStorage.setItem('Requestnotifications', JSON.stringify(notifications));
    //     console.log('Notification stored locally:', notification);
    
    //     // Also store in backend
    //     storeNotificationInBackend(notification);
    //   } catch (error) {





    //     console.error('Failed to store notification locally:', error);
    //   }
    // };
    // const storeNotificationLocally = async (notification) => {
    //   console.log("Stored locally is it true", notification.data,notification.data.user_notification_id);
    
    //   // Check if notification has notification.data.notification_id
    //   if (notification.data.screen === 'Acceptance') {
    //     try {
    //       const existingNotifications = await EncryptedStorage.getItem('Requestnotifications');
    //       let notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
    //       console.log(notifications);
          
    //       // Add the notification to the array
    //       notifications.push(notification);
    //       console.log("Existing Notifications:", existingNotifications);

    //       // Get the receivedAt time from the notification
    //       const receivedAt = notification.receivedAt; // e.g., "04/10/2024, 20:54:09"
    //       const notificationDate = new Date(receivedAt);
    //       const currentDate = new Date();

    //       // Filter notifications received within the past 10 minutes
    //       const filteredNotifications = notifications.filter((noti) => {
    //         const notiReceivedAt = new Date(noti.receivedAt);
      
    //         const timeDifferenceInMinutes = (currentDate - notiReceivedAt) / (1000 * 60); // milliseconds to minutes
    //         console.log(notiReceivedAt,currentDate,timeDifferenceInMinutes,noti.receivedAt)
    //         return timeDifferenceInMinutes <= 10;
    //       });

    //       // Update the notifications array with the filtered notifications
    //       notifications = filteredNotifications;
    //       console.log("filter",notifications)
    //       // Update the notifications array and store locally
    //       setNotificationsArray(notifications);
    
    //       // setNotificationsArray(notifications);
    
    //       // Store updated notifications in local storage
    //       await EncryptedStorage.setItem('Requestnotifications', JSON.stringify(notifications));
    //       console.log('Notification stored locally:', notification);
    
    //       // Also store in backend
    //       storeNotificationInBackend(notification);
    //     } catch (error) {
    //       console.error('Failed to store notification locally:', error);
    //     }
    //   } else {
    //     console.log('Notification does not have user_notification_id. Not storing.');
    //   }
    // };

    const storeNotificationLocally = async (notification) => {
      console.log("Stored locally is it true", notification.data, notification.data.user_notification_id);
    
      // Check if notification has notification.data.notification_id
      if (notification.data.screen === 'Acceptance') {
        try {
          const existingNotifications = await EncryptedStorage.getItem('Requestnotifications');
          let notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
          console.log(notifications);
    
          // Add the new notification to the array
          notifications.push(notification);
          console.log("Existing Notifications:", existingNotifications);
    
          // Get the receivedAt time from the notification
          const receivedAt = notification.receivedAt; // e.g., "06/10/2024, 11:26:16"
    
          // Manually parse receivedAt (from DD/MM/YYYY, HH:mm:ss to MM/DD/YYYY HH:mm:ss)
          const [datePart, timePart] = receivedAt.split(', ');
          const [day, month, year] = datePart.split('/');
          const parsedReceivedAt = `${year}-${month}-${day}T${timePart}`;
          const notificationDate = new Date(parsedReceivedAt);
    
          const currentDate = new Date();
    
          // Filter notifications received within the past 10 minutes
          const filteredNotifications = notifications.filter((noti) => {
            const [notiDatePart, notiTimePart] = noti.receivedAt.split(', ');
            const [notiDay, notiMonth, notiYear] = notiDatePart.split('/');
            const parsedNotiReceivedAt = `${notiYear}-${notiMonth}-${notiDay}T${notiTimePart}`;
            const notiReceivedAt = new Date(parsedNotiReceivedAt);
    
            const timeDifferenceInMinutes = (currentDate - notiReceivedAt) / (1000 * 60); // milliseconds to minutes
            console.log(notiReceivedAt, currentDate, timeDifferenceInMinutes, noti.receivedAt);
    
            return timeDifferenceInMinutes <= 10;
          });
    
          // Update the notifications array with the filtered notifications
          notifications = filteredNotifications;
          console.log("Filtered Notifications:", notifications);
    
          // Update the notifications array and store locally
          setNotificationsArray(notifications);
    
          // Store updated notifications in local storage
          await EncryptedStorage.setItem('Requestnotifications', JSON.stringify(notifications));
          console.log('Notification stored locally:', notification);
    
          // Also store in backend
          storeNotificationInBackend(notification);
        } catch (error) {
          console.error('Failed to store notification locally:', error);
        }
      } else {
        console.log('Notification does not match criteria. Not storing.');
      }
    };
    
    



    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
      const notificationId = remoteMessage.data.notification_id
      const pcs_token = await EncryptedStorage.getItem('pcs_token');

      if (remoteMessage.data && remoteMessage.data.screen === 'Home') {
        console.log("deeni vallane ayindhi raa mawa")

        await axios.post(`${process.env.BackendAPI}/api/worker/action`, {
          encodedId: "",
          screen: ''
        }, { 
          headers: {
            Authorization: `Bearer ${pcs_token}`
          }
        });

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
          })
        );
      }else if(remoteMessage.data && remoteMessage.data.screen === 'TaskConfirmation') {
        console.log("deeni vallane ayindhi raa mawa")
        navigation.push('TaskConfirmation', { encodedId: notificationId });
      }

      const notification = {
        title: remoteMessage.notification.title,
        body: remoteMessage.notification.body,
        data: remoteMessage.data,
        userNotificationId: remoteMessage.data.user_notification_id, // Include the user_notification_id
        receivedAt: new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(new Date()),
      };
      
  
      storeNotificationLocally(notification);
  
      PushNotification.localNotification({
        autoCancel: false, // Prevent auto cancel
        ongoing: true,
        channelId: "default-channel-id", 
        title: remoteMessage.notification.title, 
        message: remoteMessage.notification.body, 
        playSound: true, 
        soundName: 'default', 
        data: remoteMessage.data, 
        userInfo: remoteMessage.data, 
        actions: ["Dismiss"], // Add a dismiss action button
      });
    });
    
    PushNotification.configure({
      onNotification: function(notification) {
        const userNotificationId = notification.data.user_notification_id;
        const route = notification.data.route;
        console.log("route chudu raa macha",route)
        if (notification.action === "Dismiss") {
          // Handle the dismiss action, remove the notification
          console.log("hi")
          PushNotification.cancelLocalNotifications({ id: notification.id });
        } else if (notification.userInteraction) {
          // Handle the user interaction (tap on the notification)
          console.log("User notification ID from foreground state:", navigationRef.current);
          if (userNotificationId && route) {
            navigation.push(route,  { encodedId : userNotificationId });
            // navigationRef.current.dispatch(
            //   CommonActions.navigate(route, { encodedId : userNotificationId })
            // );
          }
        }
      },
      actions: ["Dismiss"], // Add a dismiss action button
    });
    

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', JSON.stringify(remoteMessage));
      const notificationId = remoteMessage.data.notification_id
      const pcs_token = await EncryptedStorage.getItem('pcs_token');

      if (remoteMessage.data && remoteMessage.data.screen === 'Home') {
        console.log("deeni vallane ayindhi raa mawa")

        await axios.post(`${process.env.BackendAPI}/api/worker/action`, {
          encodedId: "",
          screen: ''
        }, { 
          headers: {
            Authorization: `Bearer ${pcs_token}`
          }
        });

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
          })
        );
      }else if(remoteMessage.data && remoteMessage.data.screen === 'TaskConfirmation') {
        console.log("deeni vallane ayindhi raa mawa")
        navigation.push('TaskConfirmation', { encodedId: notificationId });
      }
      const notification = {
        title: remoteMessage.notification.title,
        body: remoteMessage.notification.body,
        data: remoteMessage.data,
        userNotificationId: remoteMessage.data.user_notification_id, // Include the user_notification_id
        receivedAt: new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(new Date()),
      };
      storeNotificationLocally(notification);
    });

    const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp(async (remoteMessage) => {
      console.log('Notification caused app to open from background state:', JSON.stringify(remoteMessage));
      const notificationId = remoteMessage.data.notification_id
      const pcs_token = await EncryptedStorage.getItem('pcs_token');

      if (remoteMessage.data && remoteMessage.data.screen === 'Home') {
        console.log("deeni vallane ayindhi raa mawa")

        await axios.post(`${process.env.BackendAPI}/api/worker/action`, {
          encodedId: "",
          screen: ''
        }, { 
          headers: {
            Authorization: `Bearer ${pcs_token}`
          }
        });

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
          })
        );
      }else if(remoteMessage.data && remoteMessage.data.screen === 'TaskConfirmation') {
        console.log("deeni vallane ayindhi raa mawa")
        navigation.push('TaskConfirmation', { encodedId: notificationId });
      }
    });

    messaging().getInitialNotification().then(async (remoteMessage) => {
      if (remoteMessage) {
        console.log('Notification caused app to open from quit state:', JSON.stringify(remoteMessage));

        const notificationId = remoteMessage.data.notification_id
        const pcs_token = await EncryptedStorage.getItem('pcs_token');
  
        if (remoteMessage.data && remoteMessage.data.screen === 'Home') {
          console.log("deeni vallane ayindhi raa mawa")
  
          await axios.post(`${process.env.BackendAPI}/api/worker/action`, {
            encodedId: "",
            screen: ''
          }, { 
            headers: {
              Authorization: `Bearer ${pcs_token}`
            }
          });
  
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
            })
          );
        }else if(remoteMessage.data && remoteMessage.data.screen === 'TaskConfirmation') {
          console.log("deeni vallane ayindhi raa mawa")
          navigation.push('TaskConfirmation', { encodedId: notificationId });
        }

        const notification = {
          title: remoteMessage.notification.title,
          body: remoteMessage.notification.body,
          data: remoteMessage.data,
          userNotificationId: remoteMessage.data.user_notification_id, // Include the user_notification_id
          receivedAt: new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }).format(new Date()),
        };
        storeNotificationLocally(notification);
      }
    });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpenedApp();
    };
  }, []);


  

  return (

    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.header}>
        <View style={styles.switchContainer}>
            <View>
            <MaterialCommunityIcons name='sort-variant' size={22} color='#656565' />
            </View>
            <View style={styles.innerSwitch}>
              <View style={styles.workStatusCOntainer}> 
                <Text style={styles.workStatus}>Active</Text>
              </View>
              <View style={styles.container}>
                  <TouchableOpacity onPress={toggleSwitch} style={[styles.track, isEnabled ? styles.trackEnabled : styles.trackDisabled]}>
                    <View style={[styles.thumb, isEnabled ? styles.thumbEnabled : styles.thumbDisabled]} />
                  </TouchableOpacity>
                  <Text>{isEnabled ? "On" : "Off"}</Text>
                </View>
            </View>
            <View>
            <TouchableOpacity style={styles.notificationContainer}>
              <MaterialIcons name='notifications' size={22} color='#656565' />
            </TouchableOpacity>
            </View>
        </View>
        <View style={styles.moneyContainer}>
          <TouchableOpacity>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceText}>Balance</Text>
              <Entypo name='chevron-small-down' size={20} color='#2E8B57' style={styles.downArrow} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={earningsScreen}>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceText}>Earnings</Text>
              <Entypo name='chevron-small-down' size={20} color='#2E8B57' style={styles.downArrow} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      {isEnabled ? (
        <>
   
      <Mapbox.MapView style={{ minHeight: screenHeight, minWidth: screenWidth }}>
        <Mapbox.Camera zoomLevel={17} centerCoordinate={center} />
        <Mapbox.PointAnnotation id="current-location" coordinate={center}>
          <View style={styles.markerContainer}>
            <Octicons name="dot-fill" size={25} color="#0E52FB" />
          </View>
        </Mapbox.PointAnnotation>
      </Mapbox.MapView>
      </>
      ) : (
        <Text style={styles.message}>Please click the switch on</Text>
      )}
      {isEnabled && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled={false}
          contentContainerStyle={styles.scrollContainer}
          style={styles.messageScrollView}
        >
          {notificationsArray.map((notification, index) => (
            <View key={index} style={styles.messageBox}>
              <View style={styles.serviceCostContainer}>
                <View>
                  <Text style={styles.secondaryColor}>Service</Text>
                  <Text style={styles.primaryColor}>{notification.title}</Text>
                </View>
                <View>
                  <Text style={styles.secondaryColor}>Cost</Text>
                  <Text style={styles.primaryColor}>${notification.data.cost}</Text>
                </View>
              </View>
              <View>
                <Text style={styles.secondaryColor}>Location</Text>
                <Text style={styles.primaryColor}>{notification.body}</Text>
              </View>
              <View style={styles.buttonsContainer}>
                <View>
                  <Text style={styles.secondaryColor}>Reject</Text>
                </View>
                <View>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => acceptRequest(notification.data.user_notification_id)} // Pass item.data to acceptRequest
                  >
                    <Text style={styles.secondaryButtonText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          {/* Add more message boxes as needed */}
        </ScrollView>
      )}
      {messageBoxDisplay && (
        <TouchableOpacity
          style={styles.messageBoxContainer}
          onPress={() => navigation.replace(screenName, params)}
        >
          <View style={styles.messageBox1}>
            <View style={styles.timeContainer}>
              {/* <Text style={styles.timeContainerText}>10 </Text>
              <Text style={styles.timeContainerText}>Mins</Text> */}
            <Image
              source={{ uri: 'https://i.postimg.cc/jSJS7rDH/1727646707169dp7gkvhw.png' }} // Replace with your worker image URL or local asset
                style={styles.workerImage}
            />
            </View>
            <View>
            <Text style={styles.textContainerText}>Switch board & Socket reparing</Text>
              {screenName === "PaymentScreen" ? (
                <Text style={styles.textContainerTextCommander}>Payment in progress</Text>
              ) : screenName === "WorkerNavigation" ? (
                <Text style={styles.textContainerTextCommander}>User is waiting for your help commander</Text>
              ): screenName === "OtpVerification" ? (
                <Text style={styles.textContainerTextCommander}>User is waiting for your help commander</Text>
              ) : screenName === "TimingScreen" ? (
                <Text style={styles.textContainerTextCommander}>Work in progress</Text>
              ) 
              : (
                <Text style={styles.textContainerText}>Nothing</Text>
              )}
              
            </View>
            <View style={styles.rightIcon}>
              <Feather name='chevrons-right' size={18} color='#9e9e9e' />
            </View>
            {/* <TouchableOpacity onPress={() => setMessageBoxDisplay(false)}>
              <Text>Close</Text>
            </TouchableOpacity> */}
          </View>
        </TouchableOpacity>
      )}

     
    </SafeAreaView>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({

  messageBoxContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3, // For shadow
    position: 'absolute',  // Positioning at the bottom
    bottom: 8,  // Distance from the bottom of the screen
    left: 10,  // Margin from the left side of the screen
    right: 10,  // Margin from the right side of the screen,
    marginHorizontal:'2%'
  },
  workerImage:{
    height:40,
    width:30
  },
  messageBox1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  timeContainer: {
    //backgroundColor: '#28a745',  // Green background like in the example
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  timeContainerText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign:'center'
  },
  textContainerText: {
    fontSize: 13,

    paddingBottom:5,
    fontWeight: 'bold',
    color: '#212121',
    marginLeft: 10,
  },
  textContainerTextCommander: {
    fontSize: 12,
    color: '#9e9e9e',
    marginLeft: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcon:{
    marginLeft:8
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
  screenContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom:70
  },
  secondaryButtonText:{
    color:'#ffffff',
    fontSize:14,
    lineHeight:16,
    fontWeight:'600'
  },
  secondaryColor:{
    color:'#9e9e9e',
    fontSize:16
  },
  buttonsContainer:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    marginTop:10
  },
  serviceCostContainer:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between'
  },
  markerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageScrollView: {
    position: 'absolute',
    bottom: '-10%', // 30px from the bottom of the screen
    left: 0,
    right: 0,
    height: 300, // Set the height of the scroll view
  },
  scrollContainer: {
    paddingHorizontal: screenWidth * 0.05, // Padding to create space on both sides
  },
  messageBox: {
    width: screenWidth * 0.85, // 90% width of the screen
    height: 200, // Set the height
    backgroundColor: '#fff',
    marginRight: screenWidth * 0.05, // 5% margin to show the next box
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 5, // For Android shadow
    padding:20,
    display:'flex',
    flexDirection:'column',
    gap:15
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  moneyContainer:{
    padding:10,
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-around',
    marginBottom:10,
  },
  balanceContainer: {
    padding: 10,
    width: 162,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between', // Space between text and icon
    alignItems: 'center',
  },
  balanceText: {
    flex: 1, // Make the text take the available space
    textAlign: 'center', // Center the text
    color: '#212121', // Assuming primary color
  },
  downArrow: {
    marginLeft: 10, // Add space between text and icon if needed
  },
  
  primaryColor:{
    color:'#212121',
    fontSize:15,
    width:'950%'
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    width: 47, // Track width
    height: 27, // Track height
    borderRadius: 15,
    justifyContent: 'center',
    padding: 2,
  },
  trackEnabled: {
    backgroundColor: '#4CAF50',
  },
  trackDisabled: {
    backgroundColor: '#E1DAD2',
  },
  thumb: {
    width: 24, // Thumb width
    height: 24, // Thumb height
    borderRadius: 13, // Half of the width and height for a circular thumb
  },
  thumbEnabled: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-end', // Moves the thumb to the right when enabled
  },
  thumbDisabled: {
    backgroundColor: '#f4f3f4',
    alignSelf: 'flex-start', // Moves the thumb to the left when disabled
  },
  text: {
    color: '#000'
  },
  workStatus:{
    color:'#4CAF50',
    fontSize:15,

  },
  workStatusCOntainer:{
    display:'flex',
    alignSelf:'center'
  },
  innerSwitch:{
    display:'flex',
    flexDirection:'row',
    gap:10
  },
  textCS:{
  paddingTop:3,
  paddingRight:5,
  fontSize:13,
  color:'#7B6B6E'
  },
  notificationContainer:{
    display:'flex',
    alignSelf:'center'
  },
  earningsText:{
    color:'#ffffff',
    fontWeight:'600',
    fontSize:15
  },
  earnings:{
    padding:10,
    backgroundColor:'#7B6B6E',
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between'
  },
  markerContainer: {
    backgroundColor: '#ffffff',  // Circle background color
    borderRadius: 12.5,          // Half of width/height for a perfect circle (35 / 2)
    justifyContent: 'center',    // Center the icon vertically
    alignItems: 'center',        // Center the icon horizontally
    width: 25,                   // Increased width to fit the icon with padding
    height: 25,
    paddingBottom:2
  },

  switchContainer:{
    padding:10,
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
  },
  header:{
    backgroundColor:'#ffffff',
    display:'flex',
    flexDirection:'column'
  },
  switch:{
    width:47,
    height:27
  },
  userInitialCircle: {
    width: 40,
    height: 40,
    borderRadius: 20, // To make it a circle
    backgroundColor: '#f0f0f0', // Background color of the circle
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10, // Adjust the space between the circle and the greeting
  },
  map: {
    flex: 1,
  },

  userInitialText: {
    fontSize: 18,
    color: '#333', // Text color
    fontWeight: 'bold',
  },
});

export default HelloWorld;