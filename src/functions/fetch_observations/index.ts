import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { supabaseClient } from "https://deno.land/x/supabase_edge_functions_client/mod.ts";

const EBIRD_API_KEY = Deno.env.get("EBIRD_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = supabaseClient(SUPABASE_URL!, SUPABASE_KEY!);

serve(async () => {
  const regionCode = "SG";
  const daysBack = 14;
  const url = `https://api.ebird.org/v2/data/obs/${regionCode}/recent?back=${daysBack}`;

  const deleteResult = await supabase.from("observations").delete().neq("id", 0);

  if (deleteResult.error) {
    return new Response(JSON.stringify({ error: "Failed to delete old data" }), { status: 500 });
  }

  const response = await fetch(url, {
    headers: { "X-eBirdApiToken": EBIRD_API_KEY! },
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ error: `Failed to fetch data: ${response.statusText}` }), { status: 500 });
  }

  const data = await response.json();

  const insertPromises = data.map((observation: any) =>
    supabase.from("observations").insert({
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
    })
  );

  await Promise.all(insertPromises);

  return new Response(JSON.stringify({ message: "Data successfully replaced!" }), { status: 200 });
});