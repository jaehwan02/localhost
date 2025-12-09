import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

async function getTeamId() {
  const { data, error } = await supabase
    .from("teams")
    .select("id")
    .eq("team_id", "final_test_team")
    .single();

  if (error) {
    console.error("Error fetching team:", error);
  } else {
    console.log("Team ID:", data.id);
  }
}

getTeamId();
