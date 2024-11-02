import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import uuid from 'react-native-uuid';
import axios from 'axios';
import ServiceCard from './ServiceCard';
import ServiceDetails from './ServiceDetails';

const PlumberServices = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [plumberJobs, setPlumberJobs] = useState([]);

  useEffect(() => {
    const fetchPlumberJobs = async () => {
      try {
        console.log(process.env.REACT_APP_API_URL)
        const response = await axios.get(`http://192.168.146.71:5000/api/plumber/services`);
        setPlumberJobs(response.data);
      } catch (error) {
        console.error('Error fetching plumber services:', error);
      }
    };

    fetchPlumberJobs();
  }, []);

  const openMessageBox = (job) => {
    setSelectedJob(job);
  };

  const closeMessageBox = () => {
    setSelectedJob(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.serviceHeader}>Plumber Repairing Services</Text>
      <ScrollView horizontal style={styles.plumber}>
        {plumberJobs.map((job, index) => (
          <ServiceCard
            key={uuid.v4()}
            job={job}
            onPress={openMessageBox} 
          />
        ))}
      </ScrollView>
      {selectedJob && (
        <ServiceDetails job={selectedJob} onClose={closeMessageBox} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    position: 'relative', // Ensure the parent has relative positioning
  },
  plumber: {
    flexDirection: 'row',
    height: 200,
  },
  serviceHeader: {
    fontFamily: 'Roboto',
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 23,
    color: '#333333',
    paddingBottom: 10,
  },
});

export default PlumberServices;
