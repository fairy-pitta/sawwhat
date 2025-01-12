import React from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import formatDate from "@/utils/formatDate";

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
  handleMarkerDragEnd: (event: google.maps.MapMouseEvent) => void;
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
        position={currentLocation}
        draggable={true}
        onDragEnd={handleMarkerDragEnd}
      />
    );
  };

  const renderSightingsMarkers = () => {
    return sightings.map((sighting) => (
        <Marker
        key={sighting.id}
        position={sighting.location}
        icon={{
            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png", 
            scaledSize: new google.maps.Size(32, 32), 
        }}
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

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={currentLocation || center}
      zoom={12}
    >
      {renderCurrentLocationMarker()}
      {renderSightingsMarkers()}
    </GoogleMap>
  );
};

export default Map;