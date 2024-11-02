import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, BackHandler } from "react-native";
import { useNavigation, useRoute,CommonActions, useFocusEffect } from "@react-navigation/native";
import EncryptedStorage from 'react-native-encrypted-storage';
import axios from "axios";

const TimingScreen = () => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const route = useRoute();
  const { encodedId } = route.params;
  const navigation = useNavigation();
  const [decodedId, setDecodedId] = useState(null);
  const [startTime,setStartTime] = useState(null)

  useEffect(() => {
    if (encodedId) {
      const decoded = atob(encodedId);
      setDecodedId(decoded);
    }
  }, [encodedId]); 

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Navigate to a specific route when the back button is pressed
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
          })
        );
        // Return true to indicate that the back button press has been handled
        return true;
      };

      // Add event listener for hardware back button press
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Cleanup function to remove the event listener
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  const getCurrentTimestamp = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return [`${hours}:${minutes}:${seconds}`]
    //return `${hours}:${minutes}:${seconds}`;
  };



  useEffect(() => {
    console.log(process.env.API_URL)
    const startTiming = async () => {
      if (decodedId) {
        
        try {
          // Get the start_time token from EncryptedStorage
          const storedStartTime = await EncryptedStorage.getItem('start_time');
          console.log(storedStartTime);
          let startTimeData = [];
  
          if (storedStartTime) {
            // Parse the stored start_time data (assuming it's an array of objects)
            startTimeData = JSON.parse(storedStartTime);
  
            // Find the object with matching encodedId
            const matchingEntry = startTimeData.find(entry => entry.encoded_id === encodedId);
  
            if (matchingEntry) {
              // If a matching entry is found, update the startTime state with worked_time
              const { convertedTime } = matchingEntry;
              const [hh, mm, ss] = convertedTime.split(":");
              setHours(parseInt(hh));
              setMinutes(parseInt(mm));
              setSeconds(parseInt(ss));
  
              console.log("Found matching start time entry:", convertedTime);
              return; // Exit early since start_time is already set
            }
          }
  
          // If no matching entry is found, call the backend API to start timing
          const response = await axios.post(`${process.env.API_URL}/api/work/time/started`, {
            notification_id: decodedId,
          });
  
          const { worked_time } = response.data;
          const convertedTime = getCurrentTimestamp(worked_time);
          const [hh, mm, ss] = convertedTime.split(":");
          setHours(parseInt(hh));
          setMinutes(parseInt(mm));
          setSeconds(parseInt(ss));
  
          // Add the new timing data to the start_time array
          startTimeData.push({ encoded_id: encodedId, convertedTime });
  
          // Store the updated start_time array back in EncryptedStorage
          await EncryptedStorage.setItem('start_time', JSON.stringify(startTimeData));
  
          // console.log("Timing started:", response);
        } catch (error) {
          console.error("Error starting timing:", error);
        }
      }
    };
  
    startTiming();
  }, [decodedId]);
  
  

  // useEffect(() => {
  //   const fetchInitialTime = async () => {
  //     console.log(process.env.REACT_APP_API_URL)
  //     if (decodedId) {
  //       console.log(decodedId);
  //       try {
  //         const response = await axios.post(`${process.env.API_URL}/api/timer/value`, {
  //           notification_id: decodedId,
  //         });
  //         console.log(response.data);
  //         const [hh, mm, ss] = response.data.split(":");
  //         setHours(parseInt(hh));
  //         setMinutes(parseInt(mm));
  //         setSeconds(parseInt(ss));
  //       } catch (error) {
  //         console.error("Error fetching initial time:", error);
  //       }
  //     }
  //   };

  //   fetchInitialTime();
  // }, [decodedId]);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  useEffect(() => {
    if (seconds === 60) {
      setMinutes((prevMinutes) => prevMinutes + 1);
      setSeconds(0);
    }
    if (minutes === 60) {
      setHours((prevHours) => prevHours + 1);
      setMinutes(0);
    }
  }, [seconds, minutes]); 

  // const handleCompleteClick = async () => {

  //   if (decodedId) {
  //     console.log(process.env.REACT_APP_API_URL)
  //     try {
  //       const response = await axios.post(`${process.env.API_URL}/api/work/time/completed/request`, {
  //         notification_id: decodedId,
  //       });

  //       console.log(response)
        
  //     } catch (error) {
  //       console.error("Error completing work:", error);
  //     }
  //   }
  // };

  const handleCompleteClick = async () => {
    setIsActive(false);
    console.log(`Time stopped: ${hours} hours : ${minutes} minutes : ${seconds} seconds`);

    if (decodedId) {
      console.log(process.env.API_URL)
      try {
        const response = await axios.post(`${process.env.API_URL}/api/work/time/completed`, {
          notification_id: decodedId,
        });
        console.log("Work completed:", response.data);

        const newHours = Math.floor(minutes / 60);
        console.log(newHours);
        setHours(newHours);
        setMinutes(minutes % 60);
        setSeconds(seconds);

        const cs_token = await EncryptedStorage.getItem('cs_token'); // Assuming you're using AsyncStorage for storing the token
          
          // Send data to the backend
          await axios.post(`${process.env.API_URL}/api/user/action`, {
            encodedId: encodedId,
            screen: 'Paymentscreen'
          }, {
            headers: {
              Authorization: `Bearer ${cs_token}`
            }
          });


        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Paymentscreen', params: { encodedId: encodedId } }],
          })
        );
      } catch (error) {
        console.error("Error completing work:", error);
      }
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Time Tracking</Text>
      </View>
      <View style={styles.timeBoxes}>
        <TimeBox label="Hours" value={hours} style={styles.timeValueText}/>
        <TimeBox label="Minutes" value={minutes} style={styles.timeValueText}/>
        <TimeBox label="Seconds" value={seconds} style={styles.timeValueText}/>
      </View>
      <View style={styles.chargeInfo}>
        <Text style={styles.mainText}>The minimum charge is 149₹</Text>
        <Text style={styles.subText}>Next Every half hour, you will be charged for 49₹</Text>
        <Text style={styles.subText}>The minimum charge is 30 minutes</Text>
      </View>
      <View style={styles.progressWrapper}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>Progress</Text>
          <Text style={styles.progressPercentage}>50%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View style={styles.progressBar} />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Completed Work" onPress={handleCompleteClick} />
      </View>
    </View>
  );
};

const TimeBox = ({ label, value }) => (
  <View style={styles.timeBox}>
    <Text style={styles.timeValue}>
      {value.toString().padStart(2, "0")}
    </Text>
    <Text style={styles.timeLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color:'#000'
  },
  timeBoxes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    color:'#000'
  },
  timeBox: {
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 36,
    fontWeight: 'bold',
        color:'#000'
  },
  timeLabel: {
    fontSize: 18,
    color:'#000'
  },
  chargeInfo: {
    marginBottom: 20,
  },
  mainText: {
    fontSize: 18,
    fontWeight: 'bold',
    color:'#000'
  },
  subText: {
    fontSize: 14,
    color:'#000'
  },
  progressWrapper: {
    marginBottom: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 16,
    color:'#000'
  },
  progressPercentage: {
    fontSize: 16,
    color:'#000'
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#ccc',
  },
  progressBar: {
    height: 10,
    width: '50%',
    backgroundColor: 'blue',
  },
  buttonContainer: {
    alignItems: 'center',
  },
});

export default TimingScreen;
