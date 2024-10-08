import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Button, StyleSheet, BackHandler, TouchableOpacity } from "react-native";
import { useNavigation, useRoute, CommonActions, useFocusEffect } from "@react-navigation/native";
import EncryptedStorage from 'react-native-encrypted-storage';
import axios from "axios";
import Svg, { Circle } from 'react-native-svg';

const TimingScreen = () => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isWaiting, setIsWaiting] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [decodedId, setDecodedId] = useState(null);
  const [strokeDashoffset, setStrokeDashoffset] = useState(0);

  const route = useRoute();
  const { encodedId } = route.params;
  const navigation = useNavigation();

  useEffect(() => {
    if (encodedId) {
      setDecodedId(atob(encodedId));
    }
  }, [encodedId]);

  const handleCheck = useCallback(async () => {
    try {
      const response = await axios.post(`${process.env.BACKENDAIP}/api/task/confirm/status`, {
        notification_id: decodedId,
      });

      if (response.status === 200) {
        const cs_token = await EncryptedStorage.getItem('cs_token');

        await axios.post(`${process.env.BACKENDAIP}/api/user/action`, {
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
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  }, [decodedId, encodedId, navigation]);

  useEffect(() => {
    let intervalId;
    if (showMessage) {
      intervalId = setInterval(handleCheck, 5000);
    } else {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [showMessage, handleCheck]);

  useEffect(() => {
    let interval;
    if (isWaiting && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prevTime) => prevTime - 1), 1000);
    } else if (timeLeft === 0) {
      setIsWaiting(false);
    }
    return () => clearInterval(interval);
  }, [isWaiting, timeLeft]);

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

  const handleResend = () => {
    handleCompleteClick();
  };

  const handleCancelMessageBox = async () => {
    try {
      const response = await axios.post(`${process.env.BACKENDAIP}/api/work/completion/cancel`, {
        notification_id: decodedId,
      });

      if (response.status === 200) {
        await EncryptedStorage.setItem("messageBox", JSON.stringify(false));
        setShowMessage(false);
      }
    } catch (error) {
      console.error('Error canceling message box:', error);
    }
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

  const getCurrentTimestamp = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date();
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date string");
    }

    const istOffset = 5 * 60 + 30;
    let hours = date.getUTCHours();
    let minutes = date.getUTCMinutes() + istOffset;
    if (minutes >= 60) {
      hours += Math.floor(minutes / 60);
      minutes %= 60;
    }
    if (hours >= 24) {
      hours %= 24;
    }

    return `${hours}:${minutes}:${date.getUTCSeconds()}`;
  };

  const differenceTime = (dateString) => {
    const startedTime = getCurrentTimestamp(dateString).split(":").map(Number);
    const currentTime = getCurrentTimestamp().split(":").map(Number);

    let [hours, minutes, seconds] = currentTime.map((cur, i) => cur - startedTime[i]);
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
          const storedStartTime = await EncryptedStorage.getItem('start_time');
          const messageBox = JSON.parse(await EncryptedStorage.getItem("messageBox"));
          if (messageBox) setShowMessage(true);

          if (storedStartTime) {
            const startTimeData = JSON.parse(storedStartTime);
            const matchingEntry = startTimeData.find(entry => entry.encoded_id === encodedId);

            if (matchingEntry) {
              const convertedTime = differenceTime(matchingEntry.worked_time);
              const [hh, mm, ss] = convertedTime.split(":");
              setHours(parseInt(hh));
              setMinutes(parseInt(mm));
              setSeconds(parseInt(ss));
              return;
            }
          }

          const response = await axios.post(`${process.env.BACKENDAIP}/api/work/time/started`, {
            notification_id: decodedId,
          });

          const { worked_time } = response.data;
          const convertedTime = differenceTime(worked_time);
          const [hh, mm, ss] = convertedTime.split(":");
          setHours(parseInt(hh));
          setMinutes(parseInt(mm));
          setSeconds(parseInt(ss));

          await EncryptedStorage.setItem('start_time', JSON.stringify([...JSON.parse(storedStartTime || '[]'), { encoded_id: encodedId, worked_time }]));
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
      interval = setInterval(() => setSeconds((prevSeconds) => prevSeconds + 1), 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const handleCompleteClick = async () => {
    if (decodedId) {
      try {
        const response = await axios.post(`${process.env.BACKENDAIP}/api/work/time/completed/request`, {
          notification_id: decodedId,
        });

        if (response.status === 200) {
          setShowMessage(true);
          await EncryptedStorage.setItem("messageBox", JSON.stringify(true));
          setTimeLeft(60);
          setIsWaiting(true);
        }
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
        <TimeBox label="Hours" value={hours} />
        <TimeBox label="Minutes" value={minutes} />
        <TimeBox label="Seconds" value={seconds} />
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
        <TouchableOpacity style={styles.button} onPress={handleCompleteClick}>
          <Text style={styles.buttonText}>Complete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleResend}>
          <Text style={styles.buttonText}>Resend</Text>
        </TouchableOpacity>
      </View>
      {showMessage && (
    <View style={styles.Messagecontainer}>
      <View style={styles.card}>
        <View style={styles.timerContainer}>
          <Svg width="150" height="150" viewBox="0 0 100 100">
            <Circle
              cx="50"
              cy="50"
              r="44"
              stroke="#71717A"
              strokeWidth="8"
              fill="transparent"
            />
            <Circle
              cx="50"
              cy="50"
              r="44"
              stroke="#18181B"
              strokeWidth="8"
              strokeDasharray="276.46"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </Svg>
          <Text style={styles.timerText}>{timeLeft}s</Text>
        </View>
        <Text style={styles.statusText}>
          {isWaiting ? 'Waiting for worker response...' : 'No response received'}
        </Text>
        <TouchableOpacity style={styles.resendButton} onPress={handleCancelMessageBox}>
            <Text style={styles.resendButtonText}>cancel</Text>
          </TouchableOpacity>
        {!isWaiting && (
          <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
            <Text style={styles.resendButtonText}>Resend Request</Text>
          </TouchableOpacity>
        )}
      </View>

{/*       
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>Work completed successfully!</Text>
        </View>
     
      <TouchableOpacity style={styles.completeButton} onPress={handleCompleteClick}>
        <Text style={styles.completeButtonText}>Complete Work</Text>
      </TouchableOpacity> */}
    </View>
	 )}
    </View>
  );
};

const TimeBox = ({ label, value }) => (
  <View style={styles.timeBox}>
    <Text style={styles.timeLabel}>{label}</Text>
    <Text style={styles.timeValue}>{String(value).padStart(2, "0")}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  statusText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#18181B',
    marginBottom: 10,
  },
  resendButton: {
    backgroundColor: '#f03e3e',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  resendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timerText: {
    position: 'absolute',
    fontSize: 30,
    color: '#71717A',
    fontWeight: '600',
  },
  Messagecontainer:{
    position: 'absolute',
    top: '20%',  // Center vertically
    left: '20%', // Center horizontally
    //transform: [{ translateX: -50% }, { translateY: -50% }], // Adjust position by half the width/height
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%', // Adjust width as needed
    maxWidth: 400, // Maximum width

  },
  card: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 30,
  },
  header: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  timeBoxes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  timeBox: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 16,
    color: '#333',
  },
  timeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  chargeInfo: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  mainText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  progressWrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00bcd4',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#00bcd4',
    width: '50%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#00bcd4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageBox: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 8,
    color:'#000'
  },
});

export default TimingScreen;
