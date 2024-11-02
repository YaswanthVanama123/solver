import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Button } from 'react-native';
import Swiper from 'react-native-swiper';
import Icon from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign'
import uuid from 'react-native-uuid';

const SingleService = () => {
    const [service,setService] = useState({})
    const [services, setServices] = useState([]);
    const [serviceName,setServiceName] = ['AC Service & Repair']

    const fetchDetails = async () =>{
        try {
            // setLoading(true);
             // Start loading animation
            console.log("env variable",serviceName)
            const response = await axios.post(`${process.env.BACKEND}/api/single/service`, {
                serviceName: serviceName,
              });
            // Add UUIDs to services
            const {service,relatedServices} = response.data
    
            setService(service)
             setServices(relatedServices);
          } catch (error) {
            console.error('Error fetching services:', error);
          }
        //   } finally {
        //     setLoading(false); // Stop loading animation when data is fetched
        //   }
    }

    useEffect(() =>{
        fetchDetails()
    },[])

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.imageIcons}>
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.imageIcons}>
                        <Icon name="search" size={24} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.imageIcons}>
                        <Icon name="settings-outline" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Carousel */}
            <View style={styles.carouselContainer}>
                <Swiper style={styles.wrapper} autoplay={true} autoplayTimeout={3} showsPagination={false}>
                    {services.map((service, index) => (
                        <View key={uuid.v4()}>
                            <Image source={{ uri: service.service_urls }} style={styles.carouselImage} resizeMode="stretch" />
                            {/* Icons on the carousel */}
                            <View style={styles.carouselIcons}>
                                
                            </View>
                        </View>
                    ))}
                </Swiper>
            </View>

            {/* Service Header */}
            <View style={styles.serviceHeader}>
                <View style={styles.serviceDetails}>
                <Text style={styles.serviceTitle}>{serviceName}</Text>
                <Text style={styles.ratings}>4.81 (7.0 M bookings)</Text>

                {/* Action Buttons */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionButtons}>
                    <TouchableOpacity style={[styles.actionButton, styles.blue]}>
                        <Text style={styles.actionText}>UC Professional Cleaning Guide</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.purple]}>
                        <Text style={styles.actionText}>Save 10% on every order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.green]}>
                        <Text style={styles.actionText}>CRED cashback</Text>
                    </TouchableOpacity>
                </ScrollView>
                <View style={styles.priceContainer}>
                <Text style={styles.text}>Minimum Charges Price for 1/2 hour: <Text>₹149</Text></Text>
                <Text style={styles.text}>Every 1/2 hour will charge ₹49</Text>
            </View> 
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.bookButton}
                >
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
            </View>
                </View>

                
                

            </View>
            
            {/* <View style={styles.secondCard}>

            </View> */}
            {/* Service Options */}

            {/* <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View style={styles.serviceOptions}>
                {services.map(service => (
                    <View key={uuid.v4()} style={styles.serviceItem}>
                        <Image source={{ uri: service.service_urls }} style={styles.optionImage} />
                        <Text style={styles.serviceText}>{service.service_name}</Text>
                    </View>
                ))}
            </View>
            </ScrollView> */}
            <View style={styles.horizontalLine} />


    <View  style={styles.recomendedContainer}>
      <Text style={styles.recomendedHead}>{service.service_title}</Text>
      {services.map((service, index) => (
      <TouchableOpacity key={index} style={styles.recomendedCard}>
        <View style={styles.recomendedCardDetails}>
          <Text style={styles.recomendedCardDetailsHead}>{service.service_name}</Text>
          <Text style={styles.recomendedCardDetailsRating}>
            <AntDesign name="star" size={11} color="#000" /> 4.83 (1.2M reviews)
          </Text>
          <Text style={styles.recomendedCardDetailsDescription}>
            Cleaning of all areas with chemicals to remove dirt & stain ...
          </Text>
        </View>
        <View>
          <Image
            source={{ uri: service.service_urls }}
            style={styles.recomendedImage}
            resizeMode="stretch"
          />
        </View>
      </TouchableOpacity>
        ))}
    </View>

    


        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    secondCard:{
        padding:20
    },
    recomendedCardDetailsRating:{
        color:'#4f4f4f',
        fontSize:11,
        paddingBottom:10,
        fontFamily:'Poppins-Light'
    },
    recomendedCardDetailsDescription:{
        color:'#4f4f4f',
        fontSize:12,
        lineHeight:18,
        fontFamily:'Poppins-Light'
    },
    recomendedCardDetailsHead:{
        color:'#0d0d0d',
        fontSize:15,
        fontFamily:'Poppins-Medium',
        paddingBottom:5,
        lineHeight:26
    },
    recomendedCardDetails:{
        width:'50%'
    },
    recomendedImage:{
        width:105,
        height:105,
        borderRadius:10
    },
    recomendedCard:{
        display:'flex',
        flexDirection:'row',
        width:'100%',
        justifyContent:'space-between',
        marginTop:35
    },
    recomendedContainer:{
        padding:20,
    },
    recomendedHead: {
        color:'#0d0d0d',
        fontFamily:'Poppins-Bold',

        fontSize:19,
  
    },
    serviceDetails:{
        padding:20
    },
    priceContainer:{
        marginTop:20
    },
    buttonContainer:{
        display:"flex",
        flexDirection:'row',
        width: Dimensions.get('window').width,
        // justifyContent: "center",
        marginTop:30
    },
    horizontalLine: {
        width: Dimensions.get('window').width,
        height: 1, // Height of the line
        backgroundColor: '#f5f5f5', // Color of the line,
        marginTop:20,
        height:9
    },
    imageIcons: {
        width: 40, // Define the width of the circle
        height: 40, // Define the height of the circle
        borderRadius: 20, // Half of the width or height for a perfect circle
        backgroundColor: '#ffffff', // Background color for the circle
        justifyContent: 'center', // Center vertically
        alignItems: 'center', // Center horizontally
        marginRight:10
      },
    text:{
        color:'#0d0d0d',
        fontFamily:'Poppins-Light'
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 15,
        textAlign:'center',
        fontFamily:'Poppins-Light'
      },
    bookButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ff9500',
        borderRadius: 8,
        marginTop: 10,
        width:150,
        height: 31,
        justifyContent: 'center',
        alignItems:'center'
      },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        alignItems: 'center',
        backgroundColor: 'transparent',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,  // Ensures the header appears above the carousel
    },
    headerIcons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 80,
    },
    wrapper: {
        height: 250,
    },
    carouselContainer: {
        height: 250,
    },
    carouselImage: {
        width: Dimensions.get('window').width,
        height: 250,
        resizeMode: 'cover',
    },
    carouselIcons: {
        position: 'absolute',
        right: 20,
        top: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 70,
    },
    serviceHeader: {

        backgroundColor: '#fff',
    },
    serviceTitle: {
        fontSize: 23,
        color:'#0d0d0d',
        width:'90%',
        fontFamily:'Poppins-Bold',
        lineHeight:30
    },
    ratings: {
        color: '#0d0d0d',
        marginVertical: 10,
        fontSize:13,
        fontFamily:'Poppins-Light'
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 10,
    },
    actionButton: {
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    blue: {
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
        borderColor: '#F4F4F4', // Border color
        borderRadius: 10,   // Optional: for rounded corners
    },
    purple: {
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
        borderColor: '#F7F7F7', // Border color
        borderRadius: 10,   // Optional: for rounded corners
    },
    green: {
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
        borderColor: '#F7F7F7', // Border color
        borderRadius: 10,   // Optional: for rounded corners
    },
    actionText: {
        color: '#0d0d0d',
        fontFamily:'Poppins-SemiBold'

    },
    serviceOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap:20,
        padding: 20,
        backgroundColor: '#fff',
    },
    serviceItem: {
        alignItems: 'center',
        width: 100,
    },
    optionImage: {
        width: 100,
        height: 100,
        resizeMode: 'cover',
        marginBottom: 10,
        borderRadius:10
    },
    serviceText: {
        textAlign: 'center',
        color: '#333',
    },
});

export default SingleService;
