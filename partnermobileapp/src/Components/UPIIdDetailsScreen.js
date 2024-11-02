import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'
import Ionicons from 'react-native-vector-icons/Ionicons'

const UPIIdDetailsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>

      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <FontAwesome6 name='arrow-left-long' size={20} color='#9e9e9e' style={styles.leftIcon} />
        </View>
        <View>
        <Text style={styles.title}>UPI Id details</Text>
        </View>
        <View>
          <Ionicons name="help-circle-outline" size={25} color="#9e9e9e"/>
        </View>
      </View>
      
      {/* Title Section */}
      

      {/* Tabs Section */}
      <View style={styles.tabsContainer}>
        <Text style={[styles.tab, styles.activeTab]}>Payment Details</Text>
     
      </View>

      {/* Input Section */}
      <View style={styles.inputContainer}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>UPI</Text>
          <Text style={styles.linkText}>What is UPI</Text>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your UPI ID"
            value="murarijha7588"
          />
          <Text style={styles.domainText}>@upi</Text>
        </View>

        <Text style={styles.linkText}>How to find UPI ID ?</Text>
      </View>

      {/* Add Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add UPI ID</Text>
        </TouchableOpacity>
      </View>

      {/* Help Text Section */}
      <Text style={styles.helpText}>How to add UPI ?</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom:15
  },
  cancelText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  // buttonContainer:{
  //   paddingHorizontal:40
  // },
  infoIcon: {
    color: '#000',
    fontSize: 20,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',

    color:'#212121',
    textAlign:'center'
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  tab: {
    fontSize: 16,
    color: '#A9A9A9',
    marginRight: 20,
  },
  activeTab: {
    color: '#212121',
    fontWeight: '400',
  },
  inputContainer: {
    marginTop: 30,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    color: '#212121',
  },
  linkText: {
    fontSize: 14,
    color: '#9e9e9e',
    fontWeight:'600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom:10
  
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D3D3D3',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: '#F9F9F9',
    color:'#212121',
    fontWeight:'bold',
    fontSize:18
  },
  domainText: {
    fontSize: 16,
    color: '#9e9e9e',
    marginLeft: 10,
    fontWeight:'600'
   
  },
  addButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 30,
    
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 16,
    color: '#9e9e9e',
    marginTop: 30,
  },
});

export default UPIIdDetailsScreen;
