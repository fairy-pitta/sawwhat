"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

// 鳥の種情報
interface BirdOption {
  common_name: string;
  sci_name: string;
  species_code: string;
}

// 観察ステータス
type SightingStatus = "sighted" | "unsighted";

interface PostFormProps {
  /**
   * シンガポール時間 (YYYY-MM-DDTHH:mm) 形式
   */
  timestamp: string;
  setTimestamp: (value: string) => void;
  lat: string;
  lng: string;
  message: string;
  /**
   * 第4引数としてSGタイム (YYYY-MM-DDTHH:mm) をそのまま受け取り、
   * Supabase へ保存する想定
   */
  handleSubmit: (
    e: React.FormEvent,
    selectedOption: BirdOption,
    status: SightingStatus,
    timestampSG: string
  ) => void;
  handleGetCurrentLocation: () => void;
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
  const [status, setStatus] = useState<SightingStatus>("sighted");

  console.log("timestamp", timestamp)

  // Supabase から鳥の種類リストを取得
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

  // フォーム送信
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption) return;

    // SGタイムをそのまま handleSubmit に渡す
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
          placeholder="Enter bird name (e.g., Japanese White-eye)"
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
                    style={{
                      marginLeft: "10px",
                      color: "white",
                      fontWeight: "bold",
                    }}
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
              value="sighted"
              checked={status === "sighted"}
              onChange={() => setStatus("sighted")}
              style={{ marginRight: "5px" }}
            />
            Sighted
          </label>
          <label>
            <input
              type="radio"
              value="unsighted"
              checked={status === "unsighted"}
              onChange={() => setStatus("unsighted")}
              style={{ marginRight: "5px" }}
            />
            Unsighted
          </label>
        </div>

        {/* 日時: SGタイム (YYYY-MM-DDTHH:mm) */}
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

        {/* 現在地 / Post */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            style={{
              padding: "10px",
              backgroundColor: "#218838",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Current Location
          </button>
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