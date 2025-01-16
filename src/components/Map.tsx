"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import formatDate from "../utils/formatDate";


interface Sighting {
  id: number;
  location: { lat: number; lng: number };
  common_name: string;
  sci_name: string;
  timestamp: string;
  status: string;
}

interface MapProps {
  mapContainerStyle: React.CSSProperties;
  center: { lat: number; lng: number };
  currentLocation: { lat: number; lng: number } | null;
  sightings: Sighting[];
  selectedSighting: { lat: number; lng: number } | null;
  setSelectedSighting: React.Dispatch<
    React.SetStateAction<{ lat: number; lng: number } | null>
  >;
  handleMarkerDragEnd: (event: L.LeafletEvent) => void;

  // ★ 追加: 現在地を取得する関数をMapコンポーネントでも使えるように受け取る
  handleGetCurrentLocation: () => void;
}

// Leaflet デフォルトアイコンの設定
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "/marker-icon-green.png",
  iconRetinaUrl: "/marker-icon-2x-green.png",
  shadowUrl: "/marker-shadow.png",
});

const Map: React.FC<MapProps> = ({
  mapContainerStyle,
  center,
  currentLocation,
  sightings,
  selectedSighting,
  setSelectedSighting,
  handleMarkerDragEnd,
  // ★ 追加
  handleGetCurrentLocation,
}) => {
  // ------------------------------------
  // 現在地マーカー
  // ------------------------------------
  const renderCurrentLocationMarker = () => {
    if (!currentLocation) return null;

    const currentLocationIcon = new L.Icon({
      iconUrl: "/marker-icon-red.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    return (
      <Marker
        position={[currentLocation.lat, currentLocation.lng]}
        icon={currentLocationIcon}
        draggable={true}
        zIndexOffset={1000}
        eventHandlers={{
          dragend: handleMarkerDragEnd,
        }}
      >
        <Popup>Your current location</Popup>
      </Marker>
    );
  };

  // ------------------------------------
  // 観察記録マーカー
  // ------------------------------------
  const renderSightingsMarkers = () => {
    return sightings.map((sighting) => (
      <Marker
        key={sighting.id}
        position={[sighting.location.lat, sighting.location.lng]}
        eventHandlers={{
          click: () => setSelectedSighting(sighting.location),
        }}
      >
        {selectedSighting?.lat === sighting.location.lat &&
          selectedSighting?.lng === sighting.location.lng && (
            <Popup>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {/* 同じ緯度経度をもつSightingをまとめて表示 */}
                {sightings
                  .filter(
                    (s) =>
                      s.location.lat === sighting.location.lat &&
                      s.location.lng === sighting.location.lng
                  )
                  .map((s) => (
                    <div
                      key={s.id}
                      style={{
                        marginBottom: "10px",
                        borderBottom: "1px solid #ddd",
                        paddingBottom: "10px",
                      }}
                    >
                      {/* 状態 + 日時 */}
                      <h4 style={{ margin: "0 0 5px", fontWeight: "bold" }}>
                        {s.status === "not seen" ? "Not Seen" : "Seen"} on{" "}
                        {formatDate(s.timestamp)}
                      </h4>
                      {/* 名前 */}
                      <p style={{ margin: 0, fontStyle: "italic", color: "#555" }}>
                        {s.common_name} ({s.sci_name})
                      </p>
                    </div>
                  ))}
              </div>
            </Popup>
          )}
      </Marker>
    ));
  };

  return (
    <div style={{ ...mapContainerStyle, height: "100vh", position: "relative" }}>

      <MapContainer center={[center.lat, center.lng]} zoom={12} style={{ width: "100%", height: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">
            OpenStreetMap
          </a> contributors'
        />

        {renderCurrentLocationMarker()}
        {renderSightingsMarkers()}
      </MapContainer>
    </div>
  );
};

export default Map;