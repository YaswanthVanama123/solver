import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions,Image } from 'react-native';
import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';
import LottieView from 'lottie-react-native'; 
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const Bookings = () => {
  const [bookingsData, setBookingsData] = useState([]);
  const [loading, setLoading] = useState(true); 
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const fetchBookings = async () => { 
      try {
        const token = await EncryptedStorage.getItem('cs_token'); 
        if (!token) throw new Error("Token not found");

        const response = await axios.get(`${process.env.BACKEND}/api/user/bookings`, {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });
        console.log(response.data[0])
        setBookingsData(response.data);
      } catch (error) { 
        console.error('Error fetching bookings data:', error);
      } finally {
        setLoading(false); 
      }
    };

    fetchBookings();
  }, []);

  const formatDate = (created_at) => {
    const date = new Date(created_at);
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${String(day).padStart(2, '0')}, ${year}`;
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <LottieView
            source={require('../assets/cardsLoading.json')}
            autoPlay
            loop
            style={[{minHeight:screenHeight},{minWidth:screenWidth}]}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
 
          <View style={styles.ButtonsContainer}>     
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="shopping-cart" size={23} color="#000" />
              <Text style={styles.myServiceText}>My services</Text> 
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.sortBy}>Sort by</Text> 
              <FontAwesome5 name="sort" size={23} color="#4e4e4e" />
            </View>
          </View>
          <View style={styles.bookingHistoryContainer}>
            <View style={styles.bookings}>
              {bookingsData.map((booking, index) => (
                <View style={styles.booking} key={index}>
                  <View style={styles.bookingCard}>
                    <View style={styles.profileBooking}>
                      <View style={styles.profileIcon}>
                        <Image source={{ uri: booking.worker_profile }} style={styles.workerImage} resizeMode="stretch" />
                      </View>
                      <View style={styles.verticalLineContainer}>
                        
                      </View>
                      <View style={styles.details}>
                        <Text style={styles.serviceTitle}>{booking.service}</Text>
                        <Text style={styles.bookingTime}>Booked on: {formatDate(booking.created_at)}</Text>
                        <View style={styles.bookingTimeButtonConatiner}>
                          <View style={styles.bookingTimeContainer}>
                            
                            <Text style={styles.bookingTime}>12:00 - 01:30</Text>
                          </View>
                          <View style={styles.status}>
                            <Text style={styles.completed}>Completed</Text>
                          </View>   
                        </View>
                      </View>
                      {/* <View style={styles.status}>
                        <Text style={styles.completed}>Completed</Text>
                      </View> */}
                    </View>
                    <View style={styles.amountDiv}>
                      <View>
                        <Text>Provider{"\n"}<Text style={styles.workerName}>{booking.provider}</Text></Text>
                      </View>
                      <View>
                        <Text>Total{"\n"}<Text style={styles.rupeesAmount}>₹{booking.payment}</Text></Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.pagination}>
              <TouchableOpacity onPress={() => { /* Pagination logic */ }}>
                <Text style={styles.paginationText}>Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { /* Pagination logic */ }}>
                <Text style={styles.paginationText}>1</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { /* Pagination logic */ }}>
                <Text style={styles.paginationText}>2</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { /* Pagination logic */ }}>
                <Text style={styles.paginationText}>3</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { /* Pagination logic */ }}>
                <Text style={styles.paginationText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure the container takes up the full screen height
    backgroundColor: '#ffffff',
    padding:20
  },
  myServiceText:{
    color:'#0e0e0e',
    fontFamily:'Poppins-Medium',
    fontSize:18,
    marginLeft:10
  },
  sortBy:{
    fontSize:16,
    color:'#000',
    fontFamily:'Poppins-Light',
    marginRight:10
  },
  ButtonsContainer:{
    display:'flex',
    flexDirection:'row',
    width:'100%',
    justifyContent:'space-between',
 
    marginBottom:15
  },
  bookingTimeButtonConatiner:{
    display:'flex',
    flexDirection:'row',
    gap:10
    // justifyContent:'space-between'
  },
  verticalLineContainer:{
    height:80,
    width:1,
    backgroundColor:'#c1c1c1',
    marginLeft:10
  },
  loadingContainer: {
    flex: 1, // Allow the loader to fill the entire screen
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingAnimation: {
    width: 150, // Adjust as needed
    height: 150, // Adjust as needed
  },
  workerImage:{
    height:80,
    width:80
  },
  scrollViewContent: {
    // flexGrow: 1, // Ensure the content container takes up all available space
  },
  bookingHistoryContainer: {
    backgroundColor: '#ffffff',
  },
  bookings: {
    marginBottom: 30,
  },
  booking: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  profileBooking: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  profileIcon: {

    justifyContent: 'center',
    alignItems: 'center',

   
  },
  details: {
    flex: 1,
    marginLeft: 10,
  },
  serviceTitle: {
    fontWeight: '600',
    color: '#0e0e0e',
    fontSize: 19,
    lineHeight:25,
    fontFamily:'Poppins-SemiBold'
  },
  bookingTime: {
    color: '#4e4e4e',
    fontSize:12,
    marginTop: 0,
    fontFamily:'Poppins-Light'
  },
  status: {
    alignSelf: 'flex-start',
    marginLeft: 'auto',
  },
  completed: {
    backgroundColor: '#eaf0d8',
    color: '#0e0e0e',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    fontSize: 12,
    fontFamily:'Poppins-Medium'
  },
  amountDiv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  workerName: {
    color: '#111827',
    fontSize:16,
    fontFamily:'Poppins-Light',
    lineHeight:21
  },
  rupeesAmount: {
    color: '#111827',
    fontFamily:'Poppins-Medium'
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  paginationText: {
    marginHorizontal: 10,
    color: '#007bff',
  },
});

export default Bookings;
