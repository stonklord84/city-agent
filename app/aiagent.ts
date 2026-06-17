import { query } from "@/lib/db-aurora";

export async function aiFunction(messyPrompt: string) {
  // 1. Grab the first 3 rows from your neighborhood table
  // Make sure your column names match what your frontend prints (name, rent, vibe)
  const result = await query(
    "SELECT id, name, city, country, safety_score, transit_score, vibe_score, description, tags, min_rent, max_rent, rent_currency FROM neighborhoods LIMIT 2"
  );

  // 2. Return the array of objects straight to actions.ts
  return result.rows; 
}