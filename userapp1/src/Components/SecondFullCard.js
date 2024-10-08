import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';

const SecondFullCard = () => {
  return (
    <ImageBackground
      source={{ uri: 'https://i.postimg.cc/s2g0Sdsr/IMG-20240708-201218.png' }}
      style={styles.zoomContainerSecondCard}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.fullCardContainer}>
        <View style={styles.fullCardContentContainer}>
          <Text style={styles.acHead}>
            Sofa & Home {'\n'} Cleaning
          </Text>
          <Text style={styles.fullCardChargesContentContainer}>
            Just 149/- minimum charges for first half and hour
          </Text>
          <View style={styles.fullCardButtonContainer}>
            <TouchableOpacity style={styles.fullCardButton}>
              <Text style={styles.fullCardButtonText}>Try Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  fullCardContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  zoomContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  fullCardContentContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  acHead: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fullCardChargesContentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    paddingTop: 20,
    fontFamily: 'Roboto, Arial, sans-serif',
    fontWeight: '400',
    fontSize: 20,
    textAlign: 'center',
  },
  fullCardButtonContainer: {
    display: 'flex',
    alignSelf: 'flex-start',
    paddingTop: '20%',
  },
  fullCardButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  fullCardButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SecondFullCard;
