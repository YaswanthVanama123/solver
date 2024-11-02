import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert, BackHandler } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute,CommonActions, useFocusEffect } from '@react-navigation/native';

const Rating = () => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [service, setService] = useState(null);
  const [decodedId, setDecodedId] = useState(null);
  const route = useRoute();
  const navigation = useNavigation();
  const {encodedId} = route.params;

  useEffect(() => {
    if (encodedId) {
      const decoded = atob(encodedId);
      setDecodedId(decoded);
    }
  }, [encodedId]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Navigate to a specific route when the back button is pressed
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
          })
        );
        // Return true to indicate that the back button press has been handled
        return true;
      };

      // Add event listener for hardware back button press
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Cleanup function to remove the event listener
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  useEffect(() => {
    if (decodedId) {
      console.log(process.env.REACT_APP_URL)
      const fetchPaymentDetails = async () => {
        try {
          const response = await axios.post(`${process.env.BACKEND}/url/worker/details/rating`, {
            notification_id: decodedId,
          });
          console.log(response)
          const { service, name } = response.data;
          setName(name);
          setService(service);
        } catch (error) {
          console.error('Error fetching payment details:', error);
        }
      };
      fetchPaymentDetails();
    }
  }, [decodedId]);

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleSubmit = async () => {
    console.log(process.env.REACT_APP_URL)
    try {
      const response = await axios.post(`${process.env.BACKEND}/url/user/feedback`, {
        notification_id: decodedId,
        rating,
        comments,
      });
      Alert.alert('Feedback submitted:', response.data.message);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
        })
      );
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rate your Click Solver Commander</Text>
      <Text style={styles.help}>Help us improve our services by providing feedback on your recent experience.</Text>
      <TextInput
        style={styles.input}
        value={name}
        editable={false}
        placeholder="Commander"
      />
      <Text style={styles.ratingLabel}>Rating</Text>
      <View style={styles.stars}>
        {[...Array(5)].map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleStarClick(index + 1)}
          >
            <Text style={[styles.star, rating > index && styles.selectedStar]}>
              &#9733;
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.ratingText}>{rating} star{rating !== 1 ? 's' : ''}</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        multiline
        numberOfLines={4}
        placeholder="Share your thoughts on the service"
        value={comments}
        onChangeText={setComments}
      />
      <Button title="Submit Feedback" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color:'#000'
  },
  help: {
    color:'#000'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 3,
    padding: 10,
    marginVertical: 10,
    fontSize: 14,
    color:'#000'
  },
  ratingLabel: {
    marginTop: 20,
    marginBottom: 10,
    fontWeight: 'bold',
    color:'#000'
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  star: {
    fontSize: 35,
    color: '#ccc',
    marginHorizontal: 2,
  },
  selectedStar: {
    color: '#000',
  },
  ratingText: {
    fontWeight: 'bold',
    marginBottom: 15,
    color:'#000'
  },
  textarea: {
    height: 100,
    color:'#000'
  },
});

export default Rating;
