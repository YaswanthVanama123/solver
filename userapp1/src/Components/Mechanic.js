import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import ServiceCard from './ServiceCard'; // Adjust the import paths as necessary
import ServiceDetails from './ServiceDetails';

const VehicleServices = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [vehicleJobs, setVehicleJobs] = useState([]);

  useEffect(() => {
    const fetchVehicleJobs = async () => {
      try {
       // const response = await axios.get('http://10.0.2.2:5000/api/vehicle/services');
        const response = await axios.get('http://192.168.146.71:5000/api/vehicle/services');
        setVehicleJobs(response.data);
      } catch (error) {
        console.error('Error fetching vehicle services:', error);
      }
    };

    fetchVehicleJobs();
  }, []);

  const openMessageBox = (job) => {
    setSelectedJob(job);
  };

  const closeMessageBox = () => {
    setSelectedJob(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.serviceHeader}>Vehicle Mechanic & Saloon Services</Text>
      <ScrollView horizontal style={styles.mechanic} contentContainerStyle={styles.contentContainer}>
        {vehicleJobs.map((job, index) => (
          <TouchableOpacity key={index} onPress={() => openMessageBox(job)}>
            <ServiceCard job={job} />
          </TouchableOpacity>
        ))}
      </ScrollView>
      {selectedJob && <ServiceDetails job={selectedJob} onClose={closeMessageBox} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  serviceHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  mechanic: {
    minHeight: 200,
    paddingBottom: 10,
  },
  contentContainer: {
    alignItems: 'center',
  },
});

export default VehicleServices;
