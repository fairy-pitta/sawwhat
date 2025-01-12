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