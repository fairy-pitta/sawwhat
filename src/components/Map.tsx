"use client";

import React from "react";
import MapWrapper from "./MapWrapper";
import { Sighting } from "@/types/sighting";
import "leaflet/dist/leaflet.css";

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
  handleGetCurrentLocation: () => void;
}

const Map: React.FC<MapProps> = ({
  mapContainerStyle,
  center,
  currentLocation,
  sightings,
  selectedSighting,
  setSelectedSighting,
  handleMarkerDragEnd,
  handleGetCurrentLocation,
}) => {
  return (
    <div style={{ ...mapContainerStyle, height: "100vh", position: "relative" }}>
      <MapWrapper
        mapContainerStyle={mapContainerStyle}
        center={center}
        currentLocation={currentLocation}
        sightings={sightings}
        selectedSighting={selectedSighting}
        setSelectedSighting={setSelectedSighting}
        handleMarkerDragEnd={handleMarkerDragEnd}
      />
    </div>
  );
};

export default Map;