import { supabase } from "@/lib/supabaseClient";

async function testConnection() {
  try {
    const { data, error } = await supabase.from("allbirds").select("*").limit(1);

    if (error) {
      console.error("Supabase接続エラー:", error.message);
    } else if (data.length > 0) {
      console.log("Supabase接続成功:", data);
    } else {
      console.log("Supabaseにデータはありますが、取得できませんでした。");
    }
  } catch (err) {
    console.error("接続エラー:", err);
  }
}

testConnection();