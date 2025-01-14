import { NextResponse } from "next/server";
import { fetchRecentObservations } from "@/lib/ebirdClient";

/**
 * 過去7日間の観察データを取得し、JSONレスポンスとして返す
 */
export async function GET() {
  const regionCode = "SG"; // 固定値としてシンガポールを指定
  try {
    const observations = await fetchRecentObservations(regionCode);
    return NextResponse.json(observations);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching recent observations:", error.message);
      return NextResponse.json(
        { error: `Error: ${error.message}` },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}