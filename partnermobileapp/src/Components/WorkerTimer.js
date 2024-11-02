import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, BackHandler, ImageBackground, Animated } from "react-native";
import { useNavigation, useRoute, CommonActions, useFocusEffect } from "@react-navigation/native";
import EncryptedStorage from 'react-native-encrypted-storage';
import axios from "axios";

const TimingScreen = () => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [prevSeconds, setPrevSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const route = useRoute();
  const { encodedId } = route.params;
  const navigation = useNavigation();
  const [decodedId, setDecodedId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  
  // Create animated values for current and previous seconds
  const animatedValue = useRef(new Animated.Value(0)).current; 
  const prevAnimatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (encodedId) {
      const decoded = atob(encodedId);
      setDecodedId(decoded);
    }
  }, [encodedId]); 

  useFocusEffect(
    React.useCallback(() => {
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
    }, [])
  );

  const getCurrentTimestamp = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date();
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date string");
    }

    const istOffset = 5 * 60 + 30;
    let hours = date.getUTCHours();
    let minutes = date.getUTCMinutes();
    let seconds = date.getUTCSeconds();

    minutes += istOffset;
    if (minutes >= 60) {
      hours += Math.floor(minutes / 60);
      minutes %= 60;
    }
    if (hours >= 24) {
      hours %= 24;
    }

    return `${hours}:${minutes}:${seconds}`;
  };

  const differenceTime = (dateString) => {
    const startedTime = getCurrentTimestamp(dateString);
    const [hh, mm, ss] = startedTime.split(":").map(Number);
    const currentTime = getCurrentTimestamp();
    const [hr, mr, sr] = currentTime.split(":").map(Number);
    let hours = hr - hh;
    let minutes = mr - mm;
    let seconds = sr - ss;

    if (seconds < 0) {
      seconds += 60;
      minutes--;
    }
    if (minutes < 0) {
      minutes += 60;
      hours--;
    }
    if (hours < 0) {
      hours += 24;
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  useEffect(() => {
    const startTiming = async () => {
      if (decodedId) {
        try {
          const storedStartTime = await EncryptedStorage.getItem('start_work_time');
          let startTimeData = [];
          console.log("storedStartTime", storedStartTime)
          if (storedStartTime) {
            startTimeData = JSON.parse(storedStartTime);
            const matchingEntry = startTimeData.find(entry => entry.encoded_id === encodedId);

            if (matchingEntry) {
              await EncryptedStorage.removeItem('start_work_time');
              const time = matchingEntry.worked_time;
              const convertedTime = differenceTime(time);
              const [hh, mm, ss] = convertedTime.split(":");
              setHours(parseInt(hh));
              setMinutes(parseInt(mm));
              setSeconds(parseInt(ss));
              setPrevSeconds(parseInt(ss)); // Set previous seconds
              setStartTime(matchingEntry.convertedTime);
              return;
            }
          }

          const response = await axios.post(`${process.env.BackendAPI1}/api/work/time/started`, {
            notification_id: decodedId,
          });

          const { worked_time } = response.data;
          const convertedTime = differenceTime(worked_time);
          const [hh, mm, ss] = convertedTime.split(":");
          setHours(parseInt(hh));
          setMinutes(parseInt(mm));
          setSeconds(parseInt(ss));
          setPrevSeconds(parseInt(ss)); // Set previous seconds
          startTimeData.push({ encoded_id: encodedId, worked_time });
          await EncryptedStorage.setItem('start_work_time', JSON.stringify(startTimeData));
          setStartTime(worked_time);

        } catch (error) {
          console.error("Error starting timing:", error);
        }
      }
    };

    startTiming();
  }, [decodedId]);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          setPrevSeconds(prevSeconds); // Store previous seconds before updating
          if (prevSeconds + 1 === 60) {
            setMinutes((prevMinutes) => prevMinutes + 1);
            return 0; // Reset seconds to 0 after reaching 60
          }
          return prevSeconds + 1;
        });

        // Start the animation for pulling down the previous number and the new number from above
        Animated.parallel([
          Animated.timing(prevAnimatedValue, {
            toValue: 1, // Scroll down
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 1, // Scroll up
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          prevAnimatedValue.setValue(0); // Reset animation value
          animatedValue.setValue(0); // Reset animation value
        });
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  useEffect(() => {
    if (minutes === 60) {
      setHours((prevHours) => prevHours + 1);
      setMinutes(0);
    }
  }, [minutes]); 

  // Animate the current and previous seconds
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 0], // Scroll up
  });

  const prevTranslateY = prevAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 30], // Scroll down
  });

  return (
    <ImageBackground 
      source={{ uri: 'https://i.postimg.cc/rFFQLGRh/Picsart-24-10-01-15-38-43-205.jpg' }}
      style={styles.container}
      resizeMode="stretch"
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Time Tracking</Text>
      </View>
      <View style={styles.timeContainer}>
        <View style={styles.timeBoxes}>
            <TimeBox label="Hours" value={hours} />
            <TimeBox label="Minutes" value={minutes} />
            <View style={styles.timeBox}>
              <Text style={styles.timeLabel}>Seconds</Text>
              <Animated.Text style={[styles.timeValue, { transform: [{ translateY }] }]}>
                {seconds.toString().padStart(2, "0")}
              </Animated.Text>
              <Animated.Text style={[styles.timeValue, { position: 'absolute', top: 40, transform: [{ translateY: prevTranslateY }] }]}>
                {prevSeconds.toString().padStart(2, "0")}
              </Animated.Text>
            </View>
        </View>
      </View>
      <View style={styles.chargeInfo}>
        <Text style={styles.mainText}>The minimum charge is 149₹</Text>
        <Text style={styles.subText}>The minimum charge is 30 minutes</Text>
        <Text style={styles.subText}>Next Every half hour, you will be charged for 49₹</Text>
      </View>
    </ImageBackground>
  );
};

const TimeBox = ({ label, value }) => (
  <View style={styles.timeBox}>
    <Text style={styles.timeLabel}>{label}</Text>
    <Text style={styles.timeValue}>
      {value.toString().padStart(2, "0")}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeContainer: {
    backgroundColor: '#f6f6f6',


    // iOS shadow properties
    shadowColor: '#000', // Shadow color
    shadowOffset: {
      width: 0, // X-offset
      height: 2, // Y-offset
    },
    shadowOpacity: 0.25, // Opacity of the shadow
    shadowRadius: 8, // Blur radius
    // Android shadow properties
    elevation: 5, // Elevation for Android
    width:250,
    height:110
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000', // Change this color as per your image
  },
  timeBoxes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,

  },
  timeBox: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
  },
  timeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212121', // Change this color as per your image
    lineHeight:41
  },
  timeLabel: {
    fontSize: 16,
    color: '#212121', // Change this color as per your image,
    fontWeight:'600'
  },
  chargeInfo: {
    marginTop: '40%',
    backgroundColor:'#f6f6f6',
    height:170,
    padding:20,
    
  },
  mainText: {
    fontSize: 21,
    paddingBottom:20,
    fontWeight: 'bold',
    color: '#212121', // Change this color as per your image
  },
  subText: {
    fontSize: 16,
    color: '#9e9e9e', // Change this color as per your image
  },
});

export default TimingScreen;
