import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Checking .env.local for SUPABASE_SERVICE_ROLE_KEY...");
if (serviceRoleKey) {
  console.log("SUCCESS: Service Role Key is present.");
  console.log("Key length:", serviceRoleKey.length);
} else {
  console.log("FAILURE: Service Role Key is MISSING.");
}
