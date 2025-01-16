"use client";

import { useState, useEffect } from "react";
import L from "leaflet";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";

import PostForm from "@/components/PostForm";
import FilterSidebar from "@/components/FilterSidebar";
import ReloadButton from "@/components/ReloadButton";

// リロード用アイコン・現在地アイコン
import { FaSyncAlt, FaCrosshairs } from "react-icons/fa";

// ★ Map は動的インポートで ssr: false を指定
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
});

// 「YYYY-MM-DDTHH:mm」形式で返すシンガポール時間
const getSGNowForDateTimeLocal = (): string => {
  // 1. 現在のUTC時刻(ミリ秒)を取得
  const nowUtc = Date.now();

  // 今はUTC+8を足していない状態だが、ローカルタイムがシンガポールなら合致
  // 必要に応じてここで +8h するとより確実にSGTになる
  const sgNow = nowUtc;

  // 3. Date オブジェクトを生成
  const sgDate = new Date(sgNow);

  // 4. 秒とミリ秒をゼロにする
  sgDate.setSeconds(0);
  sgDate.setMilliseconds(0);

  // 5. "YYYY-MM-DDTHH:mm" 形式で返す
  const yyyy = sgDate.getFullYear();
  const MM = String(sgDate.getMonth() + 1).padStart(2, "0");
  const dd = String(sgDate.getDate()).padStart(2, "0");
  const hh = String(sgDate.getHours()).padStart(2, "0");
  const mm = String(sgDate.getMinutes()).padStart(2, "0");

  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
};

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
  // 初期値をシンガポールの現在日時に
  const [timestamp, setTimestamp] = useState(getSGNowForDateTimeLocal());
  console.log(timestamp, "page.tsx");

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
      status?: string;
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

  // ========== sightingsを取得する関数 ==========
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

  // 初回マウント時に現在地を取得 & sightingsを取得
  useEffect(() => {
    // 1) 現在地
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

    // 2) sightings
    fetchSightings();
  }, []);

  // フィルター適用
  const filteredSightings = filter
    ? sightings.filter(
        (s) =>
          s.common_name === filter.common_name &&
          s.sci_name === filter.sci_name
      )
    : sightings;

  // マーカーをドラッグ終了時に呼ばれる（Leafletのdragendイベント）
  const handleMarkerDragEnd = (event: L.LeafletEvent) => {
    const marker = event.target as L.Marker;
    const { lat: newLat, lng: newLng } = marker.getLatLng();

    setLat(newLat.toString());
    setLng(newLng.toString());
    setCurrentLocation({ lat: newLat, lng: newLng });
  };

  // ========== 現在地ボタンを押したときの処理 ==========
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
          console.error("Failed to retrieve current location:", error);
          setMessage("Could not get current location.");
        }
      );
    }
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

      {/* --- 右下 リロードボタン (FaSyncAlt) --- */}
      <ReloadButton fetchSightings={fetchSightings} />

      {/* --- 右下 現在地ボタン (FaCrosshairs) --- */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          zIndex: 9999,
          background: "white",
          borderRadius: "50%",
          padding: "8px",
          cursor: "pointer",
          boxShadow: "0px 2px 5px rgba(0,0,0,0.3)",
        }}
        onClick={handleGetCurrentLocation}
        title="Get current location"
      >
        <FaCrosshairs size={20} color="#007bff" />
      </div>

      {/* 投稿フォーム */}
      <PostForm
        timestamp={timestamp}
        setTimestamp={setTimestamp}
        lat={lat}
        lng={lng}
        message={message}
        handleSubmit={(e, selectedOption, status, timestampSG) => {
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
                timestamp: timestampSG, // 受け取った SGタイムをそのまま渡す
                status,
              },
            ])
            .then(({ error }) => {
              if (error) {
                setMessage(`Failed to submit: ${error.message}`);
              } else {
                setMessage("Submission successful!");
                // 送信成功後にリロード
                fetchSightings();
              }
            });

          // 5秒後にメッセージをリセット
          setTimeout(() => setMessage(""), 5000);
        }}
        handleGetCurrentLocation={handleGetCurrentLocation}
      />

      {/* フィルターサイドバー */}
      <FilterSidebar setFilter={setFilter} />
    </div>
  );
}