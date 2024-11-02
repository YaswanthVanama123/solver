import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

// Get screen width
const { width } = Dimensions.get('window');

const ServicesProvidedCard = ({ job, onClick }) => {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: getCardColor(job.service_name) }]}
      onPress={onClick}
    >
      <Image source={{ uri: job.service_urls }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.serviceName}>{job.service_name}</Text>
        <TouchableOpacity style={styles.button} onPress={onClick}>
          <Text style={styles.buttonText}>Book</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const getCardColor = (serviceName) => {
  switch (serviceName) {
    case 'Electrician': return '#03133b';
    case 'Plumber': return '#08784d';
    case 'Cleaning': return '#b61575';
    case 'Vehicle': return '#8d9e2b';
    case 'Painting': return '#0073c3';
    case 'Salon': return '#03133b';
    default: return '#ccc';
  }
};

const styles = StyleSheet.create({
  card: {
    width: width * 0.8, // Adjust width as needed
    height:150,
    marginHorizontal: 5,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    backgroundColor: '#fff',
    flexDirection: 'row', // Change direction to row
    alignItems: 'center', // Center align items vertically
  },
  cardImage: {
    width: '40%', // Adjust image width
    height: 160,
  },
  cardContent: {
    flex: 1, // Take up remaining space
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 22,
    fontWeight: '400',
    color: '#fff',
    marginBottom: 10,
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 15,
    color: '#fff',
  },
});

export default ServicesProvidedCard;
