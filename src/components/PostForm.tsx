"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FaCrosshairs } from "react-icons/fa"; // 船の舵アイコン

// 鳥の種情報
interface BirdOption {
  common_name: string;
  sci_name: string;
  species_code: string;
}

// 観察ステータス
type SightingStatus = "seen" | "not seen";

interface PostFormProps {
  timestamp: string;
  setTimestamp: (value: string) => void;
  lat: string;
  lng: string;
  message: string;
  handleSubmit: (
    e: React.FormEvent,
    selectedOption: BirdOption,
    status: SightingStatus,
    timestampSG: string
  ) => void;
  handleGetCurrentLocation: () => void; // ← この関数を呼び出す
}

const PostForm: React.FC<PostFormProps> = ({
  timestamp,
  setTimestamp,
  lat,
  lng,
  message,
  handleSubmit,
  handleGetCurrentLocation,
}) => {
  const [speciesOptions, setSpeciesOptions] = useState<BirdOption[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState<BirdOption | null>(null);
  const [status, setStatus] = useState<SightingStatus>("seen");

  // 初回、鳥の種類リストを取得
  useEffect(() => {
    const fetchSpecies = async () => {
      const { data, error } = await supabase
        .from("species")
        .select("common_name, sci_name, species_code");

      if (error) {
        console.error("Failed to fetch bird data:", error.message);
      } else {
        setSpeciesOptions(data || []);
      }
    };
    fetchSpecies();
  }, []);

  // 名前のフィルタリング
  const filteredOptions =
    searchTerm.length >= 1
      ? speciesOptions.filter((option) =>
          option.common_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  // 送信
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption) return;
    handleSubmit(e, selectedOption, status, timestamp);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        background: "white",
        padding: "10px",
        borderRadius: "8px",
        zIndex: 1000,
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        color: "#333",
      }}
    >
      <h3 style={{ fontWeight: "bold", marginBottom: "10px" }}>
        Report Your Sighting
      </h3>
      <form onSubmit={onSubmit}>
        {/* 鳥の種名検索 */}
        <input
          type="text"
          placeholder="Enter bird name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          required
          style={{
            marginBottom: "10px",
            padding: "10px",
            width: "100%",
            border: "1px solid #aaa",
            borderRadius: "5px",
          }}
        />

        {/* 候補一覧 */}
        {filteredOptions.length > 0 && (
          <ul
            style={{
              maxHeight: "150px",
              overflowY: "auto",
              marginBottom: "10px",
              padding: "5px",
              border: "1px solid #aaa",
              borderRadius: "5px",
              backgroundColor: "#f8f9fa",
            }}
          >
            {filteredOptions.map((option) => (
              <li
                key={option.species_code}
                onClick={() => {
                  setSearchTerm(option.common_name);
                  setSelectedOption(option);
                }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px",
                  cursor: "pointer",
                  backgroundColor:
                    selectedOption?.species_code === option.species_code
                      ? "#007BFF"
                      : "white",
                  color:
                    selectedOption?.species_code === option.species_code
                      ? "white"
                      : "#333",
                  borderRadius: "3px",
                }}
              >
                <span>
                  {option.common_name}{" "}
                  <span
                    style={{
                      fontStyle: "italic",
                      color:
                        selectedOption?.species_code === option.species_code
                          ? "white"
                          : "#333",
                    }}
                  >
                    ({option.sci_name})
                  </span>
                </span>
                {selectedOption?.species_code === option.species_code && (
                  <span
                    style={{ marginLeft: "10px", color: "white", fontWeight: "bold" }}
                  >
                    ✔
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* 観察ステータス */}
        <div style={{ marginBottom: "10px" }}>
          <label style={{ marginRight: "10px" }}>
            <input
              type="radio"
              value="seen"
              checked={status === "seen"}
              onChange={() => setStatus("seen")}
              style={{ marginRight: "5px" }}
            />
            Seen
          </label>
          <label>
            <input
              type="radio"
              value="not seen"
              checked={status === "not seen"}
              onChange={() => setStatus("not seen")}
              style={{ marginRight: "5px" }}
            />
            Not Seen
          </label>
        </div>

        {/* 日時 */}
        <input
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          required
          style={{
            marginBottom: "10px",
            padding: "10px",
            width: "100%",
            border: "1px solid #aaa",
            borderRadius: "5px",
          }}
        />

        {/* 下段のボタン類 */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {/* 現在地ボタンを舵アイコンだけにする */}
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <FaCrosshairs size={24} color="#007bff" />
          </button>

          {/* Submit */}
          <button
            type="submit"
            style={{
              padding: "10px",
              backgroundColor: "#0056b3",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Post
          </button>
        </div>
      </form>

      {/* メッセージ表示 */}
      {message && (
        <p
          style={{
            color: message.includes("success") ? "green" : "red",
            marginTop: "10px",
            fontWeight: "bold",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default PostForm;