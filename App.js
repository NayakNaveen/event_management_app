import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text } from 'react-native'; 
import LoginScreen from './screens/LoginScreen';
import Register from './screens/Register';
import DashboardScreen from './screens/DashboardScreen';
import AddEventScreen from './screens/AddEventScreen';
import EventDetailsScreen from './screens/EventDetailsScreen';
import { auth } from './firebase';

const Stack = createStackNavigator();

export default function App() {
  const [events, setEvents] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const addEvent = (event) => {
    setEvents((prevEvents) => [...prevEvents, { ...event, id: Date.now().toString() }]);
  };

  const handleLogout = (navigation) => {
    auth.signOut()
      .then(() => {
        setIsLoggedIn(false); 
        navigation.navigate('Login');
      })
      .catch((error) => {
        console.error('Error logging out: ', error);
      });
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? "Dashboard" : "Login"}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen
          name="Dashboard"
          children={(props) => <DashboardScreen {...props} events={events} />}
          options={({ navigation }) => ({
            headerRight: () => (
            <TouchableOpacity onPress={() => handleLogout(navigation)}>
              <Text style={{ marginRight: 10, color: 'red' }}>Logout</Text>
            </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="AddEvent"
          children={(props) => <AddEventScreen {...props} addEvent={addEvent} />}
        />
        <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
