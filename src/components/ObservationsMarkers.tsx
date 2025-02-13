import React, { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

// カスタムアイコン
const observationIcon = new L.Icon({
  iconUrl: "/marker-icon-green.png",
  iconRetinaUrl: "/marker-icon-2x-green.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Supabaseのデータ型
interface Observation {
  id: number;
  common_name: string;
  scientific_name: string;
  location_name: string;
  observation_date: string;
  count: string | null;
  latitude: string;
  longitude: string;
}

interface ObservationsMarkersProps {
  filter: {
    common_name?: string; // オプショナルにして未指定時のデフォルト処理を可能に
    sci_name?: string;
  };
}

const ObservationsMarkers: React.FC<ObservationsMarkersProps> = ({ filter }) => {
  const [observations, setObservations] = useState<Observation[]>([]);

  useEffect(() => {
    const fetchObservations = async () => {
      try {
        const response = await fetch("/api/observations");
        const data = await response.json();

        // フィルタが指定されている場合にデータを絞り込み
        const filteredData = data.filter((observation: Observation) => {
          if (!filter.common_name || !filter.sci_name) return true; // フィルタ未設定なら全件表示
          return (
            observation.scientific_name === filter.sci_name
          );
        });

        setObservations(filteredData);
      } catch (error) {
        console.error("Failed to fetch observations:", error);
      }
    };

    fetchObservations();
  }, [filter]);

  // 同じ緯度・経度の観察データをグループ化
  const groupedObservations = observations.reduce((acc, observation) => {
    const key = `${observation.latitude},${observation.longitude}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(observation);
    return acc;
  }, {} as Record<string, Observation[]>);

  return (
    <>
      {Object.entries(groupedObservations).map(([key, observationsAtLocation]) => {
        const [lat, lng] = key.split(",").map(parseFloat);

        return (
          <Marker key={key} position={[lat, lng]} icon={observationIcon}>
            <Popup>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                <h4>Observations</h4>
                {observationsAtLocation.map((observation) => (
                  <div
                    key={observation.id}
                    style={{
                      marginBottom: "10px",
                      borderBottom: "1px solid #ddd",
                      paddingBottom: "10px",
                    }}
                  >
                    <strong>{observation.common_name}</strong> (
                    <em>{observation.scientific_name}</em>)<br />
                    <strong>Location:</strong> {observation.location_name}<br />
                    <strong>Date:</strong>{" "}
                    {new Date(observation.observation_date).toLocaleString()}<br />
                    <strong>Count:</strong> {observation.count || "Unknown"}
                  </div>
                ))}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default ObservationsMarkers;