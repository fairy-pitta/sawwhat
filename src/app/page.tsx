'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useLoadScript } from "@react-google-maps/api";
import Map from "@/components/Map";
import PostForm from "@/components/PostForm";
import FilterSidebar from "@/components/FilterSidebar";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 1.3521, // Center of Singapore
  lng: 103.8198,
};

export default function HomePage() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [timestamp, setTimestamp] = useState(
    new Date().toISOString().slice(0, -1)
  );
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [message, setMessage] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [sightings, setSightings] = useState<
    {
      id: number;
      location: { lat: number; lng: number };
      common_name: string;
      sci_name: string;
      timestamp: string;
    }[]
  >([]);
  const [selectedSighting, setSelectedSighting] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [filter, setFilter] = useState<{
    common_name: string;
    sci_name: string;
  } | null>(null);

  // Fetch current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          setLat(latitude.toString());
          setLng(longitude.toString());
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Failed to retrieve location: ", error);
          setMessage("Location is unavailable.");
        }
      );
    }
  }, []);

  // Fetch sightings from the database
  useEffect(() => {
    const fetchSightings = async () => {
      const { data, error } = await supabase
        .from("sightings")
        .select("id, location, common_name, sci_name, timestamp");

      if (error) {
        console.error("Failed to fetch sightings: ", error.message);
      } else {
        setSightings(data || []);
      }
    };

    fetchSightings();
  }, []);

  // Filter sightings based on the selected filter
  const filteredSightings = filter
    ? sightings.filter(
        (s) => s.common_name === filter.common_name && s.sci_name === filter.sci_name
      )
    : sightings;

  if (loadError) {
    return <div>Failed to load Google Maps.</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      <Map
        mapContainerStyle={mapContainerStyle}
        center={center}
        currentLocation={currentLocation}
        sightings={filteredSightings}
        selectedSighting={selectedSighting}
        setSelectedSighting={setSelectedSighting}
        handleMarkerDragEnd={(event) => {
          if (event.latLng) {
            const latitude = event.latLng.lat();
            const longitude = event.latLng.lng();
            setLat(latitude.toString());
            setLng(longitude.toString());
            setCurrentLocation({ lat: latitude, lng: longitude });
          }
        }}
      />
      <PostForm
        timestamp={timestamp}
        setTimestamp={setTimestamp}
        lat={lat}
        lng={lng}
        message={message}
        handleSubmit={(e, selectedOption) => {
          e.preventDefault();
          if (!selectedOption || !lat || !lng) {
            setMessage("Please fill in all the required fields.");
            return;
          }

          const { common_name, sci_name, species_code } = selectedOption;

          supabase
            .from("sightings")
            .insert([
              {
                species_code,
                common_name,
                sci_name,
                location: { lat: parseFloat(lat), lng: parseFloat(lng) },
                timestamp,
              },
            ])
            .then(({ error }) => {
              if (error) {
                setMessage(`Failed to submit: ${error.message}`);
              } else {
                setMessage("Submission successful!");
              }
            });

          setTimeout(() => setMessage(""), 5000);
        }}
        handleGetCurrentLocation={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                setLat(latitude.toString());
                setLng(longitude.toString());
                setCurrentLocation({ lat: latitude, lng: longitude });
              },
              (error) => {
                console.error("Failed to retrieve current location: ", error);
                setMessage("Could not get current location.");
              }
            );
          }
        }}
      />
      <FilterSidebar setFilter={setFilter} />
    </div>
  );
}