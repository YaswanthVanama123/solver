import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback, BackHandler } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { Calendar } from 'react-native-calendars';
import EncryptedStorage from "react-native-encrypted-storage";
import { useNavigation, useRoute, CommonActions, useFocusEffect } from "@react-navigation/native";
import axios from 'axios'

const EarningsScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to today
  const [selectedPeriod, setSelectedPeriod] = useState('Today'); // Track selected period
  const [showCalendar, setShowCalendar] = useState(false);
  const [earnings,setEarnings] = useState([])
  const navigation = useNavigation();

  useEffect(() =>{
    partnerEarnings(new Date());
  },[])

  const partnerEarnings = async (date) => {
    console.log("date", date);
    const pcs_token = await EncryptedStorage.getItem('pcs_token'); 
    try {
      const response = await axios.post(
        `${process.env.BackendAPI1}/api/worker/earnings`, 
        { 
          date: date // Include the date parameter
        },
        {
          headers: {
            Authorization: `Bearer ${pcs_token}`, // Send the token in the Authorization header
          }
        }
      );
  
      const { total_payment, cash_payment, payment_count,lifeearnings,avgrating,rejectedcount,pendingcount } = response.data;
  
      // Ensure values are numbers or default to 0 if null or undefined
      const amount = Number(total_payment) || 0;
      const cashAmount = Number(cash_payment) || 0;
      const paymentCount = Number(payment_count) || 0;
      const lifeearning = Number(lifeearnings) || 0;
      const avgRating = Number(avgrating) || 0;
  
      setEarnings({
        total_payment: amount,
        cash_payment: cashAmount,
        payment_count: paymentCount,
        life_earnings: lifeearning,
        avgrating:avgRating,
        rejectedcount:rejectedcount,
        pendingcount:pendingcount

      });
    } catch (error) {
      console.error('Error fetching payment details:', error);
    }
  };
  
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

  // Function to handle tab clicks
  const handleTabClick = (period) => {
    setSelectedPeriod(period); // Set the selected period for highlighting
    if (period === 'Today') {
      setSelectedDate(new Date());
      partnerEarnings(new Date());
    } else if (period === 'This Week') {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      setSelectedDate(startOfWeek);
      partnerEarnings(startOfWeek);
    } else if (period === 'This Month') {
      setShowCalendar(true); // Show calendar for month selection
    }
  };

  // Function to call when a date is selected
  const selectDate = (day) => {
    const selectedDate = new Date(day.dateString);
    setSelectedDate(selectedDate);
    setShowCalendar(false);
    partnerEarnings(selectedDate);
  };

  const backToHome = () =>{
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
      })
    );
  }


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={backToHome} style={styles.leftIcon}>
          <FontAwesome6 name='arrow-left-long' size={20} color='#9e9e9e'  />
        </TouchableOpacity>
        <View style={styles.earningsIconContainer}>
          <FontAwesome6 name='coins' size={20} color='#212121' style={styles.EarningIcon} />
          <Text style={styles.screenName}>Earnings</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={selectedPeriod === 'Today' ? styles.tabActive : styles.tabInactive} onPress={() => handleTabClick('Today')}>
          <Text style={selectedPeriod === 'Today' ? styles.tabTextActive : styles.tabTextInactive}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={selectedPeriod === 'This Week' ? styles.tabActive : styles.tabInactive} onPress={() => handleTabClick('This Week')}>
          <Text style={selectedPeriod === 'This Week' ? styles.tabTextActive : styles.tabTextInactive}>This Week</Text>
        </TouchableOpacity>
        <TouchableOpacity style={selectedPeriod === 'This Month' ? styles.tabActive : styles.tabInactive} onPress={() => handleTabClick('This Month')}>
          <Text style={selectedPeriod === 'This Month' ? styles.tabTextActive : styles.tabTextInactive}>This Month</Text>
        </TouchableOpacity>
      </View>

      {/* Earnings Summary */}
      <View style={styles.earningsContainer}>
        <Text style={styles.totalEarningsText}>₹ {earnings.total_payment}</Text>
        <View style={styles.horizantalLine} />
        <View style={styles.cashContainer}>
          <View>
            <Text style={styles.cashCollectedText}>Cash collected</Text>
          </View>
          <View>
            <Text style={styles.cashCollectedAmount}>₹ {earnings.cash_payment}</Text>
          </View>
        </View>
      </View>

      {/* Statistics */}
      <ScrollView contentContainerStyle={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{earnings.payment_count}</Text>
            <Text style={styles.statTitle}>Services</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{earnings.life_earnings}</Text>
            <Text style={styles.statTitle}>Life Time Earnings</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statTitle}>Hours</Text>
          </View>
          <View style={styles.statBox}>
          <Text style={styles.statValue}>{earnings.avgrating?.toFixed(1)}</Text>
            <Text style={styles.statTitle}>Avg Rating</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBoxRed}>
            <Text style={styles.statValueRed}>{earnings.rejectedcount}</Text>
            <Text style={styles.statTitle}>Services Rejected</Text>
          </View>
          <View style={styles.statBoxOrange}>
            <Text style={styles.statValueOrange}>{earnings.pendingcount}</Text>
            <Text style={styles.statTitle}>Not Seen</Text>
          </View>
        </View>
      </ScrollView>

      {/* Calendar Modal */}
      <Modal visible={showCalendar} transparent={true} animationType="slide">
        <TouchableWithoutFeedback onPress={() => setShowCalendar(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <Calendar
                onDayPress={selectDate}
                markedDates={{
                  [selectedDate.toISOString().split('T')[0]]: { selected: true, selectedColor: '#4CAF50' },
                }}
              />
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    padding: 10,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    position: 'relative',
  },
  cashCollectedAmount: {
    color: '#212121',
    fontWeight: '900',
    paddingHorizontal: 20,
  },
  cashContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  earningsIconContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
  horizantalLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#f7f7f7',
  },
  screenName: {
    color: '#212121',
    fontSize: 17,
    fontWeight: 'bold',
  },
  leftIcon: {
    position: 'absolute',
    left: 10,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#d1d1d1',
    height: 68,
    paddingTop: 10,
    marginTop: 10,
  },
  tabActive: {
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#FDC702',
  },
  tabInactive: {
    paddingVertical: 10,
  },
  tabTextActive: {
    color: '#212121',
    fontWeight: 'bold',
  },
  tabTextInactive: {
    color: '#757575',
  },
  earningsContainer: {
    backgroundColor: '#fff',
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    height: 107,
  },
  totalEarningsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    padding: 10,
    textAlign: 'center',
  },
  cashCollectedText: {
    fontSize: 14,
    color: '#747676',
    fontWeight: 'bold',
    marginTop: 5,
    paddingHorizontal: 20,
  },
  statsContainer: {
    paddingHorizontal: 10,
    marginTop: 20,
    gap: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  statBoxRed: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#ff4436',
  },
  statBoxOrange: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#ffa500',
  },
  statValue: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statValueRed: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ff4436',
  },
  statValueOrange: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffa500',
  },
  statTitle: {
    color: '#747676',
    fontWeight: 'bold',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
});

export default EarningsScreen;
