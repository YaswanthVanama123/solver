import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import axios from 'axios';
import uuid from 'react-native-uuid'; // Import UUID
import ServiceDetails from './ServiceDetails';
import ServicesProvidedCard from './ServicesProvidedCard';

const { width } = Dimensions.get('window');

const ServicesProvided = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0); // Track current index
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (services.length > 0) {
      const interval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % (services.length * 2);
        setCurrentIndex(nextIndex);
        flatListRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      }, 3000); // Scroll every 3 seconds

      return () => clearInterval(interval);
    }
  }, [services, currentIndex]);

  const fetchServices = async () => {
    try {
     // const response = await axios.get('http://10.0.2.2:5000/api/servicecategories');
      const response = await axios.get('http://192.168.146.71:5000/api/servicecategories');
      // Add UUIDs to services
      const servicesWithIds = response.data.map(service => ({
        ...service,
        id: uuid.v4(), // Add UUID  
      }));
      setServices(servicesWithIds);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const openMessageBox = (service) => {
    console.log('Opening message box for:', service);
    setSelectedService(service);
  };

  const closeMessageBox = () => {
    console.log('Closing message box');
    setSelectedService(null);
  };

  const renderItem = ({ item }) => (
    <ServicesProvidedCard
      job={item}
      onClick={() => openMessageBox(item)}
    />
  );

  const duplicatedServices = [...services, ...services]; // Duplicate the list for seamless scrolling

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Services Provided</Text>
      <FlatList
        ref={flatListRef}
        data={duplicatedServices}
        renderItem={renderItem}
        keyExtractor={() => uuid.v4()} // Use UUID as key
        contentContainerStyle={styles.list}
        horizontal
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={currentIndex}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current.scrollToIndex({ index: info.index, animated: true });
          });
        }}
        extraData={currentIndex} // Make sure FlatList re-renders when currentIndex changes
      />
      <ServiceDetails job={selectedService} onClose={closeMessageBox} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontFamily: 'Roboto',
    fontSize: 19,
    fontWeight: '800',
    color: '#333',
    padding: 15,
  },
  list: {
    paddingHorizontal: 10,
  },
});

export default ServicesProvided;
