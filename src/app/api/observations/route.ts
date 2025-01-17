import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const EBIRD_API_KEY = process.env.EBIRD_API_KEY;

export async function GET() {
  const regionCode = "SG";
  const daysBack = 14;
  const url = `https://api.ebird.org/v2/data/obs/${regionCode}/recent?back=${daysBack}`;

  try {
    const { error: deleteError } = await supabase.from("observations").delete().neq("id", 0);
    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to delete old data" },
        { status: 500 }
      );
    }

    const response = await fetch(url, {
      headers: {
        "X-eBirdApiToken": EBIRD_API_KEY!,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch data: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    const insertPromises = data.map((observation: any) => {
      return supabase.from("observations").insert({
        species_code: observation.speciesCode,
        common_name: observation.comName,
        scientific_name: observation.sciName,
        location_id: observation.locId,
        location_name: observation.locName,
        observation_date: new Date(observation.obsDt),
        count: observation.howMany,
        latitude: observation.lat,
        longitude: observation.lng,
        is_valid: observation.obsValid,
        is_reviewed: observation.obsReviewed,
        is_private: observation.locationPrivate,
        submission_id: observation.subId,
        exotic_category: observation.exoticCategory || null,
      });
    });

    await Promise.all(insertPromises);

    return NextResponse.json({ message: "Data successfully replaced!" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch or replace eBird data" },
      { status: 500 }
    );
  }
}