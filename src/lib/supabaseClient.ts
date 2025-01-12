import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

// .env.localをロード
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URLまたはAnon Keyが設定されていません");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);