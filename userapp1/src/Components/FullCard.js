import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

const FullCard = () => {
  return (
    <ImageBackground
      source={{ uri: 'https://i.postimg.cc/cCckdv1f/IMG-20240708-184529.jpg' }}
      style={styles.zoomContainer}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.fullCardContainer}>
        <View style={styles.fullCardContentContainer}>
          <View>
            <Text style={styles.acHead}>
              Air Conditioner{'\n'}Reparing
            </Text>
          </View>
          <View>
            <Text style={styles.fullCardChargesContentContainer}>
              Just 149/- minimum charges for first half an hour
            </Text>
          </View>
          <View style={styles.fullCardButtonContainer}>
            <TouchableOpacity style={styles.fullCardButton}>
              <Text style={styles.buttonText}>Try Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  zoomContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  fullCardContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 5,
   
  },
  fullCardContentContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  acHead: {
    fontFamily: 'Roboto',
    fontSize: 20,
    fontWeight: '800',
    color: 'black',
    padding: 10,
  },
  fullCardChargesContentContainer: {
    paddingTop: 20,
    fontFamily: 'Roboto',
    fontWeight: '400',
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
  },
  fullCardButtonContainer: {
    alignSelf: 'flex-start',
    paddingTop: 20,
  },
  fullCardButton: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    width: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 15,
  },
});

export default FullCard;
