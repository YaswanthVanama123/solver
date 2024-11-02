import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const ServiceCard = ({ job, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.itemsAlign}
      onPress={() => onPress && onPress(job)} // Check if onPress is defined
    >
      <View style={styles.card}>
        <Image
          source={{ uri: job.service_urls }}
          style={styles.cardImageScreen}
        />
      </View>
      <Text style={styles.title}>{job.service_name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemsAlign: {
    flexBasis: '48%', // Adjusts width, similar to calc(50% - 5px)
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: 300,
  },
  card: {
    width: 150,
    height: 180,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Roboto', // Ensure the font is available or use default
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 23,
    color: '#333333',
    paddingTop: 13,
    width: 100,
    textAlign: 'center',
  },
  cardImageScreen: {
    width: '100%',
    height: '100%', // Adjust height proportionally
    borderRadius: 5,
    resizeMode: 'cover'
  },
});

export default ServiceCard;
