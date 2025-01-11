'use client';

import Map from '@/components/Map'; // 地図コンポーネントをインポート
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function HomePage() {
  const [species, setSpecies] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [message, setMessage] = useState('');

  // デバイスの位置情報を取得
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude.toString());
          setLng(position.coords.longitude.toString());
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('sightings').insert([
      {
        species,
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        timestamp: new Date().toISOString(),
      },
    ]);

    if (error) {
      setMessage('投稿に失敗しました：' + error.message);
    } else {
      setMessage('投稿が成功しました！');
      setSpecies('');
    }
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      {/* 地図 */}
      <Map />

      {/* 投稿フォーム */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'white', padding: '10px', borderRadius: '8px', zIndex: 1000 }}>
        <h3>投稿フォーム</h3>
        <form onSubmit={handleSubmit}>
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
            onChange={(e) => setLat(e.target.value)}
            readOnly
          />
          <input
            type="text"
            placeholder="経度 (longitude)"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            readOnly
          />
          <button type="submit">投稿</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}