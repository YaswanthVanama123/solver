// Import necessary modules
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PartnerSteps = () => {
  return (
    <View style={styles.container}>
      {/* Top-right Help Section */}
      <View style={styles.topBar}>
        <View style={{ flex: 1 }} />
        <Text style={styles.helpText}>Help</Text>
        <Icon name="more-vert" size={24} color="#333" style={styles.moreIcon} />
      </View>

      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://i.postimg.cc/jSJS7rDH/1727646707169dp7gkvhw.png' }} // Replace with your worker image URL or local asset
          style={styles.workerImage}
        />
        <Text style={styles.headerText}>Become a Click Solver partner in 3 easy steps!</Text>
      </View>

      {/* Step 1 */}
      <View style={styles.stepBox}>
        <View style={styles.stepRow}>
          <Icon name="check-circle" size={24} color="#1DA472" />
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>STEP 1</Text>
            <Text style={styles.stepName}>Signup</Text>
            <Text style={styles.stepStatus}>Completed</Text>
          </View>
          <Icon name="person-add" size={24} color="#000" />
        </View>
      </View>

      {/* Step 2 */}
      <View style={styles.stepBox}>
        <View style={styles.stepRow}>
          <Icon name="check-circle" size={24} color="#1DA472" />
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>STEP 2</Text>
            <Text style={styles.stepName}>Profile</Text>
            <Text style={styles.stepStatus}>Completed</Text>
          </View>
          <Icon name="person" size={24} color="#000" />
        </View>
      </View>

      {/* Step 3 */}
      <View style={styles.currentStepBox}>
        <View style={styles.stepRow}>
          <Icon name="account-balance-wallet" size={24} color="#FF5C00" />
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>STEP 3</Text>
            <Text style={styles.stepName}>Adding Banking Details</Text>
          </View>
          <Icon name="account-balance" size={24} color="#000" />
        </View>

        {/* Bank Details Section */}
        <View style={styles.bankDetailsContainer}>
        <Text style={styles.stepTitle}>STEP 3</Text>
        <Text style={styles.stepName}>Adding Banking Details</Text>
          <View style={styles.optionRow}>
            <Icon name="radio-button-checked" size={20} color="#000" />
            <Text style={styles.optionText}>Add bank account</Text>
          </View>
          <View style={styles.optionRow}>
            <Icon name="radio-button-unchecked" size={20} color="#000" />
            <Text style={styles.optionText}>Add UPI Id</Text>
          </View>
        </View>

        {/* Start Now Button */}
        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startButtonText}>Start now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f7f7f7',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#212121',
    marginRight: 8,
    fontWeight:'bold'
  },
  moreIcon: {
    marginRight: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  workerImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  headerText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    color: '#3E3D45',
  },
  stepBox: {
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepContent: {
    marginLeft: 12,
    flex: 1,
  },
  stepTitle: {
    fontSize: 12,
    color: '#999',
    paddingBottom:5
  },
  stepName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#757575',
    paddingBottom:5
  },
  stepStatus: {
    fontSize: 14,
    color: '#1DA472',
  },
  currentStepBox: {
    borderWidth: 1,
    borderColor: '#FF5C00',
    padding: 16,
    borderRadius: 10,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  bankDetailsContainer: {
    marginTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  optionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  startButton: {
    backgroundColor: '#FF5C00',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 16,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PartnerSteps;
