import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, BackHandler } from "react-native";
import { Picker } from '@react-native-picker/picker';
import EncryptedStorage from 'react-native-encrypted-storage';
import { useNavigation,CommonActions, useFocusEffect } from '@react-navigation/native';
import axios from "axios";

const Payment = ({ route }) => {
    const [paymentMethod, setPaymentMethod] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [paymentDetails, setPaymentDetails] = useState({});
    const [decodedId, setDecodedId] = useState(null);
    const navigation = useNavigation();

    const { encodedId } = route.params;

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

    const handleCouponCodeChange = (text) => {
        setCouponCode(text);
    };

    const applyCoupon = () => {
        if (couponCode === 'DISCOUNT10') {
            setTotalAmount(totalAmount - 10);
        }
    };

    const formatTime = (dateTime) => {
        const date = new Date(dateTime);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        if (decodedId) {
            const fetchPaymentDetails = async () => {
                console.log(process.env.BACKENDAIP)
                try {
                    const response = await axios.post(`${process.env.BACKENDAIP}/api/payment/details`, {
                        notification_id: decodedId,
                    });

                    const { start_time, end_time, time_worked, totalAmount } = response.data;
                    setPaymentDetails({
                        start_time: formatTime(start_time),
                        end_time: formatTime(end_time),
                        time_worked
                    });
                    setTotalAmount(totalAmount);
                    console.log(response.data)
                } catch (error) {
                    console.error('Error fetching payment details:', error);
                }
            };
            fetchPaymentDetails();
        }
    }, [decodedId]);

    const handlePayment = async () => {
        console.log(process.env.REACT_APP_API_URL)
        try {
            await axios.post(`${process.env.BACKENDAIP}/api/user/payed`, {
                totalAmount,
                paymentMethod,
                decodedId
            });

            const cs_token = await EncryptedStorage.getItem('cs_token'); // Assuming you're using AsyncStorage for storing the token
          
            // Send data to the BACKENDAIP
            await axios.post(`${process.env.BACKENDAIP}/api/user/action`, {
              encodedId: encodedId,
              screen: ''
            }, {
              headers: {
                Authorization: `Bearer ${cs_token}`
              }
            });

            navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Rating', params: { encodedId: encodedId } }],
                })
              );
        } catch (error) {
            console.error('Error processing payment:', error);
            Alert.alert("Error", "Failed to process payment.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Payment</Text>
            <View style={styles.details}>
                <Text style={styles.label}>Service: Plumbing Repair</Text>
                <Text style={styles.label}>Start time: {paymentDetails.start_time}</Text>
                <Text style={styles.label}>End time: {paymentDetails.end_time}</Text>
                <Text style={styles.label}>Time worked: {paymentDetails.time_worked}</Text>
                <Text style={styles.label}>Total Amount: ₹{totalAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Payment Method</Text>
                <Picker
                    selectedValue={paymentMethod}
                    style={styles.picker}
                    onValueChange={(itemValue) => setPaymentMethod(itemValue)}
                >
                    <Picker.Item label="Select payment method" value="" />
                    <Picker.Item label="Cash" value="cash" />
                    <Picker.Item label="UPI" value="upi" />
                </Picker>
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Coupon/Promo Code</Text>
                <TextInput
                    style={styles.input}
                    value={couponCode}
                    onChangeText={handleCouponCodeChange}
                    placeholder="Enter coupon code"
                />
                <Button title="Apply" onPress={applyCoupon} />
            </View>
            <View style={styles.totalAmount}>
                <Text style={styles.label}>Total Amount</Text>
                <Text style={styles.label}>₹{totalAmount.toFixed(2)}</Text>
            </View>
            <Button title="Pay Now" onPress={handlePayment} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color:'#000'
    },
    details: {
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        marginBottom: 5,
        color:'#000'
    },
    inputGroup: {
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    picker: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        color:'#000'
    },
    totalAmount: {
        marginBottom: 20,
    },
});

export default Payment;
