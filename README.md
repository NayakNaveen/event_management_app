# Event Planner App

## Overview

The **Event Planner App** allows users to plan and manage events efficiently. With this app, users can:
Register and log in to their accounts.
Capture event details using the camera, which are processed with Optical Character Recognition (OCR).
Save event details (name, date, time, location) to Firebase.
Add events to the device's calendar and set reminders.
View event details and location directly in the app.

## Features

**User Authentication**: Users can sign up, log in, and manage their accounts using Firebase Authentication.
**Camera and OCR**: Capture event details via the camera, and automatically extract event information using Google Cloud Vision OCR.
**Event Management**: View, add, and save events with details such as name, date, time, and location.
**Calendar Integration**: Add events to the device's calendar with reminders set 10 minutes before the event starts.
**Location Mapping**: View event locations on Google Maps.

## Technologies Used

**React Native**: Framework for building cross-platform mobile apps.
**Firebase**: Backend for user authentication and storing event data.
**Expo Camera**: Used for capturing event images.
**Google Cloud Vision API**: For OCR (Optical Character Recognition) to extract text from captured images.
**Expo Calendar**: Allows adding events to the device's calendar.
**Expo Notifications**: Schedule reminders for events.
