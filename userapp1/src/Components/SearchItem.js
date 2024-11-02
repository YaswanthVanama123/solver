import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, FlatList, StyleSheet, Text, TouchableOpacity, Dimensions, Image, BackHandler } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import axios from 'axios';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native'; // Import Lottie

const SearchItem = () => {
  const initialPlaceholder = 'Search for ';
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const additionalTexts = [
    'electrician',
    'plumber',
    'cleaning services',
    'painter',
    'mechanic',
  ];

  const [placeholderText, setPlaceholderText] = useState(initialPlaceholder);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [loading, setLoading] = useState(false); // State to manage loading animation
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null); // Create a ref for the TextInput

  const navigation = useNavigation()
  // Dummy data for recent and trending searches
  const recentSearches = [
    { id: 1, name: 'AC service lite' },
    { id: 2, name: 'AC Service and Repair' },
  ];

  const trendingSearches = [
    'Professional cleaning',
    'Electricians',
    'Plumbers',
    'Salon',
    'Carpenters',
    'Washing machine repair',
    'Refrigerator repair',
    'RO repair',
    'Furniture assembly',
    'Microwave repair',
  ];

  useEffect(() => {
    const updatePlaceholder = () => {
      const word = additionalTexts[currentIndex];

      if (currentWordIndex < word.length) {
        setPlaceholderText(placeholderText + word[currentWordIndex]);
        setCurrentWordIndex(currentWordIndex + 1);
      } else {
        setPlaceholderText(initialPlaceholder);
        setCurrentIndex((currentIndex + 1) % additionalTexts.length);
        setCurrentWordIndex(0);
      }
    };

    const interval = setInterval(updatePlaceholder, 200);

    return () => clearInterval(interval);
  }, [placeholderText, currentWordIndex, currentIndex, additionalTexts, initialPlaceholder]);

  const handleInputChange = async (query) => {
    setSearchQuery(query);



    if (query.length > 0) {
      setIsFocused(true);
      setLoading(true)
    } else {
      setIsFocused(false);
      setSuggestions([]);
      setLoading(false)
      return;
    }



    if (query.length > 0) {
      setLoading(true)
      try {
        const response = await axios.get(`${process.env.BACKEND}/api/services?search=${query}`);
    
        setSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
      } finally{
        setLoading(false)
      }
    } else {
      setSuggestions([]);
      setLoading(false)
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSuggestions([]);
    // Focus the input to show the placeholder text again
    setIsFocused(true);
  };


  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.suggestionItem} onPress={() => console.log(item)}>
      <Image source={{ uri: item.service_urls }} style={styles.suggestionImage} />
      <View style={styles.textContainer}>
        <Text style={styles.SuggestionText}>{item.service_name}</Text>
        
      </View>
    </TouchableOpacity>
  );

  const renderRecentSearches = () => (
    recentSearches.map((item) => (
      <TouchableOpacity key={item.id} style={styles.recentItem}>
        <View style={styles.recentIcon}>
        <Entypo name="back-in-time" size={30} color='#d7d7d7' />
        </View>
        <Text style={styles.recentText}>{item.name}</Text>
      </TouchableOpacity>
    ))
  );

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

  const handleHome = () => {
    navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
        })
      );
  };

  useFocusEffect(
    React.useCallback(() => {
      if (inputRef.current) {
        inputRef.current.focus(); // Focus the input when the screen is focused
      }
    }, [])
  );
  
  

  const renderTrendingSearches = () => (
    trendingSearches.map((item, index) => (
      <TouchableOpacity key={index} style={styles.trendingItem}>
        <Text style={styles.trendingText}>{item}</Text>
      </TouchableOpacity>
    ))
  );
 
  return (
    <View style={styles.mainContainer}>
      <View style={[styles.container, { minHeight: screenHeight }]}>
        
      <View style={styles.searchBar}>
          <TouchableOpacity onPress={handleHome}>
            <AntDesign name="arrowleft" size={20} color="#000" style={styles.icon} />
          </TouchableOpacity>
          <View style={styles.searchInputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder={placeholderText}
              placeholderTextColor="#000"
              fontStyle="italic"
              value={searchQuery}
              onChangeText={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 100)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClear} style={styles.clearIcon}>
                <Entypo name="circle-with-cross" size={20} color="#000" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* Show loading animation while fetching data */}


        <View style={[styles.horizontalLine, { width: screenWidth, height: 2 }]} />


                {/* No results found UI */}
                {searchQuery && suggestions.length === 0 && (
            <View style={styles.noResultsContainer}>
              
              <MaterialIcons name="search-off" size={45} color="#000"/>
              <Text style={styles.noResultsText}>No results found</Text>
              <Text style={styles.noResultsSubText}>We couldn't find what you were looking for. Please check your keywords again!</Text>
              <View style={[styles.horizontalLine, { width: screenWidth, height: 8 }]} />
              <View style={styles.trendingSearchesContainer}>
                <Text style={styles.sectionTitle}>Trending searches</Text>
                <View style={styles.trendingItemsContainer}>
                  {renderTrendingSearches()}
                </View>
              </View>
              
            </View>
          )}


        {/* Conditional rendering of recent and trending searches */}
        {loading && (
        <LottieView
          source={require('../assets/searchLoading.json')}
          autoPlay
          loop
          style={styles.loadingAnimation}
        />
      )}
        {!searchQuery && suggestions.length === 0 && (
            
          <View style={styles.searchSuggestionsContainer}>
            <View style={styles.recentSearchesContainer}>
              <Text style={styles.sectionTitle}>Recents</Text>
              {renderRecentSearches()}
            </View>
            <View style={[styles.horizontalLine, { width: screenWidth, height: 8 }]} />

            <View style={styles.trendingSearchesContainer}>
              <Text style={styles.sectionTitle}>Trending searches</Text>
              <View style={styles.trendingItemsContainer}>
                {renderTrendingSearches()}
              </View>
            </View>
          </View>
        )}

        {isFocused && suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            renderItem={renderItem}
            keyExtractor={(item) => item.service_id.toString()}
            style={[styles.suggestionsList, { minHeight: screenHeight }]}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  recentIcon: {
    padding:5,
    backgroundColor:'#F8F8F8',
    borderRadius:10,
  },
  container: {
    width: '100%',
    backgroundColor: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  noResultsContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  loadingAnimation: {
    width:'100%',
    height:100
  },
  noResultsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#555555',
  },
  noResultsSubText: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    marginVertical: 20,
    padding:6
  },
  horizontalLine: {
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  clearIcon: {
    position: 'absolute',
    right: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    margin: 10,
  },
  icon: {
    paddingLeft: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingLeft: 10,
    color: '#555555',
    opacity: 0.5,
    fontWeight: '500',
  },
  searchSuggestionsContainer: {
    marginTop: 15,
  },
  recentSearchesContainer: {
    marginBottom: 15,
    padding: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
    color: '#000',
  },
  recentItem: {
    display: 'flex',
    flexDirection:'row',
    gap:20,
    paddingVertical: 10,
  },
  recentText: {
    color: '#000',
    display:'flex',
    alignSelf:'center'
  },
  trendingSearchesContainer: {
    marginBottom: 15,
    padding: 10,
  },
  trendingItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  trendingItem: {
    padding: 10,
    borderRadius: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    marginRight: 10,
    marginBottom: 10,
  },
  trendingText: {
    color: '#000',
  },
  suggestionsList: {
    marginTop: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionImage: {
    width: 70,
    height: 70,
    borderRadius: 5,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  SuggestionText: {
    color: '#000',
    fontSize: 16,
  },
  subText: {
    color: '#777',
    fontSize: 14,
  },
});

export default SearchItem;
