import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface PostFormProps {
  timestamp: string;
  setTimestamp: (value: string) => void;
  lat: string;
  lng: string;
  message: string;
  handleSubmit: (
    e: React.FormEvent,
    selectedOption: { common_name: string; sci_name: string; species_code: string }
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
  const [speciesOptions, setSpeciesOptions] = useState<
    { common_name: string; sci_name: string; species_code: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState<{
    common_name: string;
    sci_name: string;
    species_code: string;
  } | null>(null);
  const [shareableData, setShareableData] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpecies = async () => {
      const { data, error } = await supabase
        .from("species")
        .select("common_name, sci_name, species_code");

      if (error) {
        console.error("鳥のデータ取得に失敗しました:", error.message);
      } else {
        setSpeciesOptions(data || []);
      }
    };

    fetchSpecies();
  }, []);

  const filteredOptions =
    searchTerm.length >= 1
      ? speciesOptions.filter((option) =>
          option.common_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "鳥の目撃情報",
          text: shareableData || "目撃情報を共有します！",
          url: window.location.href, // 現在のページのURL
        });
      } catch (error) {
        console.error("共有に失敗しました:", error);
      }
    } else {
      alert("このブラウザは共有機能をサポートしていません。");
    }
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
      <h3 style={{ fontWeight: "bold", marginBottom: "10px" }}>投稿フォーム</h3>
      <form
        onSubmit={(e) => {
          if (selectedOption) {
            handleSubmit(e, selectedOption);
            setShareableData(
              `鳥の名前: ${selectedOption.common_name}\n科学名: ${selectedOption.sci_name}\n場所: https://maps.google.com/?q=${lat},${lng}\n時間: ${timestamp}`
            );
          }
        }}
      >
        <input
          type="text"
          placeholder="鳥の名前を入力 (例: Japanese White-eye)"
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
                        selectedOption?.species_code === option.species_code ? "white" : "#333",
                    }}
                  >
                    ({option.sci_name})
                  </span>
                </span>
                {selectedOption?.species_code === option.species_code && (
                  <span style={{ marginLeft: "10px", color: "white", fontWeight: "bold" }}>
                    ✔
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
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
        <div style={{ display: "flex", justifyContent: "space-between" }}>
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
              marginRight: "10px",
            }}
          >
            投稿
          </button>
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
              fontWeight: "bold",
            }}
          >
            現在地に移動
          </button>
        </div>
      </form>
      {shareableData && (
        <button
          onClick={handleShare}
          style={{
            marginTop: "10px",
            padding: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          シェア
        </button>
      )}
      {message && (
        <p
          style={{
            color: message.includes("成功") ? "green" : "red",
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