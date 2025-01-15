"use client";

import { useState, useEffect } from "react";
import L from "leaflet";
import { supabase } from "@/lib/supabaseClient";

// Leafletベースのコンポーネント
import Map from "@/components/Map";
import PostForm from "@/components/PostForm";
import FilterSidebar from "@/components/FilterSidebar";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

// シンガポール付近を初期中心に
const center = {
  lat: 1.3521,
  lng: 103.8198,
};

export default function HomePage() {
  const [timestamp, setTimestamp] = useState(
    new Date().toISOString().slice(0, -1)
  );

  // フォーム送信用の緯度・経度
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [message, setMessage] = useState("");

  // 地図コンポーネント用に保持する現在地
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // 観察記録一覧
  const [sightings, setSightings] = useState<
    {
      id: number;
      location: { lat: number; lng: number };
      common_name: string;
      sci_name: string;
      timestamp: string;
      // statusがある場合はここに追加してもよい
    }[]
  >([]);

  // 選択中の観察記録
  const [selectedSighting, setSelectedSighting] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // フィルター（和名・学名）
  const [filter, setFilter] = useState<{
    common_name: string;
    sci_name: string;
  } | null>(null);

  // 初回マウント時に現在地を取得
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
          console.error("Failed to retrieve location:", error);
          setMessage("Location is unavailable.");
        }
      );
    }
  }, []);

  // Supabaseから既存のsightingsを取得
  useEffect(() => {
    const fetchSightings = async () => {
      const { data, error } = await supabase
        .from("sightings")
        .select("id, location, common_name, sci_name, timestamp, status");

      if (error) {
        console.error("Failed to fetch sightings:", error.message);
      } else {
        setSightings(data || []);
      }
    };

    fetchSightings();
  }, []);

  // フィルター適用
  const filteredSightings = filter
    ? sightings.filter(
        (s) =>
          s.common_name === filter.common_name && s.sci_name === filter.sci_name
      )
    : sightings;

  // マーカーをドラッグ終了時に呼ばれる（Leafletのdragendイベント）
  const handleMarkerDragEnd = (event: L.LeafletEvent) => {
    const marker = event.target as L.Marker;
    const { lat: newLat, lng: newLng } = marker.getLatLng();

    setLat(newLat.toString());
    setLng(newLng.toString());
    setCurrentLocation({ lat: newLat, lng: newLng });
    console.log("Marker dragged to:", newLat, newLng);
  };

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      {/* Leafletの地図表示 */}
      <Map
        mapContainerStyle={mapContainerStyle}
        center={center}
        currentLocation={currentLocation}
        sightings={filteredSightings}
        selectedSighting={selectedSighting}
        setSelectedSighting={setSelectedSighting}
        handleMarkerDragEnd={handleMarkerDragEnd}
      />

      {/* 投稿フォーム */}
      <PostForm
        timestamp={timestamp}
        setTimestamp={setTimestamp}
        lat={lat}
        lng={lng}
        message={message}
        // ← statusが追加されたので、第3引数として受け取る
        handleSubmit={(e, selectedOption, status) => {
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
                status, // ← ここでstatusも挿入！
              },
            ])
            .then(({ error }) => {
              if (error) {
                setMessage(`Failed to submit: ${error.message}`);
              } else {
                setMessage("Submission successful!");
              }
            });

          // 5秒後にメッセージをリセット
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
                console.error("Failed to retrieve current location:", error);
                setMessage("Could not get current location.");
              }
            );
          }
        }}
      />

      {/* フィルターサイドバー */}
      <FilterSidebar setFilter={setFilter} />
    </div>
  );
}