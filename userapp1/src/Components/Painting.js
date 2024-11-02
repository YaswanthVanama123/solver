import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import ServiceCard from './ServiceCard';
import ServiceDetails from './ServiceDetails';

const PaintingServices = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [paintingJobs, setPaintingJobs] = useState([]);
 
  useEffect(() => {
    const fetchPaintingJobs = async () => {
      try {
        //const response = await axios.get('http://10.0.2.2:5000/api/painting/services');
        const response = await axios.get('http://192.168.146.71:5000/api/painting/services');
        setPaintingJobs(response.data);
      } catch (error) {
        console.error('Error fetching painting services:', error);
      }
    };

    fetchPaintingJobs();
  }, []);

  const openMessageBox = (job) => {
    setSelectedJob(job);
  };

  const closeMessageBox = () => {
    setSelectedJob(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.serviceHeader}>Painting Services</Text>
      <ScrollView horizontal style={styles.painter} contentContainerStyle={styles.contentContainer}>
        {paintingJobs.map((job, index) => (
          <TouchableOpacity key={index}>
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
    padding: 16,
    backgroundColor: '#fff',
  },
  serviceHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  painter: {
    minHeight: 250,
  },
  contentContainer: {
    alignItems: 'center',
  },
});

export default PaintingServices;
