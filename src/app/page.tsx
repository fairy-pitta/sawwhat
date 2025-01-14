"use client";

import { useState, useEffect } from "react";
import L from "leaflet";
import { supabase } from "@/lib/supabaseClient";

// Leafletを使ったカスタムコンポーネント
import Map from "@/components/Map";         // <-- Leaflet版Mapコンポーネントを使う
import PostForm from "@/components/PostForm";
import FilterSidebar from "@/components/FilterSidebar";

// 地図のスタイル
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
  // 投稿フォーム用の日時
  const [timestamp, setTimestamp] = useState(
    new Date().toISOString().slice(0, -1)
  );

  // フォーム送信用の緯度・経度（文字列）
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  // 成功・エラーメッセージを表示するための状態
  const [message, setMessage] = useState("");

  // 地図コンポーネント用の現在地（オブジェクト）。ドラッグなどで更新される
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // 取得した観察記録リスト
  const [sightings, setSightings] = useState<
    {
      id: number;
      location: { lat: number; lng: number };
      common_name: string;
      sci_name: string;
      timestamp: string;
    }[]
  >([]);

  // クリックされた観察記録の位置（マーカー選択用）
  const [selectedSighting, setSelectedSighting] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // 種名によるフィルターの状態（例：FilterSidebarで選択された鳥の和名・学名）
  const [filter, setFilter] = useState<{
    common_name: string;
    sci_name: string;
  } | null>(null);

  /**
   * 1. ページマウント時にブラウザのジオロケーションで現在地を取得
   */
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

  /**
   * 2. Supabaseから`sightings`テーブルの観察記録を取得
   */
  useEffect(() => {
    const fetchSightings = async () => {
      const { data, error } = await supabase
        .from("sightings")
        .select("id, location, common_name, sci_name, timestamp");

      if (error) {
        console.error("Failed to fetch sightings:", error.message);
      } else {
        setSightings(data || []);
      }
    };

    fetchSightings();
  }, []);

  /**
   * 3. フィルターで絞り込み（和名・学名が完全一致する観察のみ表示）
   */
  const filteredSightings = filter
    ? sightings.filter(
        (s) =>
          s.common_name === filter.common_name && s.sci_name === filter.sci_name
      )
    : sightings;

  /**
   * 4. マーカーをドラッグし終わった後に呼ばれる関数
   *    Leafletの`dragend`イベントから座標を取得する
   */
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
      {/* LeafletベースのMapコンポーネント */}
      <Map
        mapContainerStyle={mapContainerStyle}
        center={center}
        currentLocation={currentLocation}
        sightings={filteredSightings}
        selectedSighting={selectedSighting}
        setSelectedSighting={setSelectedSighting}
        // 親コンポーネントで定義したドラッグ完了イベントを渡す
        handleMarkerDragEnd={handleMarkerDragEnd}
      />

      {/* 投稿フォーム */}
      <PostForm
        timestamp={timestamp}
        setTimestamp={setTimestamp}
        lat={lat}
        lng={lng}
        message={message}
        // Postボタン押下時の処理
        handleSubmit={(e, selectedOption) => {
          e.preventDefault();
          if (!selectedOption || !lat || !lng) {
            setMessage("Please fill in all the required fields.");
            return;
          }

          const { common_name, sci_name, species_code } = selectedOption;

          // Supabaseへのデータ挿入
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

          // 5秒後にメッセージをクリア
          setTimeout(() => setMessage(""), 5000);
        }}
        // 現在地ボタン押下時の処理
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

      {/* フィルター用サイドバー */}
      <FilterSidebar setFilter={setFilter} />
    </div>
  );
}