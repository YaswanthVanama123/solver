import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook

const QuickSearch = () => {
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

  const navigation = useNavigation(); // Initialize navigation
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

  const handleInputChange = (query) => {
    setSearchQuery(query);
  };

  const handleFocus = () => {
    setIsFocused(true);
    navigation.navigate('SearchItem'); // Navigate to "searchitem" route
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholderText}
        placeholderTextColor="#000"
        fontStyle='italic'
        value={searchQuery}
        onChangeText={handleInputChange}
        onFocus={handleFocus} // Navigate when input is focused
        onBlur={() => setTimeout(() => setIsFocused(false), 100)}
      />
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
    fontWeight:'500',
    color: '#555555',
    opacity: 0.5
  },
});

export default QuickSearch;
