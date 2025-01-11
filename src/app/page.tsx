'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { DefaultIcon } from '@/components/MapIcons';
import 'leaflet/dist/leaflet.css';

export default function HomePage() {
  const [species, setSpecies] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [message, setMessage] = useState('');

  // 現在地ピンの緯度経度を格納
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );

  // デバイスの位置情報を取得
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setLat(latitude.toString());
          setLng(longitude.toString());
          setCurrentLocation({ lat: latitude, lng: longitude }); // 現在地のピンを設定
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

  const handleMarkerDragEnd = (event: any) => {
    const { lat, lng } = event.target.getLatLng();
    setLat(lat.toString());
    setLng(lng.toString());
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      {/* 地図 */}
      <MapContainer
        center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [1.3521, 103.8198]} // 現在地に中心を設定
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {currentLocation && (
          <Marker
            position={[currentLocation.lat, currentLocation.lng]} // 現在地の位置
            icon={DefaultIcon}
            draggable={true}
            eventHandlers={{
              dragend: handleMarkerDragEnd,
            }}
          >
            <Popup>ドラッグして位置を調整できます</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* 投稿フォーム */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'white',
          padding: '10px',
          borderRadius: '8px',
          zIndex: 1000,
        }}
      >
        <h3>投稿フォーム</h3>
        <form>
          <input
            type="text"
            placeholder="鳥の名前 (species)"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="緯度 (latitude)"
            value={lat}
            readOnly
          />
          <input
            type="text"
            placeholder="経度 (longitude)"
            value={lng}
            readOnly
          />
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}