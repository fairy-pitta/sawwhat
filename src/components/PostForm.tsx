"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

/** 
 * 現在のローカル時刻を取得し、秒・ミリ秒を除外した
 * "YYYY-MM-DDTHH:mm" 形式の文字列を返す
 */
function getNowWithoutSeconds(): string {
  const now = new Date();
  now.setSeconds(0);
  now.setMilliseconds(0);
  return now.toISOString().slice(0, 16);
}

// 鳥の種情報
interface BirdOption {
  common_name: string;
  sci_name: string;
  species_code: string;
}

// 観察ステータス ("sighted" or "unsighted")
type SightingStatus = "sighted" | "unsighted";

interface PostFormProps {
  // 観察時刻
  // → 親コンポーネントから受け取る形だが、ここでは自前の例として定義
  timestamp: string;
  setTimestamp: (value: string) => void;

  // 緯度・経度など
  lat: string;
  lng: string;

  // 投稿完了・エラーメッセージ
  message: string;

  // フォーム送信時のハンドラ
  // 第3引数にstatusを受け取る仕様
  handleSubmit: (
    e: React.FormEvent,
    selectedOption: BirdOption,
    status: SightingStatus,
    timestampUTC: string
  ) => void;

  // 現在地取得ボタンのハンドラ
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

  // マウント時に timestamp が空の場合は「現在時刻(秒msなし)」をセットする例
  useEffect(() => {
    if (!timestamp) {
      setTimestamp(getNowWithoutSeconds());
    }
  }, [timestamp, setTimestamp]);

  // Supabaseから鳥の種類リストを取得する例
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

  // フォーム送信ロジック
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption) return;

    // 1) ユーザーが入力した時刻をDateに変換 (ローカル時刻として扱う)
    const localDate = new Date(timestamp);

    // 2) 未来の日付ならエラー (例: "未来は禁止")
    const now = new Date();
    if (localDate.getTime() > now.getTime()) {
      alert("Cannot submit a future date/time.");
      return;
    }

    // 3) DBに保存するときはUTCとして送信
    const timestampUTC = localDate.toISOString(); 
    // 例: "2025-07-25T00:45:00.000Z"

    // 4) 親の handleSubmit に UTC 時刻を渡す
    handleSubmit(e, selectedOption, status, timestampUTC);
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
        {/* 鳥の検索ボックス */}
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

        {/* 鳥の種候補一覧 */}
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

        {/* 日時入力: 秒・ミリ秒除去済みを初期値にし、自由に変更可 */}
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

        {/* 現在地・送信ボタン */}
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

      {/* エラーメッセージや成功メッセージ */}
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