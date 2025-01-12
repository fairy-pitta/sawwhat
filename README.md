# **Bird Sighting Map App**

### **Overview**
This repository is for developing a web application that allows users to post, view, and share bird sighting information. The app is designed for bird enthusiasts, conservationists, and researchers, with a focus on bird sightings in Singapore. It features an interactive map to visualize real-time sighting data.

---

## **Features**

### **1. Bird Sighting Submission**
- **Search and Select Bird Names**:
  - Search and select bird common and scientific names from a database.
- **Add Timestamp and Location**:
  - Timestamp is auto-filled with the current time but can be manually edited.
  - Use your current location or drag a marker on the map to set the sighting location.
- **Submit Sighting Information**:
  - Fill in the required fields and click the button to save the sighting to the database.

### **2. Interactive Map**
- **Display Sighting Data**:
  - Submitted sightings appear as markers on the map.
  - Click on markers to view detailed information (bird name, timestamp, location) in a popup.
- **Current Location Marker**:
  - A dedicated marker shows your current location, which can be dragged to adjust.
- **Filter Pins by Species**:
  - A filter sidebar allows you to search by species name and display only those markers on the map.

### **3. Share Sighting Data**
- **Sharing Functionality**:
  - After posting, share sighting details through messaging apps or social media.
  - Shared links include the sighting location, bird name, and timestamp.

---

## **Technical Requirements**

### **Technologies Used**
- **Frontend**:
  - **React**, **React Google Maps API**
  - **TypeScript**: For type safety and improved development efficiency.
  - **CSS-in-JS**: For dynamic styling.
- **Backend**:
  - **Supabase**: For database management, API provision, and real-time data sync.
- **Map Features**:
  - **Google Maps API**: For interactive map functionality.

### **Requirements**
- A browser capable of accessing geolocation services (e.g., location access permissions).
- A modern browser is recommended.
- A valid Google Maps API key.

---
