import React from 'react';
import { Marker } from 'react-leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import L from 'leaflet';

interface CustomMarkerProps {
  position: [number, number];
  children?: React.ReactNode;
  draggable?: boolean;
  eventHandlers?: L.LeafletEventHandlerFnMap;
}

const CustomMarker: React.FC<CustomMarkerProps> = ({
  position,
  children,
  draggable = false,
  eventHandlers,
}) => {
  const icon = L.divIcon({
    html: `<div style="color: #4a90e2; font-size: 24px;">
            <i class="fa-solid fa-location-dot"></i>
          </div>`,
    className: 'custom-marker-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });

  return (
    <Marker
      position={position}
      icon={icon}
      draggable={draggable}
      eventHandlers={eventHandlers}
    >
      {children}
    </Marker>
  );
};

export default CustomMarker;