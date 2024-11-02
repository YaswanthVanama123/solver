import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, PermissionsAndroid, Platform, TextInput, FlatList, Text, TouchableOpacity, Modal, Button, Pressable,Alert, BackHandler,  } from 'react-native';
import Textarea from 'react-native-textarea';
import Mapbox from '@rnmapbox/maps';
import Geolocation from 'react-native-geolocation-service';
import { SafeAreaView } from 'react-native-safe-area-context';
import {CommonActions,useNavigation,useFocusEffect,useRoute } from '@react-navigation/native';
import EncryptedStorage from 'react-native-encrypted-storage';
import axios from 'axios';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'
import uuid from 'react-native-uuid'; // Import UUID
import parseAddress from 'parse-address';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import EvilIcons from 'react-native-vector-icons/AntDesign'
import Octicons from 'react-native-vector-icons/Octicons'

// Set Mapbox access token
Mapbox.setAccessToken('pk.eyJ1IjoieWFzd2FudGh2YW5hbWEiLCJhIjoiY2x5Ymw5MXZpMWZseDJqcTJ3NXFlZnRnYyJ9._E8mIoaIlyGrgdeu71StDg');

const UserLocation = () => {
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [pincode, setPincode] = useState('');
  const [alternatePhoneNumber, setAlternatePhoneNumber] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [currentPlace, setCurrentPlace] = useState({});
  const [alternateName, setAlternateName] = useState('');
  const [service, setService] = useState('Sample Service'); // Replace with actual service if needed
  const route = useRoute();
  const {  serviceName } = route.params
  const [mapKey, setMapKey] = useState(0);
  useEffect(() =>{
    if(serviceName){
      setService(serviceName)
    }
  },[route.params])

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'This app needs access to your location',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Location permission denied');
            return;
          }
        }

        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log('User location:', latitude, longitude);

            fetchAndSetPlaceDetails(latitude,longitude)
            setLocation([longitude, latitude]);
            sendDataToServer(longitude,latitude)
          },
          (error) => {
            console.error('Geolocation error:', error);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
      } catch (err) {
        console.warn(err);
      }
    };

    requestLocationPermission();
  }, []);

  const handleCrosshairsPress = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation([longitude, latitude]);
        sendDataToServer(longitude, latitude);
        fetchAndSetPlaceDetails(latitude, longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };
 
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

  const fetchPlaceSuggestions = async (query) => {
    console.log("hi")
    try {
      const response = await axios.get(
        `https://us1.locationiq.com/v1/autocomplete.php?key=pk.8bbe50a42004401570a4c08ad0e05f89&q=${query}`,
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching place suggestions:', error);
      return [];
    }
  };

  // const fetchPlaceSuggestions = async (query) => {
  //   try {
  //     const response = await axios.get(
  //       `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
  //       {
  //         params: {
  //           access_token: 'pk.eyJ1IjoieWFzd2FudGh2YW5hbWEiLCJhIjoiY2x5Ymw5MXZpMWZseDJqcTJ3NXFlZnRnYyJ9._E8mIoaIlyGrgdeu71StDg', // Your Mapbox public token
  //           autocomplete: true, // Enables autocomplete suggestions
  //       // Limits the number of results returned
  //         }
  //       }
  //     );
      
  //     //console.log('Response:', response.data); // Log the full response for debugging
      
  //     return response.data.features; // Mapbox returns results in the 'features' array
  //   } catch (error) {
  //     console.error('Error fetching place suggestions:', error);
  //     return [];
  //   }
  // };
  

  const handleLocationInputChange = async (text) => {
    const query = text.trim();
    setSearchQuery(text);
    setSelectedSuggestion(null);

    if (query.length >= 2) {
      try {
        const suggestions = await fetchPlaceSuggestions(query);
        //console.log(suggestions);
        setSuggestions(suggestions);
      } catch (error) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  

  const fetchAndSetPlaceDetails = async (latitude, longitude) => {
    console.log("place")
    try {
      const response = await axios.get(
        `https://us1.locationiq.com/v1/reverse.php?key=pk.8bbe50a42004401570a4c08ad0e05f89&lat=${latitude}&lon=${longitude}&format=json`,
      );

      // console.log("place details",response)
      if (response.status === 200) {
        const address = response.data.address;

        const placeDetails = {
          city: address.city || address.village || address.town || '' || address.county,
          area: address.neighbourhood || address.area || address.road  || address.suburb || address.town || address.hamlet || '',
          pincode: address.postcode || '',
        };
        console.log(response.data) 
        console.log(placeDetails)
        setCity(placeDetails.city); // Set the city state
        setArea(placeDetails.area); // Set the area state
       setPincode(placeDetails.pincode); // Set the pincode state
      }
    } catch (error) {
      console.error('Failed to fetch place details:', error);
    }
  };

  const sendDataToServer = async (longitude, latitude) => {
    try {
      const token = await EncryptedStorage.getItem('cs_token');
  
      if (!token) {
        console.error('No token found');
        return;
      }
  
      // Convert to string
      const longitudeStr = String(longitude);
      const latitudeStr = String(latitude);
      
  
      const response = await axios.post(
     //   'http://10.0.2.2:5000/api/user/location',
        `http://192.168.140.71:5000/api/user/location`,
        { longitude: longitudeStr, latitude: latitudeStr },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
  
      if (response.status === 200) {
        console.log('User location sent to BACKENDAIP successfully');
      }
    } catch (error) {
      console.error('Failed to send user location to BACKENDAIP:', error);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion.display_name);
    setSuggestions([]);
    setSelectedSuggestion(suggestion);
    const { lat, lon } = suggestion;
    setLocation([lon, lat]);
    sendDataToServer(lon,lat)

    setLocationInput(`${suggestion.display_name}, ${suggestion.address.postcode}`);

    setCurrentPlace({
      name: suggestion.display_name,
      pincode: suggestion.address.postcode,
    });
    console.log(suggestion)
    setCity(suggestion.address.city || suggestion.address.city || suggestion.address.village ||suggestion.address.town || suggestion.address.name); // Set city to the place name if city is not available
    setArea(suggestion.address.neighbourhood || suggestion.address.suburb || suggestion.address.area || suggestion.address.area || suggestion.address.road || ''); // Set area
    setPincode(suggestion.address.postcode || '');
    setMapKey(prevKey => prevKey + 1);
  };
  

  // const handleSuggestionSelect = (suggestion) => {
  //   setSearchQuery(suggestion.place_name);
  //   setSuggestions([]);
  //   setSelectedSuggestion(suggestion);
  
  //   const context = suggestion.context;
  
  //   let area = '';
  //   let city = '';
  //   let pincode = '';
  
  //   context.forEach(item => {
  //     if (item.id.startsWith('postcode')) {
  //       pincode = item.text;
  //     } else if (item.id.startsWith('locality')) {
  //       area = item.text;
  //     } else if (item.id.startsWith('place')) {
  //       console.log("place stsrts",item.id.startsWith('place'))
  //       city = item.text;
  //     }
  //   });
  
  //   // Log the extracted values for debugging
  //   console.log('Area:', area);
  //   console.log('City:', city);
  //   console.log('Pincode:', pincode);
  //   console.log("suggestion",suggestion)
  //   // Update state with extracted values
  //   setLocation([suggestion.geometry.coordinates[0], suggestion.geometry.coordinates[1]]);
  //   setLocationInput(`${suggestion.place_name}`);
  
  //   setCurrentPlace({
  //     name: suggestion.place_name,
  //     pincode: pincode,
  //   });
  
  //   setCity(city);
  //   setArea(area);
  //   setPincode(pincode);
  // };
  
  

  // const handleSuggestionSelect = (suggestion) => {
  //   setSearchQuery(suggestion.display_name);
  //   setSuggestions([]);
  //   setSelectedSuggestion(suggestion);
    
  //   // Validate coordinates
  //   const coordinates = suggestion.geometry.coordinates;
  //   if (Array.isArray(coordinates) && coordinates.length === 2) {
  //     const [lon, lat] = coordinates.map(coord => parseFloat(coord));
  //     if (!isNaN(lon) && !isNaN(lat)) {
  //       setLocation([lon, lat]);
  //       sendDataToServer(lon, lat);
  //       console.log(suggestion)
  //       // setLocationInput(`${suggestion.display_name}, ${suggestion.address.postcode}`);
  
  //       // setCurrentPlace({
  //       //   name: suggestion.display_name,
  //       //   pincode: suggestion.address.postcode,
  //       // });
  
  //       // setCity(suggestion.address.city || suggestion.address.village || suggestion.address.town || suggestion.address.name || ''); 
  //       // setArea(suggestion.address.neighbourhood || suggestion.address.suburb || suggestion.address.area || suggestion.address.road || ''); 
  //       // setPincode(suggestion.address.postcode || '');
  //     } else {
  //       console.error('Invalid coordinates:', coordinates);
  //     }
  //   } else {
  //     console.error('Coordinates are not in the expected format:', coordinates);
  //   }
  // };
  

  const clearSearch = () => {
    setSearchQuery('');      // Clears the search box text
    setSuggestions([]);      // Clears the suggestions list
  };
  

  const handleConfirmLocation = async () => {
    setShowMessageBox(true); // Show message box when Confirm Location button is clicked
  
    try {
      console.log(process.env.REACT_APP_API_URL)
      // Get the token from EncryptedStorage
      const token = await EncryptedStorage.getItem('cs_token');
  
      if (!token) {
        console.error('No token found');
        return;
      }
  
      // Make the API request
     // const response = await axios.get('http://10.0.2.2:5000/api/get/user', {
        const response = await axios.get(`${process.env.BACKENDAIP}/api/get/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Process the response data
      const data = response.data;
      setAlternatePhoneNumber(data.phone_number || ''); // Set alternate phone number from response
      setAlternateName(data.name);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const handleBookCommander = async () => {

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{
          name: 'userwaiting', 
          params: { 
            // encodedId: data,
            area: area,
            city: city,
            pincode: pincode,
            alternateName: alternateName,
            alternatePhoneNumber: alternatePhoneNumber,
            serviceBooked: service,
            location:location
          }
        }],
      })
    );
    // try {
    //   const jwtToken = await EncryptedStorage.getItem('cs_token');
  
    //   if (!jwtToken) {
    //     Alert.alert('Error', 'No token found');
    //     return;
    //   }
  
    //   const response = await axios.post(
    //     'http://10.0.2.2:5000/api/workers-nearby',
    //     {
    //       area,
    //       city,
    //       pincode,
    //       alternateName,
    //       alternatePhoneNumber,
    //       service,
    //     },
    //     {
    //       headers: {
    //         Authorization: `Bearer ${jwtToken}`,
    //       },
    //     },
    //   );
  
    //   const data = response.data;

    //   if (response.status === 200) {
    //     // Clear the stack and navigate to 'userwaiting'
    //     console.log(data);
    //     const cs_token = await EncryptedStorage.getItem('cs_token'); // Assuming you're using AsyncStorage for storing the token
          
    //       // Send data to the BACKENDAIP
    //       await axios.post('http://10.0.2.2:5000/api/user/action', {
    //         encodedId: data,
    //         screen: 'userwaiting'
    //       }, {
    //         headers: {
    //           Authorization: `Bearer ${cs_token}`
    //         }
    //       });
          
    //       navigation.dispatch(
    //         CommonActions.reset({
    //           index: 0,
    //           routes: [{
    //             name: 'userwaiting', 
    //             params: { 
    //               encodedId: data,
    //               area: area,
    //               city: city,
    //               pincode: pincode,
    //               alternateName: alternateName,
    //               alternatePhoneNumber: alternatePhoneNumber,
    //               service: service
    //             }
    //           }],
    //         })
    //       );
    //   } else {
    //     console.error('Unexpected response status:', response.status);
    //     Alert.alert('Error', 'Unexpected response status');
    //   }
    // } catch (error) {
    //   console.error('Error while fetching nearby workers:', error);
    //   Alert.alert('Error', 'Failed to fetch nearby workers');
    // }
  };
  
  const handlePressLocation = (e) => {
    const coordinates = e.geometry.coordinates;
    setLocation(coordinates);
    const [lon, lat] = coordinates;
    sendDataToServer(lon,lat)
  };

  const screenHeight = Dimensions.get('window').height;

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.searchBoxContainer}>
      <View style={styles.iconSearchContainer}>
          <TouchableOpacity onPress={clearSearch}>
            <FontAwesome5 name="search-location" size={20} color="#253529" />
          </TouchableOpacity>
        </View>
      <TextInput
  style={styles.searchBox}
  placeholder="Search location"
  placeholderTextColor="#070707"
  value={searchQuery}
  onChangeText={handleLocationInputChange}
/>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={clearSearch}>
            <EvilIcons name="hearto" size={20} color="#6D6D6D" />
          </TouchableOpacity>
        </View>

        <View style={styles.iconDotContainer}>
          <TouchableOpacity onPress={clearSearch}>
            <Octicons name="dot-fill" size={20} color="#ff9500" />
          </TouchableOpacity>
        </View>
        {suggestions.length > 0 && (
          <FlatList 
            data={suggestions}
            keyExtractor={(item) => uuid.v4()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSuggestionSelect(item)}
              >
                <Text style ={styles.suggestionText}>{item.display_name}</Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
          />
        )}
      </View>
      <View style={[styles.container, { height: screenHeight * 0.8 }]}>
      <Mapbox.MapView
        key={mapKey} 
        style={styles.map}
        zoomEnabled={true}
        styleURL="mapbox://styles/mapbox/streets-v11"
        // onPress={(e) => setLocation(e.geometry.coordinates)}
        onPress={handlePressLocation}
        camera={{
          centerCoordinate: location,
          zoomLevel: 18,
        }}
      >
          {location && (
            <>
              <Mapbox.Camera
                zoomLevel={18}
                centerCoordinate={location}
              />
              <Mapbox.PointAnnotation
                id="userLocation"
                coordinate={location}
              >
                <View style={styles.markerContainer}>
                  <View style={styles.marker} />
                </View>
              </Mapbox.PointAnnotation>
            </>
          )}
        </Mapbox.MapView>
      </View>
      <View style={styles.bookingCard}>
        <View>
          <Text style={styles.chargesDetails}>
            Minimum 1st half an hour charges 149₹
          </Text>
        </View>
        <View>
          <Text style={styles.chargesDetailsExtra}>
            After next every half an hour 49₹ charged
          </Text>
        </View>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmLocation}
        >
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
      
      {/* Message Box */}
      {showMessageBox && (
        <Modal
          transparent={true}
          visible={showMessageBox}
          animationType="slide"
          onRequestClose={() => setShowMessageBox(false)}
        > 
          <View style={styles.messageBoxBackdrop}>
            <View style={styles.messageBox}>
              <Text style={styles.completeAddressHead}>Enter complete address!</Text>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                value={city}
                onChangeText={setCity}
              />
              <Text style={styles.label}>Area</Text>
              <TextInput
                style={styles.input}
                placeholder="Area"
                value={area}
                onChangeText={setArea}
              />
              <Text style={styles.label}>Pincode</Text>
              <TextInput
                style={styles.input}
                placeholder="Pincode"
                value={pincode}
                onChangeText={setPincode}
              />
              <TextInput
                style={styles.input}
                placeholder="Alternate phone number"
                keyboardType="phone-pad"
                value={alternatePhoneNumber}
                onChangeText={setAlternatePhoneNumber}
              />
              <TextInput
                style={styles.input}
                placeholder="Alternate name"
                value={alternateName}
                onChangeText={setAlternateName}
              />
              <View style={styles.bookingCard}>
                <Text style={styles.youBooking}>You are booking</Text>
                <Text style={styles.bookingServiceName}>{serviceName}</Text>
              </View>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={handleBookCommander}
              >
                <Text style={styles.bookButtonText}>Book Commander</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowMessageBox(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      <View style={styles.crosshairsContainer}>
        <TouchableOpacity onPress={handleCrosshairsPress}>
          <FontAwesome6 name="location-crosshairs" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default UserLocation;

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  youBooking:{
    color:'#000'
  },
  bookingServiceName:{
    color:'#000'
  },
  suggestionText:{
    color:'#000'
  },
  crosshairsContainer: {
    position: 'absolute',
    right: 20,
    bottom: 200,
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 10,
    elevation: 5,
  },
  searchBoxContainer: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,

  },
  iconContainer: {
    position: 'absolute',
    right: 40,
    top: 13,
  },
  iconDotContainer:{
    position: 'absolute',
    right: 10,
    right: '74%',
    top: 16,
  },
  iconSearchContainer:{
    position: 'absolute',
    right: '85%',
    top: 15,  
    zIndex:20  
  },
  searchBox: {
    height: 50,
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 80,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    color:'#000',
    fontSize:15
  },
  label: {
    color:'#000',
    fontSize:12,
    padding:5,

  },
  suggestionsList: {
    width: '80%',
    backgroundColor: 'white',
    borderRadiusBottom: 5,
    marginTop: 40,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    position: 'absolute',
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: 'transparent',
  },
  marker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff0000',
  },
  bookingCard: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    margin: 10,
    elevation: 5,
  },
  chargesDetails: {
    fontSize: 16,
    marginBottom: 5,
    color:'#000'
  },
  chargesDetailsExtra: {
    fontSize: 14,
    color: '#888',
  },
  confirmButton: {
    backgroundColor: '#ff9500',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  confirmButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  messageBoxBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  messageBox: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 10,
  },
  completeAddressHead: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color:'#000'
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    color:'#000'
  },
  bookButton: {
    backgroundColor: '#ff9500',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  bookButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
  },
});
