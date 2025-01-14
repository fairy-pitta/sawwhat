import { NextResponse } from "next/server";
import { parse as csvParse } from "csv-parse/sync";
import { writeFile } from "fs/promises";
import path from "path";

const EBIRD_BASE_URL = "https://api.ebird.org/v2";
const EBIRD_API_KEY = process.env.EBIRD_API_KEY || "";

/**
 * 指定された地域コードのホットスポットデータを取得し、JSONレスポンスを返しつつCSVとして保存
 * @param regionCode 地域コード (例: "SG")
 */
export async function GET() {
  const regionCode = "SG"; // 固定値としてシンガポールを指定
  if (!EBIRD_API_KEY) {
    return NextResponse.json(
      { error: "eBird APIキーが設定されていません" },
      { status: 500 }
    );
  }

  const url = `${EBIRD_BASE_URL}/ref/hotspot/${regionCode}`;

  try {
    // APIリクエストを送信
    const response = await fetch(url, {
      headers: {
        "X-eBirdApiToken": EBIRD_API_KEY,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `eBird APIのリクエストに失敗しました: ${response.statusText}` },
        { status: 500 }
      );
    }

    const text = await response.text(); // CSV形式でレスポンスを取得

    // ヘッダーを追加したCSVデータを生成
    const header = [
      "locId",         // ホットスポットID
      "countryCode",   // 国コード
      "subnational1",  // サブナショナルコード
      "subnational2",  // サブナショナルコード（2）
      "latitude",      // 緯度
      "longitude",     // 経度
      "name",          // ホットスポット名
      "lastVisit",     // 最終訪問日
      "speciesCount",  // 種数
    ].join(",") + "\n";

    const csvWithHeader = header + text; // ヘッダーをレスポンスの先頭に追加

    // CSVをJSONに変換
    const records = csvParse(csvWithHeader, {
      columns: true, // ヘッダー行を使用してオブジェクト形式に変換
      skip_empty_lines: true,
      relax_column_count: true, // 列数の不整合を許容
    });

    // 保存先のパスを定義
    const filePath = path.join(process.cwd(), "src/data", `${regionCode}_hotspots.csv`);
    await writeFile(filePath, csvWithHeader, "utf8"); // ヘッダー付きCSVデータを保存
    console.log(`Hotspot data saved to ${filePath}`);

    // JSONデータをレスポンスとして返す
    return NextResponse.json(records);

  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching or processing hotspots:", error.message);
      return NextResponse.json(
        { error: `Error: ${error.message}` },
        { status: 500 }
      );
    } else {
      console.error("Unknown error occurred");
      return NextResponse.json(
        { error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}