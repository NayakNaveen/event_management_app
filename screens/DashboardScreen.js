import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { db } from '../firebase';  // Firebase config
import { collection} from 'firebase/firestore';
import { query, where, getDocs } from 'firebase/firestore';
import { auth } from '../firebase';

const DashboardScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.log("User is not logged in.");
        return;
      }
      const eventsQuery = query(collection(db, 'events'), where('userId', '==', userId));
      const querySnapshot = await getDocs(eventsQuery);
      const eventsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsList);
    } catch (error) {
      console.error('Error fetching events from Firestore:', error);
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      fetchEvents();
    } else {
      setEvents([]);
    }
  }, [auth.currentUser]);


  const refreshEvents = () => {
    fetchEvents(); 
  };

  const renderEvent = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetails', { event: item })} // Navigate to event details page
    >
      <Text style={styles.eventName}>{item.name}</Text>
      <Text style={styles.eventInfo}>{`${item.date} at ${item.time}`}</Text>
      <Text style={styles.eventInfo}>{item.location}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upcoming Events</Text>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No events scheduled!</Text>} // Show when no events
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddEvent', { refreshEvents })}  
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  eventCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventInfo: {
    fontSize: 14,
    color: '#555',
  },
  emptyText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
  },
  addButton: {
    backgroundColor: '#f56a61',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 30,
    lineHeight: 30,
  },
});

export default DashboardScreen;
