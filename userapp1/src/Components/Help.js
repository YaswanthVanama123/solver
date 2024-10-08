import axios from 'axios';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SvgXml } from 'react-native-svg'; // Install react-native-svg for icons

const electricianIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10"><path d="M18.8 4A6.3 8.7 0 0 1 20 9"></path><path d="M9 9h.01"></path><circle cx="9" cy="9" r="7"></circle><rect width="10" height="6" x="4" y="16" rx="2"></rect><path d="M14 19c3 0 4.6-1.6 4.6-1.6"></path><circle cx="20" cy="16" r="2"></circle></svg>
`;

const Help = () => {



  return (
    <ScrollView style={styles.container}>
      {/* How It Works Section */}
      <View style={styles.section}>
        <Text style={styles.heading}>How It Works</Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>1. Choose a service category</Text>
          <Text style={styles.listItem}>2. Select a specific service</Text>
          <Text style={styles.listItem}>3. Confirm your location</Text>
          <Text style={styles.listItem}>4. Wait for a nearby worker to accept</Text>
          <Text style={styles.listItem}>5. Worker navigates to your location</Text>
          <Text style={styles.listItem}>6. Verify worker with OTP</Text>
          <Text style={styles.listItem}>7. Service begins</Text>
        </View>
      </View>

      {/* Our Services Section */}
      <View style={styles.section}>
        <Text style={styles.heading}>Our Services</Text>
        <View style={styles.grid}>
          <View style={styles.serviceItem}>
            <SvgXml xml={electricianIcon} width="24" height="24" color='#000'/>
            <Text style={styles.serviceText}>Electrician</Text>
          </View>
          <View style={styles.serviceItem}>
            <SvgXml xml={electricianIcon} width="24" height="24" color='#000'/>
            <Text style={styles.serviceText}>Electrician</Text>
          </View>
          <View style={styles.serviceItem}>
            <SvgXml xml={electricianIcon} width="24" height="24" color='#000'/>
            <Text style={styles.serviceText}>Electrician</Text>
          </View>
          <View style={styles.serviceItem}>
            <SvgXml xml={electricianIcon} width="24" height="24" color='#000'/>
            <Text style={styles.serviceText}>Electrician</Text>
          </View>
          <View style={styles.serviceItem}>
            <SvgXml xml={electricianIcon} width="24" height="24" color='#000'/>
            <Text style={styles.serviceText}>Electrician</Text>
          </View>
          <View style={styles.serviceItem}>
            <SvgXml xml={electricianIcon} width="24" height="24" color='#000'/>
            <Text style={styles.serviceText}>Electrician</Text>
          </View>
          <View style={styles.serviceItem}>
            <SvgXml xml={electricianIcon} width="24" height="24" color='#000'/>
            <Text style={styles.serviceText}>Electrician</Text>
          </View>
          <View style={styles.serviceItem}>
            <SvgXml xml={electricianIcon} width="24" height="24" color='#000'/>
            <Text style={styles.serviceText}>Electrician</Text>
          </View>
          
          {/* Add other services here similarly */}
        </View>
      </View>

      {/* Pricing Section */}
      <View style={styles.section}>
        <Text style={styles.heading}>Pricing</Text>
        <View style={styles.priceList}>
          <View style={styles.priceItem}>
            <Image source={{ uri: 'path-to-clock-icon.png' }} style={styles.icon} />
            <Text style={styles.price}>First hour: ₹199</Text>
          </View>
          <View style={styles.priceItem}>
            <Image source={{ uri: 'path-to-indian-rupee-icon.png' }} style={styles.icon} />
            <Text style={styles.price}>Every additional hour: +₹99</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
    padding: 16,
  },
  price:{
    color:'#000'
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    color:'#000'
  },
  list: {
    paddingLeft: 16,
  },
  listItem: {
    fontSize: 16,
    marginBottom: 8,
    color:'#000'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 16,
    width: '48%', // To have two items per row
  },
  serviceText: {
    marginLeft: 8,
    color:'#000'
  },
  priceList: {
    marginTop: 16,
  },
  priceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
});

export default Help;
