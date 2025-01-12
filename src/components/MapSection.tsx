import React, { useEffect, useState } from "react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import { AdvancedMarkerElement } from "@react-google-maps/api";

interface MapSectionProps {
  mapContainerStyle: React.CSSProperties;
  center: { lat: number; lng: number };
}

const MapSection: React.FC<MapSectionProps> = ({ mapContainerStyle, center }) => {
  const [sightings, setSightings] = useState<
    { location: { lat: number; lng: number }; common_name: string; sci_name: string; species_code: string }[]
  >([]);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    const fetchSightings = async () => {
      try {
        const response = await fetch("/api/sighting");
        const data = await response.json();
        setSightings(data);
      } catch (error) {
        console.error("データ取得エラー:", error);
      }
    };

    fetchSightings();
  }, []);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={12}>
      {sightings.map((sighting, index) => (
        <AdvancedMarkerElement
          key={index}
          position={{
            lat: sighting.location.lat,
            lng: sighting.location.lng,
          }}
          title={`${sighting.common_name} (${sighting.sci_name || "N/A"})`}
        />
      ))}
    </GoogleMap>
  );
};

export default MapSection;