import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  SafeAreaView
} from 'react-native';

import FontAwesome6 from 'react-native-vector-icons/FontAwesome6' 
import Ionicons from 'react-native-vector-icons/Ionicons'

const BankAccountScreen = () => {
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');

  const handleAddBankAccount = () => {
    // Logic for adding the bank account
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <FontAwesome6 name='arrow-left-long' size={20} color='#9e9e9e' style={styles.leftIcon} />
        </View>
        <View>
          <Ionicons name="help-circle-outline" size={25} color="#9e9e9e"/>
        </View>
      </View>
      <Text style={styles.bankAccountDetailsText}>Bank account details</Text>
      <View style={styles.form}>

        <TextInput
          style={styles.input}
          placeholder="Bank"
          placeholderTextColor="#747676"
          fontWeight='bold'
          value={bank}
          onChangeText={(text) => setBank(text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Account number"
          placeholderTextColor="#747676"
          fontWeight='bold'
          value={bank}
          onChangeText={(text) => setBank(text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Account number"
          placeholderTextColor="#747676"
          fontWeight='bold'
          value={bank}
          onChangeText={(text) => setBank(text)}
        />

        <TextInput
          style={styles.input}
          placeholder="IFSC CODE"
          placeholderTextColor="#747676"
          fontWeight='bold'
          value={bank}
          onChangeText={(text) => setBank(text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Account holder's name"
          placeholderTextColor="#747676"
          fontWeight='bold'
          value={bank}
          onChangeText={(text) => setBank(text)}
        />

        <Text style={styles.helpText}>Need help finding these numbers? <Text style={styles.learnMoreText}>Learn more</Text></Text>
        <Text style={styles.acceptTerms}>By adding this bank account, I agree to PayMe T& Cs regarding topping up from bank account .</Text>
        <TouchableOpacity style={styles.button} onPress={handleAddBankAccount}>
          <Text style={styles.buttonText}>Add bank account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafafa',  // Ensures the safe area has the same background
  },
  label: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#747676',
    marginBottom: 5,  // Space between label and input
  },
  input: {
    borderBottomWidth: 1,           // Only bottom border
    borderBottomColor: '#E0E0E0', 
    paddingVertical: 3,             // Adjust the vertical padding
    fontSize: 17,                   // Font size for input text
    color: '#212121',   
    marginBottom:40            // Color for input text
  },
  learnMoreText:{
    color:'#212121',
    fontWeight:'bold',
    paddingLeft:5
  },
  acceptTerms:{
    color:"#212121",
    paddingBottom:20,
    fontWeight:'600'
  },
  container: {
                 // Ensures ScrollView fills the remaining space
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fafafa',
  },
  horizantalLine:{
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 3,
    marginBottom:40
  },
  bankAccountDetailsText:{
    paddingTop:15,
    paddingBottom:40,
    fontWeight:'bold',
    color:'#212121',
    fontSize:23
  },
  header:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between'
  },
  label: {
    fontSize: 17,
    fontWeight: 'bold',
    color:'#747676'
  },
  helpText: {
    color: '#9e9e9e',
    
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    borderRadius: 22,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BankAccountScreen;
