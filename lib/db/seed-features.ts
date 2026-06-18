// Seed data for neighborhood profile feature columns and rentals JSON
// All feature values are 0.0–1.0 floats (higher = more of that quality)

export type FeatureVector = {
  walkability:        number;
  transit:            number;
  nightlife:          number;
  safety:             number;
  cafes:              number;
  parks:              number;
  youngProfessionals: number;
  affordability:      number;
  diversity:          number;
};

export type SeedRental = {
  title:         string;
  price:         number;
  currency:      string;
  bedrooms:      number;
  bathrooms:     number;
  sqft?:         number;
  lat:           number;
  lng:           number;
  source:        string;
  externalUrl:   string;
  availableFrom: string; // YYYY-MM-DD
};

// Keyed by neighborhood slug
export const neighborhoodFeatureVectors: Record<string, FeatureVector> = {
  // ── Toronto ──────────────────────────────────────────────────────────────
  "downtown-toronto": {
    walkability: 0.99, transit: 0.99, nightlife: 0.92, safety: 0.55,
    cafes: 0.85, parks: 0.40, youngProfessionals: 0.90, affordability: 0.28, diversity: 0.75,
  },
  "kensington-market": {
    walkability: 0.88, transit: 0.82, nightlife: 0.75, safety: 0.62,
    cafes: 0.92, parks: 0.55, youngProfessionals: 0.72, affordability: 0.68, diversity: 0.96,
  },
  "leslieville": {
    walkability: 0.82, transit: 0.72, nightlife: 0.65, safety: 0.75,
    cafes: 0.82, parks: 0.65, youngProfessionals: 0.78, affordability: 0.60, diversity: 0.70,
  },
  "north-york": {
    walkability: 0.65, transit: 0.75, nightlife: 0.40, safety: 0.80,
    cafes: 0.55, parks: 0.72, youngProfessionals: 0.60, affordability: 0.65, diversity: 0.82,
  },
  "scarborough": {
    walkability: 0.55, transit: 0.65, nightlife: 0.35, safety: 0.72,
    cafes: 0.45, parks: 0.74, youngProfessionals: 0.50, affordability: 0.80, diversity: 0.92,
  },
  "etobicoke": {
    walkability: 0.60, transit: 0.68, nightlife: 0.30, safety: 0.82,
    cafes: 0.45, parks: 0.80, youngProfessionals: 0.55, affordability: 0.72, diversity: 0.72,
  },
  // ── New York City ─────────────────────────────────────────────────────────
  "williamsburg": {
    walkability: 0.93, transit: 0.88, nightlife: 0.95, safety: 0.72,
    cafes: 0.95, parks: 0.65, youngProfessionals: 0.93, affordability: 0.22, diversity: 0.80,
  },
  "park-slope": {
    walkability: 0.90, transit: 0.85, nightlife: 0.60, safety: 0.85,
    cafes: 0.88, parks: 0.92, youngProfessionals: 0.78, affordability: 0.18, diversity: 0.72,
  },
  "astoria": {
    walkability: 0.85, transit: 0.83, nightlife: 0.72, safety: 0.78,
    cafes: 0.80, parks: 0.68, youngProfessionals: 0.75, affordability: 0.52, diversity: 0.93,
  },
  "bushwick": {
    walkability: 0.82, transit: 0.80, nightlife: 0.90, safety: 0.60,
    cafes: 0.85, parks: 0.55, youngProfessionals: 0.86, affordability: 0.55, diversity: 0.85,
  },
  "jackson-heights": {
    walkability: 0.88, transit: 0.85, nightlife: 0.65, safety: 0.72,
    cafes: 0.75, parks: 0.62, youngProfessionals: 0.60, affordability: 0.65, diversity: 0.99,
  },
  // ── Mumbai ────────────────────────────────────────────────────────────────
  "bandra-west": {
    walkability: 0.72, transit: 0.78, nightlife: 0.88, safety: 0.75,
    cafes: 0.92, parks: 0.55, youngProfessionals: 0.93, affordability: 0.28, diversity: 0.80,
  },
  "andheri-west": {
    walkability: 0.65, transit: 0.83, nightlife: 0.72, safety: 0.70,
    cafes: 0.72, parks: 0.50, youngProfessionals: 0.80, affordability: 0.50, diversity: 0.78,
  },
  "powai": {
    walkability: 0.60, transit: 0.65, nightlife: 0.55, safety: 0.83,
    cafes: 0.68, parks: 0.72, youngProfessionals: 0.84, affordability: 0.42, diversity: 0.72,
  },
  "dadar": {
    walkability: 0.80, transit: 0.90, nightlife: 0.60, safety: 0.72,
    cafes: 0.65, parks: 0.60, youngProfessionals: 0.65, affordability: 0.62, diversity: 0.88,
  },
};

// Keyed by neighborhood slug — 4–5 listings per neighborhood
export const neighborhoodRentals: Record<string, SeedRental[]> = {
  // ── Toronto ──────────────────────────────────────────────────────────────
  "downtown-toronto": [
    { title: "Modern Studio on King West", price: 1950, currency: "CAD", bedrooms: 0, bathrooms: 1, sqft: 480, lat: 43.6442, lng: -79.3978, source: "kijiji", externalUrl: "https://www.kijiji.ca/b-apartments-condos/city-of-toronto/c37l1700273", availableFrom: "2026-07-01" },
    { title: "1BR with CN Tower Views", price: 2650, currency: "CAD", bedrooms: 1, bathrooms: 1, sqft: 610, lat: 43.6450, lng: -79.3840, source: "kijiji", externalUrl: "https://www.kijiji.ca/b-apartments-condos/city-of-toronto/c37l1700273", availableFrom: "2026-07-15" },
    { title: "Spacious 2BR near Union Station", price: 3400, currency: "CAD", bedrooms: 2, bathrooms: 2, sqft: 900, lat: 43.6456, lng: -79.3800, source: "rentals-ca", externalUrl: "https://rentals.ca/toronto/downtown", availableFrom: "2026-08-01" },
    { title: "Cozy 1BR Condo, Bay St", price: 2450, currency: "CAD", bedrooms: 1, bathrooms: 1, sqft: 570, lat: 43.6520, lng: -79.3840, source: "kijiji", externalUrl: "https://www.kijiji.ca/b-apartments-condos/city-of-toronto/c37l1700273", availableFrom: "2026-07-01" },
  ],
  "kensington-market": [
    { title: "Artist Loft above the Market", price: 1800, currency: "CAD", bedrooms: 1, bathrooms: 1, sqft: 650, lat: 43.6540, lng: -79.4012, source: "kijiji", externalUrl: "https://www.kijiji.ca/b-apartments-condos/city-of-toronto/c37l1700273", availableFrom: "2026-07-01" },
    { title: "Vintage 2BR, Spadina Ave", price: 2400, currency: "CAD", bedrooms: 2, bathrooms: 1, sqft: 850, lat: 43.6555, lng: -79.4005, source: "rentals-ca", externalUrl: "https://rentals.ca/toronto/kensington-market", availableFrom: "2026-07-15" },
    { title: "Cozy Studio, Baldwin Village", price: 1550, currency: "CAD", bedrooms: 0, bathrooms: 1, sqft: 420, lat: 43.6530, lng: -79.3990, source: "kijiji", externalUrl: "https://www.kijiji.ca/b-apartments-condos/city-of-toronto/c37l1700273", availableFrom: "2026-08-01" },
  ],
  "leslieville": [
    { title: "Bright 1BR, Queen St East", price: 2100, currency: "CAD", bedrooms: 1, bathrooms: 1, sqft: 620, lat: 43.6607, lng: -79.3290, source: "kijiji", externalUrl: "https://www.kijiji.ca/b-apartments-condos/city-of-toronto/c37l1700273", availableFrom: "2026-07-01" },
    { title: "Modern 2BR, Leslieville Village", price: 2750, currency: "CAD", bedrooms: 2, bathrooms: 1, sqft: 880, lat: 43.6620, lng: -79.3320, source: "rentals-ca", externalUrl: "https://rentals.ca/toronto/leslieville", availableFrom: "2026-07-15" },
    { title: "Studio near Broadview TTC", price: 1700, currency: "CAD", bedrooms: 0, bathrooms: 1, sqft: 440, lat: 43.6590, lng: -79.3400, source: "kijiji", externalUrl: "https://www.kijiji.ca/b-apartments-condos/city-of-toronto/c37l1700273", availableFrom: "2026-08-01" },
  ],
  "north-york": [
    { title: "Large 1BR near Yonge & Sheppard", price: 1900, currency: "CAD", bedrooms: 1, bathrooms: 1, sqft: 680, lat: 43.7615, lng: -79.4103, source: "kijiji", externalUrl: "https://www.kijiji.ca/b-apartments-condos/city-of-toronto/c37l1700273", availableFrom: "2026-07-01" },
    { title: "2BR Family Suite, North York Centre", price: 2600, currency: "CAD", bedrooms: 2, bathrooms: 2, sqft: 950, lat: 43.7650, lng: -79.4150, source: "rentals-ca", externalUrl: "https://rentals.ca/toronto/north-york", availableFrom: "2026-07-01" },
    { title: "Affordable Studio, Finch West", price: 1450, currency: "CAD", bedrooms: 0, bathrooms: 1, sqft: 400, lat: 43.7800, lng: -79.4200, source: "kijiji", externalUrl: "https://www.kijiji.ca/b-apartments-condos/city-of-toronto/c37l1700273", availableFrom: "2026-08-01" },
  ],
  "scarborough": [
    { title: "Spacious 2BR in Scarborough Town", price: 2100, currency: "CAD", bedrooms: 2, bathrooms: 1, sqft: 900, lat: 43.7764, lng: -79.2318, source: "kijiji", externalUrl: "https://www.kijiji.ca/b-apartments-condos/city-of-toronto/c37l1700273", availableFrom: "2026-07-01" },
    { title: "1BR near RT Subway, Kennedy", price: 1650, currency: "CAD", bedrooms: 1, bathrooms: 1, sqft: 600, lat: 43.7730, lng: -79.2400, source: "rentals-ca", externalUrl: "https://rentals.ca/toronto/scarborough", availableFrom: "2026-07-15" },
    { title: "Budget Studio, Scarborough", price: 1300, currency: "CAD", bedrooms: 0, bathrooms: 1, sqft: 390, lat: 43.7800, lng: -79.2200, source: "kijiji", externalUrl: "https://www.kijiji.ca/b-apartments-condos/city-of-toronto/c37l1700273", availableFrom: "2026-08-01" },
  ],
  "etobicoke": [
    { title: "Quiet 2BR near Humber River", price: 2200, currency: "CAD", bedrooms: 2, bathrooms: 1, sqft: 920, lat: 43.6435, lng: -79.5680, source: "kijiji", externalUrl: "https://www.kijiji.ca/b-apartments-condos/city-of-toronto/c37l1700273", availableFrom: "2026-07-01" },
    { title: "1BR Lakeshore Blvd Condo", price: 1950, currency: "CAD", bedrooms: 1, bathrooms: 1, sqft: 640, lat: 43.6200, lng: -79.5200, source: "rentals-ca", externalUrl: "https://rentals.ca/toronto/etobicoke", availableFrom: "2026-07-15" },
    { title: "Affordable Studio, Kipling", price: 1450, currency: "CAD", bedrooms: 0, bathrooms: 1, sqft: 400, lat: 43.6400, lng: -79.5350, source: "kijiji", externalUrl: "https://www.kijiji.ca/b-apartments-condos/city-of-toronto/c37l1700273", availableFrom: "2026-08-01" },
  ],

  // ── New York City ─────────────────────────────────────────────────────────
  "williamsburg": [
    { title: "Hip Studio on Bedford Ave", price: 2800, currency: "USD", bedrooms: 0, bathrooms: 1, sqft: 450, lat: 40.7165, lng: -73.9572, source: "craigslist", externalUrl: "https://newyork.craigslist.org/search/bra?query=williamsburg", availableFrom: "2026-07-01" },
    { title: "Bright 1BR, 5 min to L Train", price: 3500, currency: "USD", bedrooms: 1, bathrooms: 1, sqft: 620, lat: 40.7140, lng: -73.9590, source: "craigslist", externalUrl: "https://newyork.craigslist.org/search/bra?query=williamsburg", availableFrom: "2026-07-01" },
    { title: "Loft-style 2BR, North Williamsburg", price: 4800, currency: "USD", bedrooms: 2, bathrooms: 1, sqft: 950, lat: 40.7200, lng: -73.9540, source: "streeteasy", externalUrl: "https://streeteasy.com/for-rent/williamsburg", availableFrom: "2026-07-15" },
    { title: "Converted 1BR with Exposed Brick", price: 3200, currency: "USD", bedrooms: 1, bathrooms: 1, sqft: 580, lat: 40.7180, lng: -73.9560, source: "craigslist", externalUrl: "https://newyork.craigslist.org/search/bra?query=williamsburg", availableFrom: "2026-08-01" },
  ],
  "park-slope": [
    { title: "Classic 1BR Brownstone, 5th Ave", price: 3200, currency: "USD", bedrooms: 1, bathrooms: 1, sqft: 700, lat: 40.6724, lng: -73.9800, source: "craigslist", externalUrl: "https://newyork.craigslist.org/search/bra?query=park+slope", availableFrom: "2026-07-01" },
    { title: "Family 2BR near Prospect Park", price: 4200, currency: "USD", bedrooms: 2, bathrooms: 1, sqft: 920, lat: 40.6750, lng: -73.9780, source: "streeteasy", externalUrl: "https://streeteasy.com/for-rent/park-slope", availableFrom: "2026-07-15" },
    { title: "Garden-level Studio, Carroll Gardens", price: 2600, currency: "USD", bedrooms: 0, bathrooms: 1, sqft: 490, lat: 40.6710, lng: -73.9820, source: "craigslist", externalUrl: "https://newyork.craigslist.org/search/bra?query=park+slope", availableFrom: "2026-07-01" },
    { title: "Sunny 1BR near F/G Train", price: 3000, currency: "USD", bedrooms: 1, bathrooms: 1, sqft: 650, lat: 40.6700, lng: -73.9840, source: "craigslist", externalUrl: "https://newyork.craigslist.org/search/bra?query=park+slope", availableFrom: "2026-08-01" },
  ],
  "astoria": [
    { title: "Spacious 1BR, close to N/W Train", price: 2200, currency: "USD", bedrooms: 1, bathrooms: 1, sqft: 720, lat: 40.7726, lng: -73.9297, source: "craigslist", externalUrl: "https://newyork.craigslist.org/search/que?query=astoria", availableFrom: "2026-07-01" },
    { title: "2BR with Backyard, Ditmars Blvd", price: 3000, currency: "USD", bedrooms: 2, bathrooms: 1, sqft: 950, lat: 40.7750, lng: -73.9310, source: "streeteasy", externalUrl: "https://streeteasy.com/for-rent/astoria", availableFrom: "2026-07-15" },
    { title: "Affordable Studio near restaurants", price: 1900, currency: "USD", bedrooms: 0, bathrooms: 1, sqft: 420, lat: 40.7710, lng: -73.9280, source: "craigslist", externalUrl: "https://newyork.craigslist.org/search/que?query=astoria", availableFrom: "2026-07-01" },
    { title: "Modern 1BR, Steinway St area", price: 2400, currency: "USD", bedrooms: 1, bathrooms: 1, sqft: 660, lat: 40.7730, lng: -73.9320, source: "craigslist", externalUrl: "https://newyork.craigslist.org/search/que?query=astoria", availableFrom: "2026-08-01" },
  ],
  "bushwick": [
    { title: "Artsy Studio near Maria Hernandez Park", price: 2100, currency: "USD", bedrooms: 0, bathrooms: 1, sqft: 470, lat: 40.6944, lng: -73.9213, source: "craigslist", externalUrl: "https://newyork.craigslist.org/search/bra?query=bushwick", availableFrom: "2026-07-01" },
    { title: "1BR Creative Loft, Myrtle Ave", price: 2700, currency: "USD", bedrooms: 1, bathrooms: 1, sqft: 680, lat: 40.6970, lng: -73.9190, source: "craigslist", externalUrl: "https://newyork.craigslist.org/search/bra?query=bushwick", availableFrom: "2026-07-15" },
    { title: "2BR near Jefferson L Stop", price: 3400, currency: "USD", bedrooms: 2, bathrooms: 1, sqft: 880, lat: 40.7000, lng: -73.9220, source: "streeteasy", externalUrl: "https://streeteasy.com/for-rent/bushwick", availableFrom: "2026-08-01" },
  ],
  "jackson-heights": [
    { title: "Spacious 1BR, Roosevelt Ave", price: 1900, currency: "USD", bedrooms: 1, bathrooms: 1, sqft: 750, lat: 40.7460, lng: -73.8927, source: "craigslist", externalUrl: "https://newyork.craigslist.org/search/que?query=jackson+heights", availableFrom: "2026-07-01" },
    { title: "2BR Family Apt, 74th St", price: 2500, currency: "USD", bedrooms: 2, bathrooms: 1, sqft: 960, lat: 40.7480, lng: -73.8950, source: "craigslist", externalUrl: "https://newyork.craigslist.org/search/que?query=jackson+heights", availableFrom: "2026-07-15" },
    { title: "Budget Studio, Diverse Neighborhood", price: 1600, currency: "USD", bedrooms: 0, bathrooms: 1, sqft: 390, lat: 40.7450, lng: -73.8900, source: "craigslist", externalUrl: "https://newyork.craigslist.org/search/que?query=jackson+heights", availableFrom: "2026-08-01" },
  ],

  // ── Mumbai ────────────────────────────────────────────────────────────────
  "bandra-west": [
    { title: "Modern 1BHK, Carter Road", price: 65000, currency: "INR", bedrooms: 1, bathrooms: 1, sqft: 550, lat: 19.0596, lng: 72.8295, source: "magicbricks", externalUrl: "https://www.magicbricks.com/property-for-rent/residential-properties/bandra-west-mumbai-pppfs", availableFrom: "2026-07-01" },
    { title: "2BHK with Sea View, Bandstand", price: 120000, currency: "INR", bedrooms: 2, bathrooms: 2, sqft: 950, lat: 19.0620, lng: 72.8270, source: "nobroker", externalUrl: "https://www.nobroker.in/property/rent/flat/mumbai/bandra-west", availableFrom: "2026-07-15" },
    { title: "Cozy Studio, Hill Road", price: 42000, currency: "INR", bedrooms: 0, bathrooms: 1, sqft: 380, lat: 19.0550, lng: 72.8320, source: "magicbricks", externalUrl: "https://www.magicbricks.com/property-for-rent/residential-properties/bandra-west-mumbai-pppfs", availableFrom: "2026-07-01" },
    { title: "3BHK Premium Apartment, Pali Hill", price: 180000, currency: "INR", bedrooms: 3, bathrooms: 2, sqft: 1400, lat: 19.0580, lng: 72.8250, source: "nobroker", externalUrl: "https://www.nobroker.in/property/rent/flat/mumbai/bandra-west", availableFrom: "2026-08-01" },
  ],
  "andheri-west": [
    { title: "1BHK near Lokhandwala Market", price: 38000, currency: "INR", bedrooms: 1, bathrooms: 1, sqft: 520, lat: 19.1364, lng: 72.8296, source: "magicbricks", externalUrl: "https://www.magicbricks.com/property-for-rent/residential-properties/andheri-west-mumbai-pppfs", availableFrom: "2026-07-01" },
    { title: "2BHK, 5 min to Andheri Station", price: 58000, currency: "INR", bedrooms: 2, bathrooms: 2, sqft: 850, lat: 19.1190, lng: 72.8480, source: "nobroker", externalUrl: "https://www.nobroker.in/property/rent/flat/mumbai/andheri-west", availableFrom: "2026-07-01" },
    { title: "Studio near Versova Beach", price: 28000, currency: "INR", bedrooms: 0, bathrooms: 1, sqft: 350, lat: 19.1290, lng: 72.8150, source: "magicbricks", externalUrl: "https://www.magicbricks.com/property-for-rent/residential-properties/andheri-west-mumbai-pppfs", availableFrom: "2026-08-01" },
  ],
  "powai": [
    { title: "Modern 1BHK, Hiranandani Gardens", price: 45000, currency: "INR", bedrooms: 1, bathrooms: 1, sqft: 620, lat: 19.1197, lng: 72.9053, source: "magicbricks", externalUrl: "https://www.magicbricks.com/property-for-rent/residential-properties/powai-mumbai-pppfs", availableFrom: "2026-07-01" },
    { title: "2BHK near Powai Lake", price: 75000, currency: "INR", bedrooms: 2, bathrooms: 2, sqft: 1050, lat: 19.1220, lng: 72.9080, source: "nobroker", externalUrl: "https://www.nobroker.in/property/rent/flat/mumbai/powai", availableFrom: "2026-07-15" },
    { title: "3BHK Premium, IIT Powai Area", price: 105000, currency: "INR", bedrooms: 3, bathrooms: 2, sqft: 1350, lat: 19.1280, lng: 72.9150, source: "magicbricks", externalUrl: "https://www.magicbricks.com/property-for-rent/residential-properties/powai-mumbai-pppfs", availableFrom: "2026-08-01" },
  ],
  "dadar": [
    { title: "1BHK near Dadar Station", price: 32000, currency: "INR", bedrooms: 1, bathrooms: 1, sqft: 480, lat: 19.0179, lng: 72.8438, source: "magicbricks", externalUrl: "https://www.magicbricks.com/property-for-rent/residential-properties/dadar-mumbai-pppfs", availableFrom: "2026-07-01" },
    { title: "2BHK, Shivaji Park Area", price: 52000, currency: "INR", bedrooms: 2, bathrooms: 1, sqft: 800, lat: 19.0200, lng: 72.8380, source: "nobroker", externalUrl: "https://www.nobroker.in/property/rent/flat/mumbai/dadar", availableFrom: "2026-07-15" },
    { title: "Budget Studio near Portuguese Church", price: 22000, currency: "INR", bedrooms: 0, bathrooms: 1, sqft: 320, lat: 19.0160, lng: 72.8420, source: "magicbricks", externalUrl: "https://www.magicbricks.com/property-for-rent/residential-properties/dadar-mumbai-pppfs", availableFrom: "2026-08-01" },
  ],
};
