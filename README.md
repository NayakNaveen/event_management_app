# Event Planner App

## Overview

The **Event Planner App** allows users to plan and manage events efficiently. With this app, users can:
1. Register and log in to their accounts.
2. Capture event details using the camera, which are processed with Optical Character Recognition (OCR).
3. Save event details (name, date, time, location) to Firebase.
4. Add events to the device's calendar and set reminders.
5. View event details and location directly in the app.

## Features

1. **User Authentication**: Users can sign up, log in, and manage their accounts using Firebase Authentication.
2. **Camera and OCR**: Capture event details via the camera, and automatically extract event information using Google Cloud Vision OCR.
3. **Event Management**: View, add, and save events with details such as name, date, time, and location.
4. **Calendar Integration**: Add events to the device's calendar with reminders set 10 minutes before the event starts.
5. **Location Mapping**: View event locations on Google Maps.

## Technologies Used

1. **React Native**: Framework for building cross-platform mobile apps.
2. **Firebase**: Backend for user authentication and storing event data.
3. **Expo Camera**: Used for capturing event images.
4. **Google Cloud Vision API**: For OCR (Optical Character Recognition) to extract text from captured images.
5. **Expo Calendar**: Allows adding events to the device's calendar.
6. **Expo Notifications**: Schedule reminders for events.
