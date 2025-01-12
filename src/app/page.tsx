'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { GoogleMap, Marker, useLoadScript, InfoWindow } from "@react-google-maps/api";
import PostForm from "@/components/PostForm";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 1.3521, // シンガポール中心
  lng: 103.8198,
};

// 日時フォーマット処理を関数化
const formatDate = (timestamp: string | null): string => {
  if (!timestamp) return "Unknown Date";
  return new Date(timestamp).toLocaleString("en-SG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Singapore",
  });
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

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  // 現在地の取得
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

  // Sightings データの取得
  useEffect(() => {
    const fetchSightings = async () => {
      const { data, error } = await supabase
        .from("sightings")
        .select("id, location, common_name, sci_name, timestamp");

      if (error) {
        console.error("目撃情報の取得に失敗しました: ", error.message);
      } else {
        setSightings(data || []);
      }
    };

    fetchSightings();
  }, []);

  // 現在地のピンの描画
  const renderCurrentLocationMarker = () => {
    if (!currentLocation) return null;

    return (
      <Marker
        position={currentLocation}
        draggable={true}
        onDragEnd={(event) => {
          if (event.latLng) {
            const latitude = event.latLng.lat();
            const longitude = event.latLng.lng();
            setLat(latitude.toString());
            setLng(longitude.toString());
            setCurrentLocation({ lat: latitude, lng: longitude });
          }
        }}
      />
    );
  };

  // Sightings のピンの描画
  const renderSightingsMarkers = () => {
    return sightings.map((sighting) => (
      <Marker
        key={sighting.id}
        position={sighting.location}
        onClick={() => setSelectedSighting(sighting.location)}
      >
        {selectedSighting?.lat === sighting.location.lat &&
          selectedSighting?.lng === sighting.location.lng && (
            <InfoWindow
              position={sighting.location}
              onCloseClick={() => setSelectedSighting(null)}
            >
              <div
                style={{
                  backgroundColor: "#fff",
                  padding: "10px",
                  borderRadius: "5px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                {sightings
                  .filter(
                    (s) =>
                      s.location.lat === sighting.location.lat &&
                      s.location.lng === sighting.location.lng
                  )
                  .map((s, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: "10px",
                        borderBottom:
                          index !== sightings.length - 1 ? "1px solid #ddd" : "none",
                        paddingBottom: "10px",
                      }}
                    >
                      <h4
                        style={{
                          margin: "0 0 5px 0",
                          fontWeight: "bold",
                          color: "#000",
                        }}
                      >
                        {s.common_name}
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontStyle: "italic",
                          color: "#555",
                        }}
                      >
                        {s.sci_name}
                      </p>
                      <p
                        style={{
                          margin: "5px 0 0 0",
                          fontSize: "12px",
                          color: "#666",
                        }}
                      >
                        {formatDate(s.timestamp)}
                      </p>
                    </div>
                  ))}
              </div>
            </InfoWindow>
          )}
      </Marker>
    ));
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={currentLocation || center}
        zoom={12}
      >
        {renderCurrentLocationMarker()}
        {renderSightingsMarkers()}
      </GoogleMap>

      <PostForm
        timestamp={timestamp}
        setTimestamp={setTimestamp}
        lat={lat}
        lng={lng}
        message={message}
        handleSubmit={(e, selectedOption) => {
          e.preventDefault();
          if (!selectedOption || !lat || !lng) {
            setMessage("すべての情報を入力してください。");
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
                setMessage(`投稿に失敗しました: ${error.message}`);
              } else {
                setMessage("投稿が成功しました！");
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
                console.error("現在地の取得に失敗しました: ", error);
                setMessage("現在地を取得できませんでした。");
              }
            );
          }
        }}
      />
    </div>
  );
}