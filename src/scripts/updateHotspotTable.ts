import { fetchHotspotList, fetchHotspotDetails } from "@/lib/ebirdClient";
import { supabase } from "@/lib/supabaseClient";

const updateHotspotTable = async () => {
  try {
    console.log("Fetching hotspot list...");

    // シンガポールのホットスポットリストを取得
    const hotspotList = await fetchHotspotList("SG");
    console.log(`Fetched ${hotspotList.length} hotspots.`);

    const hotspotDetails = [];

    // 各ホットスポットの詳細を取得
    for (const hotspot of hotspotList) {
      try {
        const details = await fetchHotspotDetails(hotspot.locId);
        hotspotDetails.push(details);
        console.log(`Fetched details for hotspot ${hotspot.locId}`);
      } catch (error) {
        console.error(`Failed to fetch details for hotspot ${hotspot.locId}:`, error);
      }
    }

    console.log(`Fetched details for ${hotspotDetails.length} hotspots. Preparing to update Supabase...`);

    // Supabaseに保存するデータのフォーマット
    const dataToSend = hotspotDetails.map((hotspot) => ({
      loc_id: hotspot.locId,
      name: hotspot.name,
      coordinates: { latitude: hotspot.latitude, longitude: hotspot.longitude },
      country_code: hotspot.countryCode,
      country_name: hotspot.countryName,
    }));

    console.log("Data to send to Supabase:", JSON.stringify(dataToSend, null, 2));

    // Supabaseにデータを保存
    const { error: upsertError } = await supabase
      .from("hotspots")
      .upsert(dataToSend, { onConflict: "loc_id" });

    if (upsertError) {
      throw new Error(`Supabase upsert error: ${upsertError.message}`);
    }

    console.log(`Successfully updated ${dataToSend.length} records in Supabase.`);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating hotspot table:", error.message);
    } else {
      console.error("Unknown error occurred.");
    }
  }
};

// スクリプトの実行
updateHotspotTable().then(() => {
  console.log("Hotspot update script completed.");
});