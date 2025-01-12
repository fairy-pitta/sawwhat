'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import PostForm from "@/components/PostForm";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 1.3521, // シンガポール中心
  lng: 103.8198,
};

export default function HomePage() {
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

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

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
          console.error("位置情報の取得に失敗しました: ", error);
          setMessage("位置情報が利用できません。");
        }
      );
    } else {
      setMessage("このブラウザでは位置情報がサポートされていません。");
    }
  }, []);

  const handleMarkerDragEnd = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const latitude = event.latLng.lat();
      const longitude = event.latLng.lng();
      setLat(latitude.toString());
      setLng(longitude.toString());
      setCurrentLocation({ lat: latitude, lng: longitude });
    }
  };

  const handleGetCurrentLocation = () => {
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
          console.error("現在地の取得に失敗しました: ", error);
          setMessage("現在地を取得できませんでした。");
        }
      );
    }
  };

  const handleSubmit = async (
    e: React.FormEvent,
    selectedOption: { common_name: string; sci_name: string; species_code: string }
  ) => {
    e.preventDefault();

    if (!selectedOption || !lat || !lng) {
      setMessage("すべての情報を入力してください。");
      return;
    }

    const { common_name, sci_name, species_code } = selectedOption;

    const { error } = await supabase.from("sightings").insert([
      {
        species_code,
        common_name,
        sci_name,
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        timestamp,
      },
    ]);

    if (error) {
      setMessage(`投稿に失敗しました: ${error.message}`);
    } else {
      setMessage("投稿が成功しました！");
    }

    setTimeout(() => setMessage(""), 5000);
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      {/* Google Maps */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={currentLocation || center}
        zoom={12}
      >
        {currentLocation && (
          <Marker
            position={currentLocation}
            draggable={true}
            onDragEnd={handleMarkerDragEnd}
          />
        )}
      </GoogleMap>

      {/* 投稿フォーム */}
      <PostForm
        timestamp={timestamp}
        setTimestamp={setTimestamp}
        lat={lat}
        lng={lng}
        message={message}
        handleSubmit={handleSubmit}
        handleGetCurrentLocation={handleGetCurrentLocation}
      />
    </div>
  );
}