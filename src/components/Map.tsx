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
  status: string; // "sighted" or "unsighted"
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
}

// Set default icon for Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "/marker-icon-green.png", // Default green marker icon
  iconRetinaUrl: "/marker-icon-2x-green.png", // Retina version (optional)
  shadowUrl: "/marker-shadow.png", // Shadow image
});

const Map: React.FC<MapProps> = ({
  mapContainerStyle,
  center,
  currentLocation,
  sightings,
  selectedSighting,
  setSelectedSighting,
  handleMarkerDragEnd,
}) => {
  // --- 現在地マーカーを描画 ---
  const renderCurrentLocationMarker = () => {
    if (!currentLocation) return null;

    // Custom red marker icon for current location
    const currentLocationIcon = new L.Icon({
      iconUrl: "/marker-icon-red.png", // Path to red marker icon
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
          dragend: (event) => handleMarkerDragEnd(event),
        }}
      >
        <Popup>Your current location</Popup>
      </Marker>
    );
  };

  // --- 観察記録マーカーを描画 ---
  const renderSightingsMarkers = () => {
    return sightings.map((sighting) => (
      <Marker
        key={sighting.id}
        position={[sighting.location.lat, sighting.location.lng]}
        eventHandlers={{
          click: () => setSelectedSighting(sighting.location),
        }}
      >
        {/* マーカーが選択状態の場合のみPopupを表示 */}
        {selectedSighting?.lat === sighting.location.lat &&
          selectedSighting?.lng === sighting.location.lng && (
            <Popup>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {/** 同じ場所のsightingをまとめて表示（複数ある場合） */}
                {sightings
                  .filter(
                    (s) =>
                      s.location.lat === sighting.location.lat &&
                      s.location.lng === sighting.location.lng
                  )
                  .map((s, index, arr) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: "10px",
                        borderBottom:
                          index !== arr.length - 1 ? "1px solid #ddd" : "none",
                        paddingBottom: "10px",
                      }}
                    >
                      {/* ステータス ＋ 日時を強調表示 */}
                      <h4
                        style={{
                          margin: "0 0 5px 0",
                          fontWeight: "bold",
                          color: "#000",
                        }}
                      >
                        {/* status が "unsighted" なら "Unsighted on ...", それ以外なら "Sighted on ..." */}
                        {s.status === "unsighted" ? "Unsighted" : "Sighted"} on{" "}
                        {formatDate(s.timestamp)}
                      </h4>

                      {/* 種名（和名 + 学名） */}
                      <p
                        style={{
                          margin: 0,
                          fontStyle: "italic",
                          color: "#555",
                        }}
                      >
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
    <div style={{ ...mapContainerStyle, height: "100vh" }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={12}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">
            OpenStreetMap
          </a> contributors'
        />

        {/* 現在地の赤マーカー */}
        {renderCurrentLocationMarker()}

        {/* 観察記録のマーカーたち */}
        {renderSightingsMarkers()}
      </MapContainer>
    </div>
  );
};

export default Map;