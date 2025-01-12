import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface FilterSidebarProps {
  setFilter: (filter: { common_name: string; sci_name: string }) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ setFilter }) => {
  const [speciesOptions, setSpeciesOptions] = useState<
    { common_name: string; sci_name: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState<{
    common_name: string;
    sci_name: string;
  } | null>(null);

  useEffect(() => {
    const fetchSpecies = async () => {
      const { data, error } = await supabase
        .from("species")
        .select("common_name, sci_name");

      if (error) {
        console.error("鳥のデータ取得に失敗しました:", error.message);
      } else {
        setSpeciesOptions(data || []);
      }
    };

    fetchSpecies();
  }, []);

  const filteredOptions =
    searchTerm.trim() === ""
      ? []
      : speciesOptions.filter((option) =>
          option.common_name.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const handleFilterApply = () => {
    if (selectedOption) {
      setFilter(selectedOption);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        right: "10px",
        top: "10px",
        background: "white",
        padding: "10px",
        borderRadius: "8px",
        zIndex: 1000,
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        width: "300px", // 窓の幅を広げる
        color: "#333",
      }}
    >
      <h4>フィルタ</h4>
      <input
        type="text"
        placeholder="鳥の名前を入力"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          marginBottom: "10px",
          padding: "8px",
          width: "100%",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      {filteredOptions.length > 0 && (
        <ul
          style={{
            maxHeight: "200px", // 高さも調整
            overflowY: "auto",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: "#f9f9f9",
            padding: "5px",
          }}
        >
          {filteredOptions.map((option) => (
            <li
              key={option.common_name}
              onClick={() => {
                setSearchTerm(option.common_name);
                setSelectedOption(option);
              }}
              style={{
                display: "flex", // チェックマークと名前を並べる
                justifyContent: "space-between",
                alignItems: "center",
                padding: "5px",
                cursor: "pointer",
                backgroundColor:
                  selectedOption?.common_name === option.common_name
                    ? "#007BFF"
                    : "white",
                color:
                  selectedOption?.common_name === option.common_name
                    ? "white"
                    : "black",
                borderRadius: "3px",
              }}
            >
              <span>
                {option.common_name} (<i>{option.sci_name}</i>)
              </span>
              {selectedOption?.common_name === option.common_name && (
                <span style={{ fontWeight: "bold" }}>✔</span>
              )}
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={handleFilterApply}
        style={{
          padding: "10px",
          width: "100%",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        フィルタ適用
      </button>
    </div>
  );
};

export default FilterSidebar;