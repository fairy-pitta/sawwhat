import { NextResponse } from "next/server";
import { fetchSpeciesList } from "@/lib/ebirdClient";

export async function GET() {
  try {
    const regionCode = "SG"; // シンガポールの地域コード
    const speciesList = await fetchSpeciesList(regionCode);

    return NextResponse.json({ speciesList });
  } catch (error: any) {
    console.error("エラー:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}