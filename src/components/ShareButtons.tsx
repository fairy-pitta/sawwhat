"use client";

import React, { useState } from "react";
// まず "npm install react-icons" しておく
import { FaTelegramPlane, FaTwitter, FaFacebookF, FaWhatsapp } from "react-icons/fa";

interface ShareButtonsProps {
  /** シェア対象URL（本番では https://myapp.com/... のように設定） */
  postUrl: string;
  /** シェア時の文言 */
  text: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ postUrl, text }) => {
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedText = encodeURIComponent(text);

  // 主要SNSのシェア用URL
  const telegramShareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;

  // URLコピー用の状態管理
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    // クリップボードにURLをコピー
    navigator.clipboard.writeText(postUrl);
    setCopied(true);

    // 3秒後に "Copied!" ラベルを非表示に
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div style={containerStyle}>
      <h4 style={{ marginBottom: "8px" }}>Share this post:</h4>

      {/* シェア用URL表示 + コピー */}
      <div style={urlBoxStyle}>
        <span style={{ marginRight: "8px", overflowWrap: "anywhere" }}>{postUrl}</span>
        <button onClick={handleCopyUrl} style={copyBtnStyle}>
          Copy
        </button>
        {copied && <span style={copiedLabelStyle}>Copied!</span>}
      </div>

      {/* シェアボタン群 */}
      <div style={btnRowStyle}>
        <ShareButton
          label="Telegram"
          url={telegramShareUrl}
          bgColor="#0088cc"
          Icon={FaTelegramPlane}
        />
        <ShareButton
          label="Twitter"
          url={twitterShareUrl}
          bgColor="#1da1f2"
          Icon={FaTwitter}
        />
        <ShareButton
          label="Facebook"
          url={facebookShareUrl}
          bgColor="#4267B2"
          Icon={FaFacebookF}
        />
        <ShareButton
          label="WhatsApp"
          url={whatsappShareUrl}
          bgColor="#25D366"
          Icon={FaWhatsapp}
        />
      </div>
    </div>
  );
};

/** 個別のシェアボタン */
interface SingleShareButtonProps {
  label: string;
  url: string;
  bgColor: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
}

const ShareButton: React.FC<SingleShareButtonProps> = ({ label, url, bgColor, Icon }) => (
  <button
    onClick={() => window.open(url, "_blank")}
    style={{
      ...shareBtnStyle,
      backgroundColor: bgColor,
    }}
  >
    <Icon size={18} color="#fff" />
    <span>{label}</span>
  </button>
);

//
// デザイン用style
//
const containerStyle: React.CSSProperties = {
  marginTop: "10px",
  padding: "12px",
  borderRadius: "8px",
  backgroundColor: "#f7f7f7",
};

const urlBoxStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  marginBottom: "12px",
  backgroundColor: "#fff",
  padding: "6px 10px",
  borderRadius: "4px",
  border: "1px solid #ccc",
};

const copyBtnStyle: React.CSSProperties = {
  marginLeft: "auto",
  padding: "6px 10px",
  backgroundColor: "#666",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const copiedLabelStyle: React.CSSProperties = {
  marginLeft: "8px",
  color: "#28a745",
  fontWeight: "bold",
};

const btnRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const shareBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "8px 14px",
  border: "none",
  borderRadius: "4px",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

export default ShareButtons;