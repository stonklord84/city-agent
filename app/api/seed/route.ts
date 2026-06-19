import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { cities } from "@/lib/db/schema-minimal";
import { seedCities } from "@/lib/db/seed-data";

export async function POST() {
  console.log("Seeding cities...");

  await db.insert(cities).values(
    seedCities.map((city) => ({
      name: city.name,
      slug: city.slug,
      country: city.country,
      currency: "USD",
    }))
  );

  return NextResponse.json({ success: true });
}