import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import moment from 'moment';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';

const EventDetailsScreen = ({ route }) => {
  const { event } = route.params;

  // Function to get or create a default calendar
  const getDefaultCalendar = async () => {
    const calendars = await Calendar.getCalendarsAsync();
    const defaultCalendar = calendars.find(
      (cal) => cal.allowsModifications && cal.source && cal.source.name === 'Default'
    );

    if (defaultCalendar) {
      return defaultCalendar.id;
    }

    const newCalendarId = await Calendar.createCalendarAsync({
      title: 'My Events',
      color: '#f56a61',
      entityType: Calendar.EntityTypes.EVENT,
      source: {
        isLocalAccount: true,
        name: 'Expo Calendar',
      },
      name: 'My Events',
      ownerAccount: 'personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });

    return newCalendarId;
  };

  // Function to add event to the calendar and schedule a notification
  const addEventToCalendar = async () => {
    try {
      // Check for calendar permissions
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Calendar access has been denied.');
        return;
      }

      // Get or create the default calendar
      const calendarId = await getDefaultCalendar();
      if (!calendarId) {
        Alert.alert('Error', 'Failed to get or create a default calendar.');
        return;
      }

      // Convert the event date and time to a valid Date object
      const startDate = moment(`${event.date} ${event.time}`, 'YYYY-MM-DD hh:mm A').toDate();
      if (isNaN(startDate.getTime())) {
        Alert.alert('Error', 'Invalid event date or time.');
        return;
      }

      // Set end date as 1 hour after start date
      const endDate = moment(startDate).add(1, 'hour').toDate();

      // Add event to the calendar
      const eventId = await Calendar.createEventAsync(calendarId, {
        title: event.name,
        startDate,
        endDate,
        location: event.location,
        notes: `Event details: ${event.name} at ${event.location}`,
      });

      if (eventId) {
        Alert.alert('Success', `Event "${event.name}" added to your calendar!`);
        console.log('Event added to calendar with ID:', eventId);

        // Schedule a notification
        scheduleNotification(startDate);
      } else {
        Alert.alert('Error', 'Failed to add event.');
      }
    } catch (error) {
      console.error('Error adding event:', error);
      Alert.alert('Error', 'Could not add the event to the calendar.');
    }
  };

  const scheduleNotification = async (startDate) => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Notification permission has been denied.');
        return;
      }

      const triggerTimeInSeconds = Math.max((startDate.getTime() - Date.now()) / 1000 - 600, 0);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Reminder: ${event.name}`,
          body: `Your event is coming up at ${event.time}. Location: ${event.location}`,
        },
        trigger: {
          seconds: triggerTimeInSeconds,
          repeats: false,
        },
      });

      if (notificationId) {
        console.log('Notification scheduled with ID:', notificationId);
        Alert.alert('Reminder Set', 'You will be notified before the event.');
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const openLocationInMap = () => {
    const url = `https://www.google.com/maps?q=${event.location}`;
    Linking.openURL(url).catch((err) => Alert.alert('Error', 'Unable to open location.'));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event.name}</Text>
      <Text style={styles.info}>Date: {event.date}</Text>
      <Text style={styles.info}>Time: {event.time}</Text>
      <Text style={styles.info}>Location: {event.location}</Text>

      <TouchableOpacity style={styles.button} onPress={addEventToCalendar}>
        <Text style={styles.buttonText}>Add to Calendar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={openLocationInMap}>
        <Text style={styles.buttonText}>Open Location</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#f56a61',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EventDetailsScreen;
