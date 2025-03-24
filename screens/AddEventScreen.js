import React, { useState, useEffect } from 'react';
import { View, Text, Button,TextInput, TouchableOpacity, StyleSheet,Image, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';
import { auth } from '../firebase';
import { db } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';

const AddEventScreen = ({ navigation, route }) => {
  const { refreshEvents } = route.params;
  const [facing, setFacing] = useState('back');
  const [cameraRef, setCameraRef] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [loading, setLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [eventDetails, setEventDetails] = useState({
    date: 'Not there',
    time: 'Not there',
    location: 'Not there',
  });
  const [editableDetails, setEditableDetails] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
  });

  useEffect(() => {
    if (permission === null) {
      requestPermission();
    }
  }, [permission]);

  const captureImage = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      setImageUri(photo.uri);
      await performOCR(photo.uri);
    }
  };

  const performOCR = async (uri) => {
    setLoading(true);
    const apiKey = '';
    const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    const base64Image = await uriToBase64(uri);

    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'DOCUMENT_TEXT_DETECTION',
              maxResults: 1,
            },
          ],
        },
      ],
    };

    try {
      const response = await axios.post(visionUrl, requestBody);
      const text = response.data.responses[0].fullTextAnnotation.text;
      setOcrText(text);
      extractEventDetails(text);
    } catch (error) {
      console.error('Error performing OCR:', error);
      setOcrText('Failed to extract text.');
    } finally {
      setLoading(false);
    }
  };

  const uriToBase64 = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise((resolve) => {
      reader.onloadend = () => {
        const base64Data = reader.result.split(',')[1];
        resolve(base64Data);
      };
    });
  };

  const extractEventDetails = (text) => {
    // Regular expressions to capture date, time, and location (including alternative labels)
    const nameRegex = /(Name|Event):\s*(.*)/i; // Captures text after "Name:" or "Event:"
    const dateRegex = /\b(\d{4})-(\d{2})-(\d{2})\b/g; // Date format matching
    const timeRegex = /\b(0?[1-9]|1[0-2]):([0-5]?[0-9])\s?(AM|PM|am|pm)?\b/g; // Time format matching like 10:30 AM or 6:00 PM
    const locationRegex = /(Location|Where|Address):\s*(.*)/i;

    // Extracting the details using regex
    const nameMatch = text.match(nameRegex);
    const dateMatches = [...text.matchAll(dateRegex)];
    const timeMatch = text.match(timeRegex);
    const locationMatch = text.match(locationRegex);

    // Update state with extracted values or "Not there" if not found
    const name = nameMatch && nameMatch[2] ? nameMatch[2].trim() : 'Not there';
    const date = dateMatches.length ? dateMatches[0][0] : 'Not there';
    const time = timeMatch && timeMatch[0] ? timeMatch[0].trim() : 'Not there';
    const location = locationMatch && locationMatch[2] ? locationMatch[2].trim() : 'Not there';

    setEventDetails({
      name: name,
      date: date.trim(),
      time: time.trim(),
      location: location.trim(),
    });

    setEditableDetails({
      name: name,
      date: date.trim(),
      time: time.trim(),
      location: location.trim(),
    });
  };

  const saveEventDetailsToFirebase = async () => {
    try {
      const userId = auth.currentUser?.uid;
      const eventRef = collection(db, 'events');
      await addDoc(eventRef, { ...editableDetails, userId });
      console.log('Event details saved to Firebase Firestore!');
      refreshEvents();
      navigation.goBack();
    } catch (error) {
      console.error('Error saving event details:', error);
    }
  };

  if (permission === null) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleSave = () => {
    if (editableDetails.name && editableDetails.date && editableDetails.time && editableDetails.location) {
      saveEventDetailsToFirebase();
    } else {
      Alert.alert('Please fill in all fields');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Event</Text>

      <CameraView style={styles.camera} facing={facing} ref={setCameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={captureImage}>
            <Text style={styles.captureButtonText}>Capture Image</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      {loading ? (
        <Text>Processing...</Text>
      ) : (
        <>
          <TextInput
            style={styles.input}
            value={editableDetails.name}
            onChangeText={(text) => setEditableDetails({ ...editableDetails, name: text })}
            placeholder="Enter event name"
          />
          <TextInput
            style={styles.input}
            value={editableDetails.date}
            onChangeText={(value) => setEditableDetails({ ...editableDetails, date: value })}
            placeholder="Enter date"
          />
          <TextInput
            style={styles.input}
            value={editableDetails.time}
            onChangeText={(value) => setEditableDetails({ ...editableDetails, time: value })}
            placeholder="Enter time"
          />
          <TextInput
            style={styles.input}
            value={editableDetails.location}
            onChangeText={(value) => setEditableDetails({ ...editableDetails, location: value })}
            placeholder="Enter location"
          />
        </>
      )}
      
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
    width: '100%',
    marginBottom: 10,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
    alignSelf: 'center',
    borderRadius: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    height: 50,
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
  buttonContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  captureButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AddEventScreen;
