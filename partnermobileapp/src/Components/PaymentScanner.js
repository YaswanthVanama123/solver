import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, BackHandler } from 'react-native';
import { RadioButton } from 'react-native-paper';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useRoute, CommonActions, useFocusEffect } from "@react-navigation/native";
import EncryptedStorage from 'react-native-encrypted-storage';
import axios from 'axios';

const PaymentScanner = ({ route }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [decodedId, setDecodedId] = useState(null);
  const [encodedId, setEncodedId] = useState(null); 
  const [totalAmount, setTotalAmount] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const { encodedId } = route.params;
    console.log("encod",encodedId)
    if (encodedId) {
      setEncodedId(encodedId)
      const decoded = atob(encodedId);
      console.log(atob(encodedId))
      setDecodedId(decoded);
    }
  }, [route.params]);

  useEffect(() => {
    if (decodedId) {
      const fetchPaymentDetails = async () => {
        try {
          const response = await axios.post(`${process.env.BackendAPI1}/api/worker/payment/scanner/details`, {
            notification_id: decodedId,
          });

          const { totalAmount, name, service } = response.data;

          // Ensure totalAmount is a number
          const amount = Number(totalAmount) || 0;
          console.log(response.data,name)
          setPaymentDetails({
            name,
            service,
         
          });
          setTotalAmount(amount);
        } catch (error) {
          console.error('Error fetching payment details:', error);
        }
      };
      fetchPaymentDetails();
    }
  }, [decodedId]);

  const onBackPress = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
      })
    );
    return true;
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

  const handlePayment = async () => {
    try {
        await axios.post(`${process.env.BackendAPI1}/api/user/payed`, {
            totalAmount,
            paymentMethod,
            decodedId
        });

        const pcs_token = await EncryptedStorage.getItem('pcs_token'); 
   
        // Send data to the backend

        await axios.post(`${process.env.BackendAPI1}/api/worker/action`, {
          encodedId: encodedId,
          screen: ''
        }, { 
          headers: {
            Authorization: `Bearer ${pcs_token}`
          }
        });

        navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'ServiceCompleted', params: { encodedId: encodedId } }],
            })
          );
    } catch (error) {
        console.error('Error processing payment:', error);
        Alert.alert("Error", "Failed to process payment.");
    }
};
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.leftIcon} onPress={onBackPress}>
        <FontAwesome6 name='arrow-left-long' size={20} color='#9e9e9e'  />
        </TouchableOpacity>
        <Text style={styles.screenName}>Payment Scanner</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: 'https://i.postimg.cc/L5drkdQq/Image-2-removebg-preview.png' }} // Replace with the actual image URL
          style={styles.profileImage}
        />
        <Text style={styles.name}>{paymentDetails.name}</Text>
        <Text style={styles.amountText}>Amount</Text>
        <Text style={styles.amount}>₹{totalAmount}</Text>
        <Text style={styles.service}>{paymentDetails.service}</Text>
      {/* QR Code Section */}
      <View style={styles.qrContainer}>
        <Image
            source={{ uri: 'https://i.postimg.cc/3RDzkGDh/Image-3.png' }} // Replace with the actual image URL
            style={styles.ScannerImage}
        />
        <Text style={styles.qrText}>Scan QR code to pay</Text>
      </View>
      </View>



      {/* Payment Method Section */}
      <View style={styles.radioContainer}>
        <RadioButton
          value="cash"
          status={paymentMethod === 'cash' ? 'checked' : 'unchecked'}
          onPress={() => setPaymentMethod('cash')}
        />
        <Text style={styles.radioText}>Paid by Cash</Text>
      </View>

      {/* Done Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.doneButton} onPress={handlePayment}>
          <Text style={styles.doneText}>Collected Amount</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  leftIcon: {
    position: 'absolute', // Ensure the icon stays on the left
    left: 10, // Adjust the position to your needs
  },
  arrivalButton: {
    backgroundColor: '#FF5722',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal:25,
  
  },
  arrivalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  screenName:{
    color:'#747476',
    fontSize:17,
    fontWeight:'bold'

  },
  buttonContainer:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'center'
  },
  ScannerImage:{
    width:150,
    height:150,
    marginTop:20
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center', // Center vertically
    justifyContent: 'center', // Center all content horizontally
    paddingVertical: 5,
    position: 'relative',
    marginBottom:20
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#F3F6F8',
    borderRadius: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color:'#212121'
  },
  amountText: {
    fontSize: 14,
    color:'#9E9E9E',
    marginTop:10
  },
  amount:{
    color:'#212121',
    fontWeight:'bold',
    fontSize:24,
    marginBottom:10
    
  },
  service: {
    fontSize: 16,
    color: '#212121',
    fontWeight:'bold'
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrText: {
    marginTop: 10,
    fontSize: 14,
    color: '#212121',
    marginTop:20
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  radioText: {
    fontSize: 16,
    marginLeft: 10,
    color:'#212121',
    fontWeight:'bold'
  },
  doneButton: {
    borderWidth:1,
    borderColor:'#FF5722',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop:10,
    width:'90%'
  },
  doneText: {
    color: '#FF5722',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default PaymentScanner;
