import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // for check, cross, sort icons
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Feather from 'react-native-vector-icons/Feather';
import EncryptedStorage from 'react-native-encrypted-storage';
import axios from 'axios';
import uuid from 'react-native-uuid';

const ServiceItem = ({ item, formatDate }) => {
  const status = item.payment !== null ? 'completed' : 'cancelled'; // Determine status based on payment

  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemMainContainer}>
        <Image source={{ uri: 'https://i.postimg.cc/jSJS7rDH/1727646707169dp7gkvhw.png' }} style={styles.image} />
        <View style={styles.itemDetails}>
          <Text style={styles.title}>{item.service}</Text>
          <View style={styles.sheduleContainer}>
            <View>
              <Text style={styles.schedule}>Scheduled for: {formatDate(item.created_at)}</Text>
            </View>
            <View>
              <Icon
                name={status === 'completed' ? 'check-circle' : 'cancel'}
                size={24}
                color={status === 'completed' ? 'green' : 'red'}
              />
            </View>
          </View>
        </View>
      </View>
      {status === 'completed' && ( // Conditionally render payment details only for completed services
        <View style={styles.paymentMainContainer}>
          <View>
            <Text style={styles.payment}>Payed by Cash</Text>
          </View>
          <View>
            <Text style={styles.price}>₹{item.payment}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const RecentServices = () => {
  const [bookingsData, setBookingsData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState('all'); // New state to track sorting criteria

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = await EncryptedStorage.getItem('pcs_token');
        if (!token) throw new Error("Token not found");

        const response = await axios.get(`${process.env.BackendAPI1}/api/worker/bookings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBookingsData(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching bookings data:', error);
      }
    };

    fetchBookings();
  }, []);

  const formatDate = (created_at) => {
    const date = new Date(created_at);
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${String(day).padStart(2, '0')}, ${year}`;
  };

  const sortedData = bookingsData.filter(item => {
    const status = item.payment !== null ? 'completed' : 'cancelled'; // Determine status based on payment
    if (sortBy === 'completed') return status === 'completed';
    if (sortBy === 'cancelled') return status === 'cancelled';
    return true; // Return all items for 'all' or if no sort is applied
  });

  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.container}>
        <FontAwesome6 name='arrow-left-long' size={20} color='#9e9e9e' style={styles.leftIcon} />
        <View style={styles.header}>
          <TouchableOpacity>
            <View style={styles.sortContainer}>
              <Feather name="shopping-cart" size={24} color="#212121" />
              <Text style={styles.headerText}>My services</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <View style={styles.sortContainer}>
              <Text style={styles.sortText}>Sort by</Text>
              <Icon name="sort" size={24} color="black" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Modal for sorting options */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Sort Services</Text>
              <TouchableOpacity onPress={() => { setSortBy('completed'); setModalVisible(false); }}>
                <Text style={styles.modalOption}>Completed</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setSortBy('cancelled'); setModalVisible(false); }}>
                <Text style={styles.modalOption}>Cancelled</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setSortBy('all'); setModalVisible(false); }}>
                <Text style={styles.modalOption}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <FlatList
          data={sortedData} // Use sortedData instead of bookingsData
          renderItem={({ item }) => <ServiceItem item={item} formatDate={formatDate} />} // Pass formatDate
          keyExtractor={(item) => uuid.v4()}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 70,
  },
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalOption: {
    fontSize: 18,
    marginVertical: 10,
    color: '#007BFF',
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sheduleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentMainContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemMainContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginLeft: 7,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 16,
    marginRight: 8,
    fontWeight: 'bold',
    color: '#212121',
  },
  itemContainer: {
    flexDirection: 'column',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  image: {
    width: 70,
    height: 85,
    borderRadius: 25,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    width: '70%',
  },
  schedule: {
    fontSize: 12,
    color: '#9e9e9e',
    marginTop: 5,
  },
  payment: {
    fontSize: 14,
    color: '#9e9e9e',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
  },
});

export default RecentServices;
