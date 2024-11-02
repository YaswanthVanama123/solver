// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import Svg, { Circle } from 'react-native-svg';

// const TimerComponent = () => {
//   const [timeLeft, setTimeLeft] = useState(60);
//   const [isWaiting, setIsWaiting] = useState(true);

//   useEffect(() => {
//     let interval;
//     if (isWaiting && timeLeft > 0) {
//       interval = setInterval(() => {
//         setTimeLeft((prevTime) => prevTime - 1);
//       }, 1000);
//     } else if (timeLeft === 0) {
//       setIsWaiting(false);
//     }
//     return () => clearInterval(interval);
//   }, [isWaiting, timeLeft]);

//   const handleResend = () => {
//     setTimeLeft(60);
//     setIsWaiting(true);
//   };

//   const progress = (timeLeft / 60) * 100;
//   const strokeDashoffset = 276.46 - (276.46 * progress) / 100;

//   return (
//     <View style={styles.container}>
//       <View style={styles.card}>
//         <View style={styles.timerContainer}>
//           <Svg width="150" height="150" viewBox="0 0 100 100">
//             <Circle
//               cx="50"
//               cy="50"
//               r="44"
//               stroke="#71717A"
//               strokeWidth="8"
//               fill="transparent"
//             />
//             <Circle
//               cx="50"
//               cy="50"
//               r="44"
//               stroke="#18181B"
//               strokeWidth="8"
//               strokeDasharray="276.46"
//               strokeDashoffset={strokeDashoffset}
//               strokeLinecap="round"
//               fill="transparent"
//             />
//           </Svg>
//           <Text style={styles.timerText}>{timeLeft}s</Text>
//         </View>
//         <Text style={styles.statusText}>
//           {isWaiting ? 'Waiting for worker response...' : 'No response received'}
//         </Text>
//         {!isWaiting && (
//           <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
//             <Text style={styles.resendButtonText}>Resend Request</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f9f9f9',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   card: {
//     width: '90%',
//     maxWidth: 400,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     padding: 20,
//     textAlign: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//     alignItems: 'center',
//   },
//   timerContainer: {
//     position: 'relative',
//     width: 150,
//     height: 150,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   timerText: {
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     transform: [{ translateX: -50 }, { translateY: -50 }],
//     fontSize: 32,
//     fontWeight: 'bold',
//   },
//   statusText: {
//     marginTop: 20,
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//   },
//   resendButton: {
//     marginTop: 20,
//     padding: 10,
//     backgroundColor: '#007bff',
//     borderRadius: 4,
//   },
//   resendButtonText: {
//     color: '#fff',
//     fontSize: 16,
//   },
// });

// export default TimerComponent;
