import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import CurrentLocationMarker from "./CurrentLocationMarker";
import SightingsMarkers from "./SightingsMarkers";
import ObservationsMarkers from "./ObservationsMarkers";
import { Sighting } from "@/types/sighting";

interface MapWrapperProps {
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

const MapWrapper: React.FC<MapWrapperProps> = ({
  mapContainerStyle,
  center,
  currentLocation,
  sightings,
  selectedSighting,
  setSelectedSighting,
  handleMarkerDragEnd,
}) => {
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={12} style={mapContainerStyle}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <CurrentLocationMarker
        currentLocation={currentLocation}
        handleMarkerDragEnd={handleMarkerDragEnd}
      />
      <SightingsMarkers
        sightings={sightings}
        selectedSighting={selectedSighting}
        setSelectedSighting={setSelectedSighting}
      />
      <ObservationsMarkers /> {/* 新しく追加 */}
    </MapContainer>
  );
};

export default MapWrapper;