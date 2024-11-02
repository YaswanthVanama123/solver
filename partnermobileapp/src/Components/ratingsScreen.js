import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Dimensions } from 'react-native';
import  FontAwesome  from 'react-native-vector-icons/FontAwesome';
import  FontAwesome6 from 'react-native-vector-icons/FontAwesome6'
import SimpleLineIcons from 'react-native-vector-icons/Feather'
import EncryptedStorage from 'react-native-encrypted-storage';
import axios from 'axios';
import uuid from 'react-native-uuid';

// const reviews = [
//   {
//     id: '1',
//     name: 'Yaswanth',
//     rating: 4,
//     review: 'Very excellent service, he is very friendly worker very professional and clean and neat work, he repairs very speedily',
//   },
//   {
//     id: '2',
//     name: 'Yaswanth',
//     rating: 4,
//     review: 'Very excellent service, he is very friendly worker very professional and clean and neat work, he repairs very speedily',
//   },
//   {
//     id: '3',
//     name: 'Yaswanth',
//     rating: 4,
//     review: 'Very excellent service, he is very friendly worker very professional and clean and neat work, he repairs very speedily',
//   },
//   // Add more reviews as needed
// ];

const RatingsScreen = () => {

  const [reviews,setReviews] = useState([])
  const [workerReview,setworkerReview] = useState({})

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = await EncryptedStorage.getItem('pcs_token');
        if (!token) throw new Error("Token not found");

        const response = await axios.get(`${process.env.BackendAPI1}/api/worker/ratings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReviews(response.data);
        setworkerReview(response.data[0])
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching bookings data:', error);
      }
    };

    fetchReviews();
  }, []);


  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesome
          key={i}
          name={i <= rating ? 'star' : 'star-o'}
          size={16}
          color="#FF5722"
        />
      );
    }
    return stars;
  };

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewContainer}>

      <View style={styles.userContainer}>
          <View style={styles.actionButton}>
            <SimpleLineIcons name="user" size={18} color="#FF5722" />
          </View>
        <Text style={styles.userName}>{item.username}</Text>
      </View>
      <View style={styles.ratingContainer}>
        {renderStars(item.rating)}
      </View>
      <Text style={styles.reviewText}>{item.comment}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesome6 name='arrow-left-long' size={20} color='#9e9e9e' style={styles.leftIcon} />
        <Text style={styles.screenName}>Ratings & reviews</Text>
      </View>
      <View style={styles.profileMainContainer}>
        <View style={styles.profileContainer}>
            <View>
                <Image
                source={{ uri: workerReview.profile }} // Replace with your image URL
                style={styles.profileImage}
                />
            </View>
            <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{workerReview.name}</Text>
            <View style={styles.ratingContainer}>
                <Text style={styles.averageRating}>Avg rating</Text>
                <Text style={styles.avgRatingNumber}>{workerReview.rating} {renderStars(workerReview.rating)}</Text>
            </View>
            <Text style={styles.profession}>{workerReview.service}</Text>
            </View>
        </View>
      </View>

      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const screenWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  profileMainContainer:{
    marginLeft:33,
    marginTop:10,
    marginBottom:10
  },
  actionButton: {
    backgroundColor: '#EFDCCB',
    height:35,
    width:35,
    borderRadius: 50,
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center'

  },
  avgRatingNumber:{
    marginLeft:5,
    color:'#212121',
    fontSize:14
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center', // Center vertically
    justifyContent: 'center', // Center all content horizontally
    paddingVertical: 5,
    position: 'relative',
    marginBottom:20
  },
  leftIcon: {
    position: 'absolute', // Ensure the icon stays on the left
    left: 10, // Adjust the position to your needs
  },
  screenName:{
    color:'#747476',
    fontSize:17,
    fontWeight:'bold'

  },
  profileContainer: {
    flexDirection: 'row', // Horizontal alignment of elements
    marginBottom: 16,
    alignItems: 'center', // Vertically align items
    justifyContent: 'center', // Center items horizontally
    width: screenWidth, // Ensures that the container takes full width
    
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    color:'#212121',
    fontWeight: '500',
  },
  averageRating: {
    fontSize: 14,
    color: '#9e9e9e',
  },
  profession: {
    fontSize: 15,
    color: '#212121',
    fontWeight:'bold'
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewContainer: {
    padding: 5,
    paddingLeft:16,
    borderRadius: 8,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    marginLeft: 8,
    fontSize: 16,
    color:'#212121'
  },
  reviewText: {
    fontSize: 14,
    color: '#808080',
    marginTop: 8,
  },
});

export default RatingsScreen;
