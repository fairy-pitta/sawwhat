import React from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Sighting } from "@/types/sighting";
import formatDate from "@/utils/formatDate";

// カスタムアイコンの設定
const sightingIcon = new L.Icon({
  iconUrl: "/marker-icon-blue.png", // 通常アイコン
  iconRetinaUrl: "/marker-icon-2x-blue.png", // Retina対応アイコン
  shadowUrl: "/marker-shadow.png", // 影アイコン
  iconSize: [25, 41], // アイコンサイズ
  iconAnchor: [12, 41], // アイコンのアンカー位置
  popupAnchor: [1, -34], // ポップアップのアンカー位置
  shadowSize: [41, 41], // 影のサイズ
});

interface SightingsMarkersProps {
  sightings: Sighting[];
  selectedSighting: { lat: number; lng: number } | null;
  setSelectedSighting: React.Dispatch<
    React.SetStateAction<{ lat: number; lng: number } | null>
  >;
}

const SightingsMarkers: React.FC<SightingsMarkersProps> = ({
  sightings,
  selectedSighting,
  setSelectedSighting,
}) => {
  return (
    <>
      {sightings.map((sighting) => (
        <Marker
          key={sighting.id}
          position={[sighting.location.lat, sighting.location.lng]}
          icon={sightingIcon} // カスタムアイコンを設定
          eventHandlers={{
            click: () => setSelectedSighting(sighting.location),
          }}
        >
          {selectedSighting?.lat === sighting.location.lat &&
            selectedSighting?.lng === sighting.location.lng && (
              <Popup>
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {sightings
                    .filter(
                      (s) =>
                        s.location.lat === sighting.location.lat &&
                        s.location.lng === sighting.location.lng
                    )
                    .map((s) => (
                      <div
                        key={s.id}
                        style={{
                          marginBottom: "10px",
                          borderBottom: "1px solid #ddd",
                          paddingBottom: "10px",
                        }}
                      >
                        <h4 style={{ margin: "0 0 5px", fontWeight: "bold" }}>
                          {s.status === "not seen" ? "Not Seen" : "Seen"} on{" "}
                          {formatDate(s.timestamp)}
                        </h4>
                        <p style={{ margin: 0, fontStyle: "italic", color: "#555" }}>
                          {s.common_name} ({s.sci_name})
                        </p>
                      </div>
                    ))}
                </div>
              </Popup>
            )}
        </Marker>
      ))}
    </>
  );
};

export default SightingsMarkers;