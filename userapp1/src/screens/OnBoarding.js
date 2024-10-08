import React, { useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import LinearGradient from 'react-native-linear-gradient';

const OnboardingScreen = () => {
  const swiperRef = useRef(null); // Create a ref for the Swiper

  const slides = [
    {
      key: '1',
      title: 'Welcome to Click Solver',
      text: 'Find skilled professionals in your local area with just a few taps. From electricians to salon specialists, we connect you with experts ready to assist.',
      image: 'https://i.postimg.cc/BbPghn6t/boarding1-1-removebg-preview.png',
      backgroundColorPrimary: '#77CEFF',
      backgroundColorSecondary: '#298BC2',
    },
    {
      key: '2',
      title: 'Quick & Easy Connections',
      text: 'Browse through our categories, select the service you need, and instantly connect with professionals.',
      image: 'https://i.postimg.cc/3rvmxz2Y/Screenshot-165-removebg-preview.png',
      backgroundColorPrimary: '#D080FF',
      backgroundColorSecondary: '#6C5DD3',
    },
    {
      key: '3',
      title: 'Trusted and Verified',
      text: 'All our professionals are thoroughly vetted. Your safety and satisfaction are our top priorities.',
      image: 'https://i.postimg.cc/Y06xGPGn/Screenshot-166-removebg-preview.png',
      backgroundColorPrimary: '#FFC876',
      backgroundColorSecondary: '#E84B00',
    },
  ];

  const handleNextPress = (index) => {
    // If it's the last slide, you might want to do something else (e.g., navigate to another screen)
    if (index < slides.length - 1) {
      swiperRef.current.scrollBy(1); // Move to the next slide
    } else {
      // Handle "Get Started" button action
      console.log('Navigate to the main screen');
    }
  };

  return (
    <Swiper ref={swiperRef} showsButtons={false} loop={false} dotStyle={styles.dotStyle}  activeDotStyle={styles.activeDotStyle} >
{slides.map((slide, index) => (
        <View key={slide.key} style={[styles.slide]}>
          <LinearGradient
            colors={[slide.backgroundColorPrimary, slide.backgroundColorSecondary]}
            style={styles.innerCard}
          >
            <Image source={{ uri: slide.image }} style={styles.image} resizeMode="stretch"/>
          </LinearGradient>
          <View style={styles.Onboardingcontent}>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.text}>{slide.text}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => handleNextPress(index)}>
              <Text style={styles.buttonText}>{index === slides.length - 1 ? 'Get Started' : 'Next'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </Swiper>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
  },
  Onboardingcontent: {
    padding: 25,
  },
  image: {
    width: '100%',
    height: 250,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1B1D21',
  },
  text: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 20,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',

  },
  innerCard: {
    height: '50%',
    padding: 20,
    display: 'flex',
    justifyContent: 'center',
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 25,
    
  },
  button: {
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 45,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dotStyle: {
    backgroundColor: '#C0C0C0', // Default dot color (light gray)
    width: 10,
    height: 10,
    borderRadius: 5, // To make it a circle
    marginHorizontal: 5,
  },
  activeDotStyle: {
    backgroundColor: '#000', // Active dot color (black)
    width: 20, // Wider for the active dot
    height: 10,
    borderRadius: 10, // Rounded corners
    marginHorizontal: 5,
  },
});

export default OnboardingScreen;
