import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import CustomMarker from "./CustomMarker"; // CustomMarkerを活用
import "leaflet/dist/leaflet.css";

interface MapWithDraggableMarkerProps {
  initialLat: number;
  initialLng: number;
  onLocationChange: (lat: number, lng: number) => void;
}

const MapWithDraggableMarker: React.FC<MapWithDraggableMarkerProps> = ({
  initialLat,
  initialLng,
  onLocationChange,
}) => {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);

  const handleMarkerDragEnd = (event: any) => {
    const marker = event.target;
    const newLat = marker.getLatLng().lat;
    const newLng = marker.getLatLng().lng;
    setPosition([newLat, newLng]);
    onLocationChange(newLat, newLng); // 親コンポーネントに通知
  };

  return (
    <MapContainer center={position} zoom={13} style={{ height: "300px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <CustomMarker
        position={position}
        draggable={true}
        eventHandlers={{
          dragend: handleMarkerDragEnd,
        }}
      />
    </MapContainer>
  );
};

export default MapWithDraggableMarker;