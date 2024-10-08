import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchBox from '../Components/Search';
import PlumberServices from '../Components/Plumber';
import ServicesProvided from '../Components/ServicesProvided';
import ElectricianServices from '../Components/ElectricianServices';
import FullCard from '../Components/FullCard';
import CleaningServices from '../Components/Cleaning';
import SecondFullCard from '../Components/SecondFullCard';
import PaintingServices from '../Components/Painting';
import VehicleServices from '../Components/Mechanic';
import ServiceDetails from '../Components/ServiceDetails';
import TimingScreen from '../Components/TimingScreen';
import EncryptedStorage from 'react-native-encrypted-storage';
import axios from 'axios';

const HomeScreen = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [messageBoxDisplay, setMessageBoxDisplay] = useState(false);
  const [trackScreen, setTrackScreen] = useState([]);
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;
  const scrollViewRef = useRef(null);
  const itemWidth = screenWidth * 0.95; // Width of each item including margin

  useEffect(() => {
    const fetchTrackDetails = async () => {
      try {
        const cs_token = await EncryptedStorage.getItem('cs_token'); // Replace with the actual cs_token
        console.log("process ur",process.env.REACT_APP_API_URL)
        if (cs_token) {
          
          //const response = await axios.get('http://10.0.2.2:5000/api/user/track/details', {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/track/details`, {
            headers: { Authorization: `Bearer ${cs_token}` },
          });
          
          // Safely access track from response
          const track = response?.data?.track || [];
          console.log(track.length)

          if (track.length === 0) {
            setMessageBoxDisplay(false);
          } else {
            setMessageBoxDisplay(true);
          }

          setTrackScreen(track);
        }
      } catch (error) {
        console.error('Error fetching track details:', error);
      }
    };

    fetchTrackDetails();
}, []);


  useEffect(() => {
    let scrollInterval;
    if (messageBoxDisplay && trackScreen.length > 0) {
      const totalWidth = itemWidth * trackScreen.length * 2; // Total width of duplicated items

      scrollInterval = setInterval(() => {
        if (scrollViewRef.current) {
          const currentOffset = scrollViewRef.current.contentOffset?.x || 0;
          const newOffset = (currentOffset + itemWidth * 0.95) % totalWidth;

          if (newOffset === 0) {
            // Reset to the beginning of the duplicated list when reaching the true end
            scrollViewRef.current.scrollTo({ x: itemWidth * trackScreen.length, animated: false });
          } else {
            scrollViewRef.current.scrollTo({
              x: newOffset,
              animated: true,
            });
          }
        } else {
          console.warn('ScrollView ref is not set.');
        }
      }, 7000);
    }

    return () => clearInterval(scrollInterval); // Cleanup the interval on component unmount
  }, [messageBoxDisplay, trackScreen, itemWidth]);

  const handleJobSelect = (job) => {
    setSelectedJob(job);
  };

  const handleClose = () => {
    setSelectedJob(null);
  };

  // Duplicate the trackScreen array
  const duplicatedTrackScreen = [...trackScreen, ...trackScreen];

  return (
    <SafeAreaView style={styles.container}>
      <SearchBox />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <PlumberServices onJobSelect={handleJobSelect} />
        <ServicesProvided />
        <ElectricianServices onJobSelect={handleJobSelect} />
        <FullCard />
        <CleaningServices onJobSelect={handleJobSelect} />
        <SecondFullCard />
        <PaintingServices onJobSelect={handleJobSelect} />
        <VehicleServices onJobSelect={handleJobSelect} /> 
      </ScrollView>
      {selectedJob && (
        <ServiceDetails job={selectedJob} onClose={handleClose} />
      )}

      {messageBoxDisplay && (
        <ScrollView
          horizontal
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollViewHorizontal}
          showsHorizontalScrollIndicator={false}
        >
          {trackScreen.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.messageBoxContainer, { width: itemWidth }]}
              onPress={() => navigation.replace(item.screen, { encodedId: item.encodedId })}
            >
              <View style={styles.messageBox}>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeContainerText}>10</Text>
                  <Text style={styles.timeContainerText}>Mins</Text>
                </View>
                <View>
                  {item.screen === "userwaiting" ? (
                    <Text style={styles.textContainerText}>Searching for best Commander</Text>
                  ) : item.screen === "UserNavigation" ? (
                    <Text style={styles.textContainerText}>Commander arrived Shortly</Text>
                  ) : item.screen === "worktimescreen" ? (
                    <Text style={styles.textContainerText}>Work in progress</Text>
                  ) : (
                    <Text style={styles.textContainerText}>Payment in progress</Text>
                  )}
                  <Text style={styles.textContainerTextCommander}>{item.commanderName} is solving your problem</Text>
                </View>
                <View>
                  <Text>Icon</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollViewHorizontal: {
    flexDirection: 'row',
  },
  messageBoxContainer: {
    marginRight: 10,
  },
  messageBox: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeContainer: {
    padding: 10,
    backgroundColor: '#33AD83',
    borderRadius: 5,
  },
  timeContainerText: {
    color: '#ffffff',
    fontSize: 15,
    textAlign: 'center',
  },
  textContainerText: {
    color: '#000',
    fontWeight: 'bold',
  },
  textContainerTextCommander: {
    color:'#000'
    // Your existing styles for the commander's text
  },
});

export default HomeScreen;
