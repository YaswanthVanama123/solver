import React, { useEffect, useRef, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { useNavigation } from "@react-navigation/native";
import EncryptedStorage from 'react-native-encrypted-storage';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert,Dimensions } from 'react-native';
import axios from 'axios';
import uuid from 'react-native-uuid';
import QuickSearch from '../Components/QuickSearch';
import LottieView from 'lottie-react-native'; // Import Lottie

function ServiceApp() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading animation
  const [greeting, setGreeting] = useState('');
  const [greetingIcon, setGreetingIcon] = useState(<Icon name="sunny-sharp" size={14} color="#FA4C23" />);
  const [messageBoxDisplay, setMessageBoxDisplay] = useState(false);
  const [trackScreen, setTrackScreen] = useState([]);
  const screenWidth = Dimensions.get('window').width;
  const scrollViewRef = useRef(null);
  const itemWidth = screenWidth * 0.95; // Width of each item including margin
  const navigation = useNavigation();
  const [name,setName] = useState('')

  useEffect(() => {
    fetchServices();
    setGreetingBasedOnTime(); // Set the greeting based on time
  }, []);

    useEffect(() => {
      const fetchTrackDetails = async () => {
        console.log(process.env.REACT_APP_API_BACKEND)
        try {
          const cs_token = await EncryptedStorage.getItem('cs_token'); // Replace with the actual cs_token
          if (cs_token) {
            //const response = await axios.get('http://10.0.2.2:5000/api/user/track/details', {
            const response = await axios.get(`http://192.168.140.71:5000/api/user/track/details`, {
              headers: { Authorization: `Bearer ${cs_token}` },
            });
        
            // Safely access track from response
            const track = response?.data?.track || [];
          
            const {user} = response.data
         
            if(user){
              setName(user)
            }else{
              console.log("use",response.data)
              setName(response.data)
            }
            if (track.length === 0) {
              setMessageBoxDisplay(false);
            } else {
              setMessageBoxDisplay(true);
            }

            setTrackScreen(track);
          }
        } catch (error) {
          console.error('Error fetching track details:', error);
        }
      };

      fetchTrackDetails();
  }, []);

  // useEffect(() => {
  //   let scrollInterval;
  //   if (messageBoxDisplay && trackScreen.length > 0) {
  //     const totalWidth = itemWidth * trackScreen.length * 2; // Total width of duplicated items

  //     scrollInterval = setInterval(() => {
  //       if (scrollViewRef.current) {
  //         const currentOffset = scrollViewRef.current.contentOffset?.x || 0;
  //         const newOffset = (currentOffset + itemWidth * 0.95) % totalWidth;

  //         if (newOffset === 0) {
  //           // Reset to the beginning of the duplicated list when reaching the true end
  //           scrollViewRef.current.scrollTo({ x: itemWidth * trackScreen.length, animated: false });
  //         } else {
  //           scrollViewRef.current.scrollTo({
  //             x: newOffset,
  //             animated: true,
  //           });
  //         }
  //       } else {
  //         console.warn('ScrollView ref is not set.');
  //       }
  //     }, 7000);
  //   }

  //   return () => clearInterval(scrollInterval); // Cleanup the interval on component unmount
  // }, [messageBoxDisplay, trackScreen, itemWidth]);

  const setGreetingBasedOnTime = () => {
    const currentHour = new Date().getHours();
    let greetingMessage = 'Good Day';
    let icon = <Icon name="sunny-sharp" size={14} color="#F24E1E" />;

    if (currentHour < 12) {
      greetingMessage = 'Good Morning';
      icon = <Icon name="sunny-sharp" size={16} color="#F24E1E" />;
    } else if (currentHour < 17) {
      greetingMessage = 'Good Afternoon';
      icon = <Feather name="sunset" size={16} color="#F24E1E" />;
    } else {
      greetingMessage = 'Good Evening';
      icon = <MaterialIcons name="nights-stay" size={16} color="#000" />;
    }

    setGreeting(greetingMessage);
    setGreetingIcon(icon);
  };

  const handleBookCommander = (serviceId) => {
    console.log("ser")
    navigation.push('serviceCategory', { 
      serviceObject: serviceId,
    });
  }; 

  const specialOffers = [
    {
      id: '1',
      title: '20%',
      subtitle: 'New User Special',
      description: 'New users get a 20% discount on their first booking across any service category.',
      imageBACKENDAP: 'https://i.postimg.cc/HsGnL9F1/58d3ebe039b0649cfcabe95ae59f4328.png',
      backgroundColor: '#FFF4E6',
      color: '#F24E1E'
    },
    {
      id: '2',
      title: '50%',
      subtitle: 'Summer Sale',
      description: 'Get a 50% discount on all services booked during the summer season.',
      imageBACKENDAP: 'https://i.postimg.cc/rwtnJ3vB/b08a4579e19f4587bc9915bc0f7502ee.png',
      backgroundColor: '#E8F5E9',
      color: '#4CAF50'
    },
    {
      id: '3',
      title: '30%',
      subtitle: 'Refer a Friend',
      description: 'Refer a friend and get 30% off on your next service booking.',
      imageBACKENDAP: 'https://i.postimg.cc/Kzwh9wZC/4c63fba81d3b7ef9ca889096ad629283.png',
      backgroundColor: '#E3F2FD',
      color:'#2196F3'
    },
  ];
  

  const fetchServices = async () => {
    try {
      setLoading(true);
       // Start loading animation
      console.log("env variable",process.env.BACKENDAIP)
      const response = await axios.get(`http://192.168.140.71:5000/api/servicecategories`);
      // Add UUIDs to services
      const servicesWithIds = response.data.map(service => ({
        ...service,
        id: uuid.v4(), // Add UUID
      }));
  
      setServices(servicesWithIds);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false); // Stop loading animation when data is fetched
    }
  };

  const handleNotification = () => {
    console.log('Notification icon pressed');
    navigation.push('Tabs', { screen: 'Notification' }); 
  };

  const handleHelp = () =>{
    navigation.push('Help'); 
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.userInitialCircle}>
            <Text style={styles.userInitialText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>
              {greeting}  <Text style={styles.greetingIcon}>{greetingIcon}</Text>
            </Text>
            <Text style={styles.userName}>{name}</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={handleNotification}>
            <Text style={styles.icon}>
              <Icon name="notifications-outline" size={23} color="#000" />
            </Text>
          </TouchableOpacity >
          <TouchableOpacity onPress={handleHelp}>
            <Text style={styles.icon}>
              <Feather name="help-circle" size={23} color="#000" />
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <QuickSearch />

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Special Offers Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Special Offers</Text>
            <Text style={styles.seeAll}>See All</Text>
          </View>
          <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.offersScrollView}
            >
          {specialOffers.map(offer => (
            <View key={offer.id} style={[styles.offerCard,{backgroundColor: offer.backgroundColor}]}>
              <View style={styles.offerDetails}>
                <Text style={[styles.offerTitle,{color: offer.color}]}>{offer.title}</Text>
                <Text style={[styles.offerSubtitle,{ color: offer.color }]}>{offer.subtitle}</Text>
                <Text style={[styles.offerDescription, { color: offer.color }]}>{offer.description}</Text>
              </View>
              <Image source={{ uri: offer.imageBACKEND }} style={styles.offerImg} />
            </View>
          ))}
          </ScrollView>
        </View>

        {/* Services Section */}
        <View style={styles.Servicessection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Services</Text>
            <Text style={styles.seeAll}>See All</Text>
          </View>

          {/* Map over the services array to generate service cards */}
          {loading ? (
            <LottieView
              source={require('../assets/cardsLoading.json')} // Path to your Lottie JSON file
              autoPlay
              loop
              style={styles.loadingAnimation} // Style for animation
            />
          ) : (
            // Map over the services array to generate service cards
            services.map(service => (
              <View key={service.id} style={styles.serviceCard}>
                <Image source={{ uri: service.service_urls || 'https://via.placeholder.com/100x100' }} style={styles.serviceImg} resizeMode="stretch" />
                <View style={styles.serviceDetails}>
                  <Text style={styles.serviceTitle}>{service.service_name}</Text>
                  <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => handleBookCommander(service.service_name)} // Call the handleBookCommander function
                  >
                    <Text style={styles.bookButtonText}>Book Now ➔</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      {messageBoxDisplay && (
        <ScrollView
          horizontal
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollViewHorizontal}
          showsHorizontalScrollIndicator={false}
          style={styles.absoluteMessageBox}
        >
          {trackScreen.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.messageBoxContainer, { width: itemWidth }]}
              onPress={() => navigation.replace(item.screen, { 
                encodedId: item.encodedId,
                area:  item.area,
                city: item.city,
                pincode: item.pincode,
                alternateName: item.alternateName,
                alternatePhoneNumber: item.alternatePhoneNumber,
                serviceBooked: item.serviceBooked
              })
              }
            >
              <View style={styles.messageBox}>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeContainerText}>10</Text>
                  <Text style={styles.timeContainerText}>Mins</Text>
                </View>
                <View>
                  {item.screen === "userwaiting" ? (
                    <Text style={styles.textContainerText}>Searching for best Commander</Text>
                  ) : item.screen === "UserNavigation" ? (
                    <Text style={styles.textContainerText}>Commander arrived Shortly</Text>
                  ) : item.screen === "worktimescreen" ? (
                    <Text style={styles.textContainerText}>Work in progress</Text>
                  ) : (
                    <Text style={styles.textContainerText}>Payment in progress</Text>
                  )}
                  <Text style={styles.textContainerTextCommander}>{item.commanderName} is solving your problem</Text>
                </View>
                <View>
                  <Text>Icon</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Styles remain the same
  container: {
    flex:1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  Servicessection:{
    marginBottom:20,
  },
  offersScrollView: {
    display:'flex',
    gap:10
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImg: {
    borderRadius: 20,
    width: 40,
    height: 40,
    marginRight: 10,
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
  loadingAnimation: {
    width:'100%',
    height:'100%'
  },
  userInitialText: {
    fontSize: 18,
    color: '#333', // Text color
    fontWeight: 'bold',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  absoluteMessageBox: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 100, // Adjust height as needed
  },
  greeting: {
    flexDirection: 'column',
    color: '#333',
  },
  greetingText: {
    fontSize: 14,
    fontFamily: 'Roboto',
    lineHeight: 18.75,
    fontStyle: 'italic',
    color: 'rgba(85, 85, 85, 0.8)',
    fontWeight: 'bold',
  },
  greetingIcon: {
    fontSize: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color:'#333333',
    lineHeight:21.09
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  icon: {
    fontSize: 20,
  },
  searchBar: {
    flexDirection: 'row',
    marginBottom: 20,
    marginRight:20,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  searchButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -40,
  },
  searchIcon: {
    fontSize: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color:'#000'
  },
  seeAll: {
    fontSize: 14,
    color: '#000',
  },
  offerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    width:300,
    borderRadius: 10,
  },
  offerDetails: {
    color: '#ff7f50',
    width:'60%',
    padding: 15,
  },
  offerTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    fontFamily:'Roboto',
  },
  offerSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight:16.41,
    fontFamily:'Roboto',
  },
  offerDescription: {
    fontSize: 12,
    fontFamily:'Roboto',
    opacity:0.8,
    lineHeight:14.06,
    fontWeight:'400',
    
  },
  offerImg: {
    width: 119,
    height: 136,
    display:'flex',
    alignSelf:'flex-end',
    
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap:10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 10,

  },
  serviceImg: {
    width: 181,
    height: 115,
    borderRadius: 10,
  },
  serviceDetails: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 10,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color:'#333333',
    lineHeight:21.09,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff9500',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginTop: 10,
    width:110,
    height: 31,
    opacity: 0.88
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily:'Poppins-Medium',
    textAlign:'center'
  },
  messageBoxContainer: {
    
    zIndex:10000,

  },
  messageBox: {
    padding: 10,
    borderTopLeftRadius:5,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    
  },
  timeContainer: {
    padding: 10,
    backgroundColor: '#33AD83',
    borderRadius: 5,
  },
  timeContainerText: {
    color: '#ffffff',
    fontSize: 15,
    textAlign: 'center',
  },
  textContainerText: {
    color: '#000',
    fontWeight: 'bold',
  },
  textContainerTextCommander: {
    color:'#000'
    // Your existing styles for the commander's text
  },
});

export default ServiceApp;
