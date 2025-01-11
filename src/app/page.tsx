'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import MapSection from '@/components/MapSection';
import PostForm from '@/components/PostForm';
import { useLoadScript } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 1.3521, // シンガポール中心
  lng: 103.8198,
};

export default function HomePage() {
  const [species, setSpecies] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [message, setMessage] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Google Mapsの読み込み
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
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
          console.error('位置情報の取得に失敗しました: ', error);
          setMessage('位置情報が利用できません。');
        }
      );
    } else {
      setMessage('このブラウザでは位置情報がサポートされていません。');
    }
  }, []);

  // マーカーをドラッグした際の処理
  const handleMarkerDragEnd = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const latitude = event.latLng.lat();
      const longitude = event.latLng.lng();
      setLat(latitude.toString());
      setLng(longitude.toString());
      setCurrentLocation({ lat: latitude, lng: longitude });
    }
  };

  // 現在地に戻るボタン
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
          console.error('現在地の取得に失敗しました: ', error);
          setMessage('現在地を取得できませんでした。');
        }
      );
    }
  };

  // 投稿処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!species || !lat || !lng) {
      setMessage('鳥の名前、緯度、経度を入力してください。');
      return;
    }

    // Supabaseにデータを挿入
    const { error } = await supabase.from('sightings').insert([
      {
        species,
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        timestamp: new Date().toISOString(),
      },
    ]);

    if (error) {
      setMessage(`投稿に失敗しました: ${error.message}`);
    } else {
      setMessage('投稿が成功しました！');
      setSpecies('');
    }

    setTimeout(() => setMessage(''), 5000);
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      {/* 地図表示部分 */}
      <MapSection
        currentLocation={currentLocation}
        center={center}
        mapContainerStyle={mapContainerStyle}
        handleMarkerDragEnd={handleMarkerDragEnd}
      />

      {/* 投稿フォーム部分 */}
      <PostForm
        species={species}
        setSpecies={setSpecies}
        lat={lat}
        lng={lng}
        message={message}
        handleSubmit={handleSubmit}
        handleGetCurrentLocation={handleGetCurrentLocation}
      />
    </div>
  );
}