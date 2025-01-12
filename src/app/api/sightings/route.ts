import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("sightings")
      .select("location, common_name, sci_name, species_code, timestamp");

    if (error) {
      console.error("データ取得エラー:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error("エラー:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}