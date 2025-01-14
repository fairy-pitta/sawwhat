const EBIRD_API_URL = "https://api.ebird.org/v2/product/spplist";
const EBIRD_API_KEY = process.env.EBIRD_API_KEY || ""; // .env.localのキーを利用

export const fetchSpeciesList = async (regionCode: string): Promise<string[]> => {
  if (!EBIRD_API_KEY) {
    throw new Error("eBird APIキーが設定されていません");
  }

  const url = `${EBIRD_API_URL}/${regionCode}`;

  const response = await fetch(url, {
    headers: {
      "X-eBirdApiToken": EBIRD_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`eBird APIのリクエストに失敗しました: ${response.statusText}`);
  }

  const data = await response.json();
  return data; // 取得したデータをそのまま返す
};

// =========================================
// 以下にホットスポット関連の関数を追加
// =========================================

const EBIRD_BASE_URL = "https://api.ebird.org/v2";

/**
 * 指定された地域コードのホットスポットリストを取得
 * @param regionCode 地域コード (例: "SG")
 * @returns ホットスポットリスト
 */
export const fetchHotspotList = async (regionCode: string): Promise<any[]> => {
  if (!EBIRD_API_KEY) {
    throw new Error("eBird APIキーが設定されていません");
  }

  const url = `${EBIRD_BASE_URL}/ref/hotspot/${regionCode}`;

  const response = await fetch(url, {
    headers: {
      "X-eBirdApiToken": EBIRD_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`eBird APIのリクエストに失敗しました: ${response.statusText}`);
  }

  const data = await response.json();
  return data; // ホットスポットリストを返す
};

/**
 * 指定されたホットスポットIDの詳細情報を取得
 * @param locId ホットスポットID
 * @returns ホットスポット詳細情報
 */
export const fetchHotspotDetails = async (locId: string): Promise<any> => {
  if (!EBIRD_API_KEY) {
    throw new Error("eBird APIキーが設定されていません");
  }

  const url = `${EBIRD_BASE_URL}/ref/hotspot/info/${locId}`;

  const response = await fetch(url, {
    headers: {
      "X-eBirdApiToken": EBIRD_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`ホットスポット詳細取得に失敗しました: ${response.statusText}`);
  }

  const data = await response.json();
  return data; // ホットスポット詳細情報を返す
};