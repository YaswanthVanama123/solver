import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import uuid from 'react-native-uuid';
import ServiceCard from './ServiceCard';
import ServiceDetails from './ServiceDetails';

const CleaningServices = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [cleaningJobs, setCleaningJobs] = useState([]);

  useEffect(() => {
    const fetchCleaningJobs = async () => {
      try {
       // const response = await axios.get('http://10.0.2.2:5000/api/cleaning/services');
        const response = await axios.get('http://192.168.146.71:5000/api/cleaning/services');
        setCleaningJobs(response.data);
      } catch (error) {
        console.error('Error fetching cleaning services:', error);
      }
    };

    fetchCleaningJobs();
  }, []);
 
  const openMessageBox = (job) => {
    setSelectedJob(job);
  };

  const closeMessageBox = () => {
    setSelectedJob(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.serviceHeader}>Cleaning Department Services</Text>
      <ScrollView horizontal style={styles.cleaning} contentContainerStyle={styles.contentContainer}>
        {cleaningJobs.map((job) => (
          <TouchableOpacity key={uuid.v4()} >
            <ServiceCard job={job} onPress={() => openMessageBox(job)}/>
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
    padding: 10,
    backgroundColor: '#fff',
  },
  serviceHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cleaning: {
    minHeight: 250,
  },
  contentContainer: {
    alignItems: 'center',
  },
});

export default CleaningServices;
