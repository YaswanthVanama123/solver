import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import EncryptedStorage from 'react-native-encrypted-storage';
import axios from 'axios';

const ServiceDetails = ({ job, onClose }) => {
  const navigation = useNavigation();

  const handlePress = async () => {
    // try {
    //   const cs_token = await EncryptedStorage.getItem('cs_token');
      
      // if (cs_token) {
      //   // Make the API request to the "/user/action" endpoint
      // //  const response = await axios.get('http://10.0.2.2:5000/api/user/track/details', {
      //     const response = await axios.get('http://192.168.146.71:5000/api/user/track/details', {
      //     headers: { Authorization: `Bearer ${cs_token}` },
      //   });
      //   const {route} = response.data
      //   if(route === "" || route === null || route === undefined ){
          navigation.push('UserLocation', { 
            serviceTitle: job.service_title,
            serviceName: job.service_name 
          });
  //       }
  //       else {
  //         Alert.alert('Error', 'Action could not be completed. Please try again.');
  //       }
  //     } else {
  //       navigation.push('Login');
  //     }
  //   } catch (error) {
  //     console.error('Error during action:', error);
  //     Alert.alert('Error', 'Something went wrong. Please try again later.');
  //   }
   };

  if (!job) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.messageBox}>
        <Image
          source={{ uri: job.service_urls }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <Text style={styles.selectedTitle}>{job.service_name}</Text>
        {/* <TouchableOpacity
          style={styles.bookCaptainButton}
          onPress={() => navigation.push('UserLocation', { 
            serviceTitle: job.service_title,
            serviceName: job.service_name 
          })}
        >
          <Text style={styles.buttonText}>Book Commander</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={styles.bookCaptainButton}
          onPress={handlePress}
         >
      <Text style={styles.buttonText}>Book Commander</Text>
    </TouchableOpacity>
        <View style={styles.hline} />
        <ScrollView style={styles.scrollDiv}>
          <Text style={styles.headDetails}>Charges details</Text>
          <View style={styles.timecharges}>
            <Text style={styles.moneyCharges}>
              Minimum Charges for 1/2 hour 149₹
            </Text>
          </View>
          <View style={styles.timecharges}>
            <Text style={styles.moneyCharges}>
              49₹ will be charged for every next 1/2 hour
            </Text>
          </View>
        </ScrollView>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', // Optional: to darken the background
    justifyContent: 'flex-start',
    alignItems: 'center',
    zIndex: 9999, // Ensure it's placed on top of other components
  },
  messageBox: {
    marginTop: 10,
    width: '95%',
    height: height * 0.85, // 85% of the screen height
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'white',
  },
  cardImage: {
    height: '40%',
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  selectedTitle: {
    fontWeight: 'bold',
    marginVertical: 10,
  },
  bookCaptainButton: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  hline: {
    width: '100%',
    height: 2,
    backgroundColor: '#dddddd',
    marginVertical: 10,
  },
  scrollDiv: {
    maxHeight: 300,
  },
  headDetails: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'black',
    marginVertical: 10,
  },
  timecharges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  moneyCharges: {
    fontSize: 14,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: 'black',
  },
});

export default ServiceDetails;
