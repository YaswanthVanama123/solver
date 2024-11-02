import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, StyleSheet, Text, TouchableOpacity, Keyboard } from 'react-native';
import axios from 'axios';

const SearchBox = () => {
  const initialPlaceholder = 'Search for ';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

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
    } else {
      setIsFocused(false);
      setSuggestions([]);
      return;
    }
    if (query.length > 2) {
      try {
        console.log("hi")
        //const response = await axios.get(`http://10.0.2.2:5000/api/services?search=${query}`);
        
        const response = await axios.get(`${process.env.URL}/api/services?search=${query}`);
        setSuggestions(response.data);
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.suggestionItem} onPress={() => console.log(item)}>
      <Text style = {styles.SuggestionText}>{item.service_name}</Text>
    </TouchableOpacity>
  );
      {/* <View style={styles.searchBar}>
        <TextInput style={styles.searchInput} placeholder="Search Services" placeholderTextColor="#000"/>
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchIcon}><Icon name="search" size={23} color="#000"/></Text>
        </TouchableOpacity>
      </View> */}
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholderText}
        placeholderTextColor="#000"
        fontStyle='italic'
        value={searchQuery}
        onChangeText={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 100)}
      />
      {isFocused && suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          renderItem={renderItem}
          keyExtractor={(item) => item.service_id}
          style={styles.suggestionsList}
          keyboardShouldPersistTaps='handled'
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
    backgroundColor: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    backgroundColor: '#ffffff',
    color:'#000',
    fontWeight:'500',
    color: '#555555',
    opacity: 0.5
  },
  suggestionsList: {
    marginTop: 5,
    maxHeight: 200,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  SuggestionText: {
    color:'#000'
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    color:'#000',
  },
});

export default SearchBox;
