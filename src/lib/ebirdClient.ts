import dotenv from 'dotenv';
dotenv.config();
import { writeFile } from "fs/promises";
import path from "path";
import { parse as csvParse } from "csv-parse/sync";

const EBIRD_API_URL = "https://api.ebird.org/v2/product/spplist";
const EBIRD_API_KEY = process.env.EBIRD_API_KEY || ""; 

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



const EBIRD_BASE_URL = "https://api.ebird.org/v2";

/**
 * 指定された地域コードのホットスポットリストを取得し、JSON形式で返却
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

  const text = await response.text(); // CSV形式でレスポンスを取得

  try {
    // CSVをJSONに変換
    const records = csvParse(text, {
      columns: [
        "locId",         // ホットスポットID
        "countryCode",   // 国コード
        "subnational1",  // サブナショナルコード
        "subnational2",  // サブナショナルコード（2）
        "latitude",      // 緯度
        "longitude",     // 経度
        "name",          // ホットスポット名
        "lastVisit",     // 最終訪問日
        "speciesCount",  // 種数
      ],
      skip_empty_lines: true,
      relax_column_count: true, // 列数の不整合を許容
    });
    return records;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Failed to parse CSV: " + error.message);
    } else {
      throw new Error("Failed to parse CSV: An unknown error occurred");
    }
  }
};

/**
 * 指定された地域コードのホットスポットリストを取得し、CSVとして保存
 * @param regionCode 地域コード (例: "SG")
 * @returns 保存したファイルのパス
 */
export const fetchAndSaveHotspotList = async (regionCode: string): Promise<string> => {
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

  const text = await response.text(); // CSV形式でレスポンスを取得

  // 保存先のパスを定義
  const filePath = path.join(process.cwd(), "data", `${regionCode}_hotspots.csv`);

  try {
    // データをCSVファイルに保存
    await writeFile(filePath, text, "utf8");
    console.log(`Hotspot data saved to ${filePath}`);
    return filePath;
  } catch (error) {
    throw new Error(`Failed to save CSV data: ${error instanceof Error ? error.message : error}`);
  }
};


/**
 * 過去7日間の観察データを取得
 * @param regionCode 地域コード (例: "SG")
 * @returns 観察データのリスト
 */
export const fetchRecentObservations = async (regionCode: string): Promise<any[]> => {
  if (!EBIRD_API_KEY) {
    throw new Error("eBird APIキーが設定されていません");
  }

  const url = `${EBIRD_BASE_URL}/data/obs/${regionCode}/recent/recent?back=7`;

  const response = await fetch(url, {
    headers: {
      "X-eBirdApiToken": EBIRD_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`eBird APIのリクエストに失敗しました: ${response.statusText}`);
  }

  return await response.json();
};