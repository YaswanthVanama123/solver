import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, Modal, TouchableOpacity } from 'react-native';
import uuid from 'react-native-uuid'; // Import UUID
import axios from 'axios';
import ServiceCard from './ServiceCard'; // Ensure this component is adapted for React Native
import ServiceDetails from './ServiceDetails'; // Ensure this component is adapted for React Native

const { width } = Dimensions.get('window');

const ElectricianServices = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [electricianJobs, setElectricianJobs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchElectricianJobs = async () => {
      try {
       // const response = await axios.get('http://10.0.2.2:5000/api/electrician/services');
        const response = await axios.get('http://192.168.146.71:5000/api/electrician/services');
        setElectricianJobs(response.data);
      } catch (error) {
        console.error('Error fetching electrician services:', error);
      }
    };

    fetchElectricianJobs();
  }, []);

  const openMessageBox = (job) => {
    setSelectedJob(job);
    setModalVisible(true);
  };

  const closeMessageBox = () => {
    setSelectedJob(null);
    setModalVisible(false);
  };

  // Group items into rows of 2
  const groupedJobs = [];
  for (let i = 0; i < electricianJobs.length; i += 2) {
    groupedJobs.push({
      id: i.toString(), // Unique  key for each row
      jobs: [electricianJobs[i], electricianJobs[i + 1]],
    });
  }

  const renderJob = ({ item }) => (
    <View style={styles.cardContainer}>
      <ServiceCard job={item} onClick={() => openMessageBox(item)} />
    </View>
  );

  const renderRow = ({ item }) => (
    <FlatList
      data={item.jobs}
      renderItem={renderJob}
      keyExtractor={() => uuid.v4()}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Electrical Repairing Services</Text>
      <FlatList
        data={groupedJobs}
        renderItem={renderRow}
        keyExtractor={() => uuid.v4()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
      {selectedJob && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeMessageBox}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <ServiceDetails job={selectedJob} onClose={closeMessageBox} />
              <TouchableOpacity style={styles.closeButton} onPress={closeMessageBox}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    color: '#0f0f0f',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  list: {
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContainer: {
    marginRight: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 20,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ElectricianServices;
