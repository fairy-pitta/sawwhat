'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

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

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
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
          console.error('位置情報の取得に失敗しました: ', error);
          setMessage('位置情報が利用できません。');
        }
      );
    } else {
      setMessage('このブラウザでは位置情報がサポートされていません。');
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
          console.error('現在地の取得に失敗しました: ', error);
          setMessage('現在地を取得できませんでした。');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!species || !lat || !lng) {
      setMessage('鳥の名前、緯度、経度を入力してください。');
      return;
    }

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
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="鳥の名前 (species)"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            required
            style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="緯度 (latitude)"
            value={lat}
            readOnly
            style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="経度 (longitude)"
            value={lng}
            readOnly
            style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
          />
          <button
            type="submit"
            style={{
              padding: '10px',
              backgroundColor: '#007BFF',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px',
            }}
          >
            投稿
          </button>
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            style={{
              padding: '10px',
              backgroundColor: '#28A745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            現在地に移動
          </button>
        </form>
        {message && (
          <p
            style={{
              color: message.includes('成功') ? 'green' : 'red',
              marginTop: '10px',
              fontWeight: 'bold',
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}