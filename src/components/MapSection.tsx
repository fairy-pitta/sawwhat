import React from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

interface MapSectionProps {
  currentLocation: { lat: number; lng: number } | null;
  center: { lat: number; lng: number };
  mapContainerStyle: React.CSSProperties;
  handleMarkerDragEnd: (event: google.maps.MapMouseEvent) => void;
}

const MapSection: React.FC<MapSectionProps> = ({
  currentLocation,
  center,
  mapContainerStyle,
  handleMarkerDragEnd,
}) => {
  return (
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
  );
};

export default MapSection;