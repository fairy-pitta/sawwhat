import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import formatDate from "../utils/formatDate";

interface MapProps {
  mapContainerStyle: React.CSSProperties;
  center: { lat: number; lng: number };
  currentLocation: { lat: number; lng: number } | null;
  sightings: {
    id: number;
    location: { lat: number; lng: number };
    common_name: string;
    sci_name: string;
    timestamp: string;
  }[];
  selectedSighting: { lat: number; lng: number } | null;
  setSelectedSighting: React.Dispatch<
    React.SetStateAction<{ lat: number; lng: number } | null>
  >;
  handleMarkerDragEnd: (event: L.DragEndEvent) => void;
}

const Map: React.FC<MapProps> = ({
  mapContainerStyle,
  center,
  currentLocation,
  sightings,
  selectedSighting,
  setSelectedSighting,
  handleMarkerDragEnd,
}) => {
  const renderCurrentLocationMarker = () => {
    if (!currentLocation) return null;

    return (
      <Marker
        position={[currentLocation.lat, currentLocation.lng]}
        draggable={true}
        eventHandlers={{
          dragend: (event) => handleMarkerDragEnd(event),
        }}
      >
        <Popup>Your current location</Popup>
      </Marker>
    );
  };

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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {renderCurrentLocationMarker()}
        {renderSightingsMarkers()}
      </MapContainer>
    </div>
  );
};

export default Map;