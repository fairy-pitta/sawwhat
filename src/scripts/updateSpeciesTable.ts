import * as dotenv from "dotenv";
dotenv.config();

import { supabase } from "@/lib/supabaseClient";
import singaporeSpeciesList from "@/data/singaporeSpeciesList.json";

const updateSpeciesTable = async () => {
  try {
    // Convert filter list to lowercase
    const filterList = singaporeSpeciesList.map((code) => code.toLowerCase());
    console.log("Filter list sent to Supabase:", filterList);

    // Supabase query
    const { data: birds, error: fetchError } = await supabase
      .from("allbirds")
      .select(`"SPECIES_CODE", "SCI_NAME", "PRIMARY_COM_NAME", "FAMILY"`)
      .in("SPECIES_CODE", filterList);

    if (fetchError) {
      console.error("Data fetch error:", fetchError.message);
      return;
    }

    console.log("Retrieved data:", birds);

    // If data is retrieved
    if (birds && birds.length > 0) {
      const { error: insertError } = await supabase.from("species").insert(
        birds.map((bird) => ({
          species_code: bird.SPECIES_CODE,
          sci_name: bird.SCI_NAME,
          common_name: bird.PRIMARY_COM_NAME,
          family: bird.FAMILY,
        }))
      );

      if (insertError) {
        throw new Error(`Data insertion error: ${insertError.message}`);
      }

      console.log("Updated the species table!");
    } else {
      console.log("No matching data found.");
    }
  } catch (error) {
    // Ensure error is an instance of Error
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("An unknown error occurred.");
    }
  }
};

updateSpeciesTable();