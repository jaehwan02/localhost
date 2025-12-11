
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  console.log("URL:", supabaseUrl ? "Found" : "Missing");
  console.log("Key:", supabaseKey ? "Found" : "Missing");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQueue() {
  const { data, error } = await supabase
    .from("media_queue")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching queue:", error);
  } else {
    console.log("Current Queue State:");
    console.table(data);
  }
}

checkQueue();
