import { NextResponse } from "next/server";
import { fetchSpeciesList } from "@/lib/ebirdClient";

export async function GET() {
  try {
    const regionCode = "SG";
    const speciesList = await fetchSpeciesList(regionCode);

    return NextResponse.json({ speciesList });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error("Unknown error:", error);
      return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
    }
  }
}