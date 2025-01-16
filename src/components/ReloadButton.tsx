import { useState } from "react";
import { FaSyncAlt } from "react-icons/fa";

const ReloadButton = ({ fetchSightings }: { fetchSightings: () => void }) => {
  const [isRotating, setIsRotating] = useState(false);

  const handleReloadClick = async () => {
    setIsRotating(true); // 回転開始
    await fetchSightings(); // データ取得
    setTimeout(() => setIsRotating(false), 1000); // 1秒後に回転を終了
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "10px",
        right: "60px",
        zIndex: 9999,
        background: "white",
        borderRadius: "50%",
        padding: "8px",
        cursor: "pointer",
        boxShadow: "0px 2px 5px rgba(0,0,0,0.3)",
      }}
      onClick={handleReloadClick}
      title="Reload sightings"
    >
      <FaSyncAlt
        size={20}
        color="#333"
        style={{
          transition: "transform 0.5s linear", // アニメーションのスムーズさ
          transform: isRotating ? "rotate(360deg)" : "rotate(0deg)", // 回転角度
        }}
      />
    </div>
  );
};

export default ReloadButton;