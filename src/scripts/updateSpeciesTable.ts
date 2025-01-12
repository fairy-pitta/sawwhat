import * as dotenv from "dotenv";
dotenv.config();

import { supabase } from "@/lib/supabaseClient";
import singaporeSpeciesList from "@/data/singaporeSpeciesList.json";

const updateSpeciesTable = async () => {
  try {
    // フィルタリストを小文字に変換
    const filterList = singaporeSpeciesList.map((code) => code.toLowerCase());
    console.log("Supabaseに送信するフィルタリスト:", filterList);

    // Supabaseクエリ
    const { data: birds, error: fetchError } = await supabase
      .from("allbirds")
      .select(`"SPECIES_CODE", "SCI_NAME", "PRIMARY_COM_NAME", "FAMILY"`)
      .in("SPECIES_CODE", filterList);

    if (fetchError) {
      console.error("データ取得エラー:", fetchError.message);
      return;
    }

    console.log("取得したデータ:", birds);

    // データが取得できた場合
    if (birds && birds.length > 0) {
      const { error: insertError } = await supabase.from("species").insert(
        birds.map((bird) => ({
          species_code: bird.SPECIES_CODE, // `SPECIES_CODE` → `species_code`
          sci_name: bird.SCI_NAME,        // `SCI_NAME` → `sci_name`
          common_name: bird.PRIMARY_COM_NAME, // `PRIMARY_COM_NAME` → `common_name`
          family: bird.FAMILY,           // `FAMILY` → `family`
        }))
      );

      if (insertError) {
        throw new Error(`データ挿入エラー: ${insertError.message}`);
      }

      console.log("speciesテーブルを更新しました！");
    } else {
      console.log("該当するデータが見つかりませんでした。");
    }
  } catch (error) {
    console.error("エラー:", error.message);
  }
};

updateSpeciesTable();