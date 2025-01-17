import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

interface CurrentLocationMarkerProps {
  currentLocation: { lat: number; lng: number } | null;
  handleMarkerDragEnd: (event: L.LeafletEvent) => void;
}

const CurrentLocationMarker: React.FC<CurrentLocationMarkerProps> = ({
  currentLocation,
  handleMarkerDragEnd,
}) => {
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
      eventHandlers={{ dragend: handleMarkerDragEnd }}
    >
      <Popup>This is where you saw the bird!</Popup>
    </Marker>
  );
};

export default CurrentLocationMarker;