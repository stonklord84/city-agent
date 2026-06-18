export const seedPlaceCategories = [
  "food",
  "nightlife",
  "wellness",
  "practical",
] as const;

export const demoUser = {
  email: "demo@localguide.app",
  name: "LocalGuide Demo User",
};

export type SeedPlaceCategory = (typeof seedPlaceCategories)[number];

export type SeedPlace = {
  name: string;
  slug: string;
  category: SeedPlaceCategory;
  summary: string;
  priceRange: "$" | "$$" | "$$$";
  vibeTags: string[];
  bestForTags: string[];
  lat: number;
  lng: number;
  reviews: Array<{
    rating: number;
    body: string;
    reviewerVibeTags: string[];
    reviewerInterests: string[];
  }>;
};

export type SeedNeighborhood = {
  name: string;
  slug: string;
  summary: string;
  vibeTags: string[];
  bestForTags: string[];
  rentMin: number;
  rentMax: number;
  walkabilityScore: number;
  nightlifeScore: number;
  quietScore: number;
  transitScore: number;
  lat: number;
  lng: number;
  places: SeedPlace[];
};

export type SeedCity = {
  name: string;
  slug: string;
  country: string;
  neighborhoods: SeedNeighborhood[];
};

export const seedCities: SeedCity[] = [
  // ─── TORONTO ─────────────────────────────────────────────────────────────
  {
    name: "Toronto",
    slug: "toronto",
    country: "Canada",
    neighborhoods: [
      {
        name: "Downtown Toronto",
        slug: "downtown-toronto",
        summary:
          "Toronto's most walkable core — dense, buzzy, and transit-perfect. Everything is on foot: the Financial District, King West bars, Harbourfront, and the best restaurant concentration in the city.",
        vibeTags: ["urban", "walkable", "nightlife", "professional", "buzzy"],
        bestForTags: [
          "young professionals",
          "students",
          "nightlife seekers",
          "car-free living",
        ],
        rentMin: 1800,
        rentMax: 3200,
        walkabilityScore: 99,
        nightlifeScore: 92,
        quietScore: 28,
        transitScore: 99,
        lat: 43.6532,
        lng: -79.3832,
        places: [
          {
            name: "Neo Coffee Bar",
            slug: "neo-coffee-bar",
            category: "food",
            summary:
              "Minimalist specialty coffee bar — a go-to for downtown remote workers and pre-meeting fuel.",
            priceRange: "$$",
            vibeTags: ["sleek", "focused", "specialty"],
            bestForTags: ["remote workers", "coffee lovers", "solo mornings"],
            lat: 43.6481,
            lng: -79.3716,
            reviews: [
              {
                rating: 5,
                body: "Best pour-over in the downtown core. Fast wifi and nobody judges you for camping all morning.",
                reviewerVibeTags: ["professional", "urban"],
                reviewerInterests: ["coffee", "remote work"],
              },
            ],
          },
          {
            name: "Distillery District",
            slug: "distillery-district",
            category: "nightlife",
            summary:
              "Historic Victorian industrial complex turned upscale bar and restaurant destination. Great for date nights and weekend exploring.",
            priceRange: "$$",
            vibeTags: ["historic", "upscale", "social"],
            bestForTags: ["date nights", "weekend exploring", "food and drinks"],
            lat: 43.6503,
            lng: -79.3596,
            reviews: [
              {
                rating: 4,
                body: "Romantic without being stuffy. The cobblestones and old brick make every dinner feel like an event.",
                reviewerVibeTags: ["social", "curious"],
                reviewerInterests: ["cocktails", "architecture", "dates"],
              },
            ],
          },
          {
            name: "Trinity Bellwoods Park",
            slug: "trinity-bellwoods-park",
            category: "wellness",
            summary:
              "Downtown's beloved open green space. Packed on summer weekends with picnics, dog walks, and spontaneous frisbee.",
            priceRange: "$",
            vibeTags: ["community", "outdoorsy", "social"],
            bestForTags: ["weekend resets", "dog owners", "picnics"],
            lat: 43.6478,
            lng: -79.4151,
            reviews: [
              {
                rating: 5,
                body: "The closest thing to a backyard you'll get in downtown Toronto. A lifesaver on sunny days.",
                reviewerVibeTags: ["social", "calm"],
                reviewerInterests: ["parks", "dogs", "community"],
              },
            ],
          },
          {
            name: "St. Lawrence Market",
            slug: "st-lawrence-market",
            category: "practical",
            summary:
              "One of the world's great food markets. Fresh produce, butchers, bakers, and Saturday farmers' market.",
            priceRange: "$$",
            vibeTags: ["local", "food-forward", "community"],
            bestForTags: ["grocery runs", "food explorers", "weekend errands"],
            lat: 43.6487,
            lng: -79.3715,
            reviews: [
              {
                rating: 5,
                body: "Saturday mornings here feel like the real Toronto. Grab a peameal bacon sandwich first.",
                reviewerVibeTags: ["curious", "local"],
                reviewerInterests: ["food markets", "cooking", "local produce"],
              },
            ],
          },
        ],
      },
      {
        name: "North York",
        slug: "north-york",
        summary:
          "Diverse, transit-connected, and more affordable than downtown. A top pick for newcomers and families — strong subway access along Yonge Street keeps downtown within easy reach.",
        vibeTags: [
          "diverse",
          "family-friendly",
          "multicultural",
          "transit-friendly",
          "practical",
        ],
        bestForTags: [
          "newcomers",
          "families",
          "young professionals",
          "budget-conscious renters",
        ],
        rentMin: 1500,
        rentMax: 2200,
        walkabilityScore: 72,
        nightlifeScore: 55,
        quietScore: 68,
        transitScore: 90,
        lat: 43.7615,
        lng: -79.4111,
        places: [
          {
            name: "Dineen Coffee Co.",
            slug: "dineen-coffee-co",
            category: "food",
            summary:
              "Warm, well-regarded local coffee shop popular with professionals and students along the Yonge corridor.",
            priceRange: "$$",
            vibeTags: ["warm", "local", "relaxed"],
            bestForTags: ["morning coffee", "remote workers", "casual meetups"],
            lat: 43.761,
            lng: -79.4105,
            reviews: [
              {
                rating: 4,
                body: "Feels like a neighborhood spot even though it's right on a busy corridor. Consistently good lattes.",
                reviewerVibeTags: ["professional", "multicultural"],
                reviewerInterests: ["coffee", "work from cafe"],
              },
            ],
          },
          {
            name: "Earl Bales Park",
            slug: "earl-bales-park",
            category: "wellness",
            summary:
              "Large forested park with trails, a ski hill, and open green space — a rare nature escape within city limits.",
            priceRange: "$",
            vibeTags: ["outdoorsy", "green", "calm"],
            bestForTags: ["families", "hikers", "weekend nature"],
            lat: 43.7766,
            lng: -79.4234,
            reviews: [
              {
                rating: 5,
                body: "Did not expect trails this good inside Toronto. Takes the suburban edge off North York completely.",
                reviewerVibeTags: ["outdoorsy", "family-friendly"],
                reviewerInterests: ["hiking", "nature", "running"],
              },
            ],
          },
          {
            name: "Loblaws Empress Walk",
            slug: "loblaws-empress-walk",
            category: "practical",
            summary:
              "Conveniently located full-service grocery attached to North York Centre — a daily errand anchor.",
            priceRange: "$$",
            vibeTags: ["practical", "convenient"],
            bestForTags: ["grocery runs", "newcomers", "daily errands"],
            lat: 43.7655,
            lng: -79.4108,
            reviews: [
              {
                rating: 4,
                body: "Massive selection, right on the subway. Makes North York feel genuinely self-sufficient.",
                reviewerVibeTags: ["practical", "professional"],
                reviewerInterests: ["cooking", "grocery shopping"],
              },
            ],
          },
          {
            name: "The Frog",
            slug: "the-frog",
            category: "nightlife",
            summary:
              "Casual British-style pub — the go-to after-work spot for North York's professional crowd.",
            priceRange: "$$",
            vibeTags: ["casual", "social", "neighborhood"],
            bestForTags: ["after-work drinks", "casual dates", "new friends"],
            lat: 43.761,
            lng: -79.4115,
            reviews: [
              {
                rating: 4,
                body: "Solid pints, unpretentious crowd. A good first local when you've just moved to the area.",
                reviewerVibeTags: ["social", "relaxed"],
                reviewerInterests: ["pub nights", "meeting people"],
              },
            ],
          },
        ],
      },
      {
        name: "Scarborough",
        slug: "scarborough",
        summary:
          "Toronto's most affordable and diverse district — multicultural food, waterfront bluffs, and a strong community feel. Best value for families and budget-conscious renters within the city.",
        vibeTags: [
          "diverse",
          "affordable",
          "multicultural",
          "family-friendly",
          "suburban",
        ],
        bestForTags: [
          "families",
          "newcomers",
          "budget-conscious renters",
          "students",
        ],
        rentMin: 1500,
        rentMax: 2000,
        walkabilityScore: 58,
        nightlifeScore: 42,
        quietScore: 75,
        transitScore: 68,
        lat: 43.7764,
        lng: -79.2318,
        places: [
          {
            name: "Scarborough Bluffs",
            slug: "scarborough-bluffs",
            category: "wellness",
            summary:
              "Dramatic 90-metre white cliffs over Lake Ontario — one of Toronto's most striking natural landmarks and a perfect weekend escape.",
            priceRange: "$",
            vibeTags: ["scenic", "outdoorsy", "calm"],
            bestForTags: [
              "weekend nature",
              "date spots",
              "families",
              "hikers",
            ],
            lat: 43.7068,
            lng: -79.2287,
            reviews: [
              {
                rating: 5,
                body: "You forget you're in a city. The view over the lake is genuinely breathtaking.",
                reviewerVibeTags: ["outdoorsy", "calm"],
                reviewerInterests: ["hiking", "nature", "photography"],
              },
            ],
          },
          {
            name: "Chris Jerk",
            slug: "chris-jerk",
            category: "food",
            summary:
              "Legendary Scarborough jerk chicken spot — cash only, always a line, worth every minute of the wait.",
            priceRange: "$",
            vibeTags: ["local", "casual", "food-forward"],
            bestForTags: ["cheap eats", "food explorers", "local classics"],
            lat: 43.763,
            lng: -79.2304,
            reviews: [
              {
                rating: 5,
                body: "The best jerk chicken I've had outside Jamaica. This is why Scarborough has the best food in Toronto.",
                reviewerVibeTags: ["curious", "food-forward"],
                reviewerInterests: ["Caribbean food", "local eats", "budget dining"],
              },
            ],
          },
          {
            name: "Common Good Beer Co.",
            slug: "common-good-beer-co",
            category: "nightlife",
            summary:
              "Community-focused craft brewery and taproom — a welcoming spot for Scarborough locals who want quality without the trek downtown.",
            priceRange: "$$",
            vibeTags: ["community", "casual", "local"],
            bestForTags: ["craft beer", "after-work drinks", "casual hangouts"],
            lat: 43.7541,
            lng: -79.2366,
            reviews: [
              {
                rating: 4,
                body: "Proof that Scarborough doesn't need to go downtown for a good night out. Great rotating taps.",
                reviewerVibeTags: ["social", "community"],
                reviewerInterests: ["craft beer", "local businesses"],
              },
            ],
          },
        ],
      },
      {
        name: "Etobicoke",
        slug: "etobicoke",
        summary:
          "Toronto's quieter west end — residential, spacious, and family-oriented. Waterfront parks, larger homes, and solid transit access without the downtown noise or price tag.",
        vibeTags: [
          "quiet",
          "family-friendly",
          "suburban",
          "waterfront",
          "spacious",
        ],
        bestForTags: [
          "families",
          "couples",
          "remote workers",
          "quiet lifestyle seekers",
        ],
        rentMin: 1500,
        rentMax: 2000,
        walkabilityScore: 60,
        nightlifeScore: 38,
        quietScore: 84,
        transitScore: 70,
        lat: 43.6205,
        lng: -79.5132,
        places: [
          {
            name: "Humber Bay Park",
            slug: "humber-bay-park",
            category: "wellness",
            summary:
              "Scenic waterfront park with lake views, walking trails, and the Toronto skyline as a backdrop — a hidden gem for morning runs.",
            priceRange: "$",
            vibeTags: ["scenic", "outdoorsy", "calm", "waterfront"],
            bestForTags: ["runners", "families", "couples", "weekend walks"],
            lat: 43.6234,
            lng: -79.4779,
            reviews: [
              {
                rating: 5,
                body: "The skyline view from Humber Bay is better than anything you'd see in downtown itself. A perfect morning run.",
                reviewerVibeTags: ["outdoorsy", "calm"],
                reviewerInterests: ["running", "nature", "photography"],
              },
            ],
          },
          {
            name: "Birds & Beans Cafe",
            slug: "birds-and-beans-cafe",
            category: "food",
            summary:
              "Cozy, ethically-sourced coffee shop popular with Etobicoke's work-from-home crowd. Excellent pastries.",
            priceRange: "$$",
            vibeTags: ["cozy", "ethical", "neighborhood"],
            bestForTags: ["remote workers", "morning coffee", "casual catchups"],
            lat: 43.6224,
            lng: -79.5009,
            reviews: [
              {
                rating: 4,
                body: "The kind of coffee shop that makes you glad you moved to the neighborhood. Regulars feel like community.",
                reviewerVibeTags: ["calm", "community"],
                reviewerInterests: ["coffee", "work from cafe", "sustainability"],
              },
            ],
          },
          {
            name: "GoodLife Fitness Islington",
            slug: "goodlife-fitness-islington",
            category: "wellness",
            summary:
              "Full-service gym near Islington Station — reliable equipment, classes, and a consistent local crowd.",
            priceRange: "$$",
            vibeTags: ["practical", "fitness"],
            bestForTags: ["gym-goers", "professionals", "newcomers"],
            lat: 43.6475,
            lng: -79.5269,
            reviews: [
              {
                rating: 4,
                body: "Never overcrowded, good equipment, and 5 minutes from the subway. Exactly what you want from a gym.",
                reviewerVibeTags: ["practical", "professional"],
                reviewerInterests: ["fitness", "running", "wellness"],
              },
            ],
          },
        ],
      },
      {
        name: "Mississauga",
        slug: "mississauga",
        summary: "A diverse suburban city west of Toronto known for modern residential developments, corporate offices, and waterfront Port Credit charm. Offers an excellent balance between urban amenities and spacious suburban living.",
        vibeTags: [
          "diverse",
          "family-friendly",
          "suburban",
          "professional",
          "multicultural",
          "modern",
        ],
        bestForTags: [
          "families",
          "newcomers",
          "young professionals",
          "couples",
          "remote workers",
        ],
        rentMin: 1700,
        rentMax: 2500,
        walkabilityScore: 50,
        nightlifeScore: 40,
        quietScore: 70,
        transitScore: 70,
        lat: 43.5890,
        lng: -79.6441,
        places: [
          {
            name: "Back Road Coffee Roasters",
            slug: "back-road-coffee-roasters",
            category: "food",
            summary: "Independent specialty coffee roasters near Port Credit - fantastic espresso and a great community feel.",
            priceRange: "$$",
            vibeTags: ["specialty", "cozy", "artisanal"],
            bestForTags: ["coffee lovers", "morning coffee", "locals"],
            lat: 43.5567,
            lng: -79.5889,
            reviews: [
              {
                rating: 5,
                body: "Best espresso in Mississauga. Genuinely great roasting quality and super friendly team.",
                reviewerVibeTags: ["local", "artisanal"],
                reviewerInterests: ["specialty coffee", "local businesses"],
              }
            ]
          },
          {
            name: "The Crooked Cue",
            slug: "the-crooked-cue",
            category: "nightlife",
            summary: "Vibrant upscale billiards hall and pub in Port Credit - great craft beers, local energy, and group events.",
            priceRange: "$$",
            vibeTags: ["social", "lively", "fun"],
            bestForTags: ["drinks with friends", "group hangs", "casual dates"],
            lat: 43.5555,
            lng: -79.5855,
            reviews: [
              {
                rating: 4,
                body: "Amazing atmosphere, good beer selection, and very clean tables. Excellent place to hang out with friends.",
                reviewerVibeTags: ["social", "lively"],
                reviewerInterests: ["billiards", "craft beer", "pubs"],
              }
            ]
          },
          {
            name: "Jack Darling Memorial Park",
            slug: "jack-darling-memorial-park",
            category: "wellness",
            summary: "Huge waterfront park along Lake Ontario with dog-friendly beaches, splash pads, tennis courts, and picnic areas.",
            priceRange: "$",
            vibeTags: ["waterfront", "outdoorsy", "family-friendly"],
            bestForTags: ["dog owners", "picnics", "weekend walkouts"],
            lat: 43.5350,
            lng: -79.6080,
            reviews: [
              {
                rating: 5,
                body: "Beautiful lake views and the best off-leash dog park in the city. Great place to spend a Saturday afternoon.",
                reviewerVibeTags: ["outdoorsy", "nature-focused"],
                reviewerInterests: ["dog walking", "nature", "picnics"],
              }
            ]
          },
          {
            name: "Square One Walmart",
            slug: "square-one-walmart",
            category: "practical",
            summary: "Massive supercentre in the heart of Mississauga at Square One - one-stop grocery and retail shopping.",
            priceRange: "$",
            vibeTags: ["convenient", "practical"],
            bestForTags: ["errands", "grocery runs", "newcomer basics"],
            lat: 43.5930,
            lng: -79.6430,
            reviews: [
              {
                rating: 4,
                body: "Super convenient, has absolutely everything you need under one roof. Can get busy on weekends.",
                reviewerVibeTags: ["practical", "budget-oriented"],
                reviewerInterests: ["groceries", "home supplies"],
              }
            ]
          }
        ]
      },
      {
        name: "Markham",
        slug: "markham",
        summary: "A family-oriented suburban city north of Toronto known for top-tier schools, historic Main Street Unionville, and a rich multicultural community.",
        vibeTags: [
          "family-friendly",
          "suburban",
          "multicultural",
          "upscale",
          "quiet",
          "professional",
        ],
        bestForTags: [
          "families",
          "newcomers",
          "professionals",
          "couples",
          "remote workers",
        ],
        rentMin: 1500,
        rentMax: 2500,
        walkabilityScore: 50,
        nightlifeScore: 30,
        quietScore: 80,
        transitScore: 60,
        lat: 43.8561,
        lng: -79.3370,
        places: [
          {
            name: "Alchemy Coffee",
            slug: "alchemy-coffee",
            category: "food",
            summary: "Popular modern cafe in Unionville known for artisanal brunch, great coffee, and a cozy aesthetic.",
            priceRange: "$$",
            vibeTags: ["cozy", "trendy", "brunch"],
            bestForTags: ["brunch lovers", "morning coffee", "work from cafe"],
            lat: 43.8680,
            lng: -79.3120,
            reviews: [
              {
                rating: 5,
                body: "Their brunch is exceptional and the coffee is always on point. Very cute space.",
                reviewerVibeTags: ["trendy", "social"],
                reviewerInterests: ["brunch", "coffee"],
              }
            ]
          },
          {
            name: "Rouge River Brewing",
            slug: "rouge-river-brewing",
            category: "nightlife",
            summary: "Local craft brewery near Main Street Unionville - fantastic rotating IPA and sour selections with a relaxed taproom.",
            priceRange: "$$",
            vibeTags: ["relaxed", "craft", "local"],
            bestForTags: ["beer enthusiasts", "casual drinks", "locals"],
            lat: 43.8741,
            lng: -79.2635,
            reviews: [
              {
                rating: 5,
                body: "Best hazy IPAs in the York region. Great local vibe in the taproom.",
                reviewerVibeTags: ["local", "relaxed"],
                reviewerInterests: ["craft beer", "local business"],
              }
            ]
          },
          {
            name: "Toogood Pond Park",
            slug: "toogood-pond-park",
            category: "wellness",
            summary: "Beautiful 33-hectare park in historic Unionville featuring a large pond, walking trails, and peaceful natural settings.",
            priceRange: "$",
            vibeTags: ["scenic", "calm", "nature"],
            bestForTags: ["nature walks", "photographers", "families"],
            lat: 43.8740,
            lng: -79.3100,
            reviews: [
              {
                rating: 5,
                body: "So peaceful and scenic. The loop walk around the pond is lovely in any season.",
                reviewerVibeTags: ["nature-loving", "calm"],
                reviewerInterests: ["walking", "scenery", "nature"],
              }
            ]
          },
          {
            name: "First Markham Place",
            slug: "first-markham-place",
            category: "practical",
            summary: "Major Asian shopping centre and food court featuring a wide variety of shops, bubble tea, and international grocers.",
            priceRange: "$$",
            vibeTags: ["busy", "diverse", "practical"],
            bestForTags: ["grocery shopping", "cheap eats", "errands"],
            lat: 43.8420,
            lng: -79.3520,
            reviews: [
              {
                rating: 4,
                body: "Unbelievable selection of Asian food in the food court. A must-visit for grocery shopping.",
                reviewerVibeTags: ["food-forward", "practical"],
                reviewerInterests: ["dining", "asian groceries", "errands"],
              }
            ]
          }
        ]
      },
      {
        name: "Vaughan",
        slug: "vaughan",
        summary: "A fast-growing suburban city north of Toronto with direct TTC subway access at VMC, shopping at Vaughan Mills, and modern family neighborhoods.",
        vibeTags: [
          "family-friendly",
          "suburban",
          "modern",
          "upscale",
          "professional",
          "growing",
        ],
        bestForTags: [
          "families",
          "professionals",
          "couples",
          "newcomers",
          "remote workers",
        ],
        rentMin: 1800,
        rentMax: 2500,
        walkabilityScore: 50,
        nightlifeScore: 40,
        quietScore: 75,
        transitScore: 80,
        lat: 43.8563,
        lng: -79.5085,
        places: [
          {
            name: "Balzac's Coffee",
            slug: "balzacs-coffee-vaughan",
            category: "food",
            summary: "Artistic specialty cafe in Vaughan Metropolitan Centre - great for workspace and locally roasted coffee.",
            priceRange: "$$",
            vibeTags: ["creative", "modern", "spacious"],
            bestForTags: ["remote workers", "coffee lovers", "work from cafe"],
            lat: 43.7970,
            lng: -79.5280,
            reviews: [
              {
                rating: 4,
                body: "Very cool design, spacious, and right next to the subway station. Perfect for working from home.",
                reviewerVibeTags: ["professional", "creative"],
                reviewerInterests: ["coffee", "remote work"],
              }
            ]
          },
          {
            name: "Bar 6ix",
            slug: "bar-6ix",
            category: "nightlife",
            summary: "Popular sports bar and grill offering a lively atmosphere, craft beers, cocktails, and weekend entertainment.",
            priceRange: "$$",
            vibeTags: ["lively", "social", "energetic"],
            bestForTags: ["sports fans", "weekend drinks", "nightlife"],
            lat: 43.7910,
            lng: -79.5400,
            reviews: [
              {
                rating: 4,
                body: "Great wings, plenty of screens for the game, and a fun vibe on a Friday night.",
                reviewerVibeTags: ["social", "lively"],
                reviewerInterests: ["sports", "drinks", "pub food"],
              }
            ]
          },
          {
            name: "Boyd Conservation Park",
            slug: "boyd-conservation-park",
            category: "wellness",
            summary: "Massive natural park along the Humber River valley - perfect for hikes, bird watching, and large outdoor picnics.",
            priceRange: "$",
            vibeTags: ["nature", "serene", "outdoorsy"],
            bestForTags: ["hikers", "families", "picnic outings"],
            lat: 43.8120,
            lng: -79.5890,
            reviews: [
              {
                rating: 5,
                body: "Beautiful trails right in the middle of Vaughan. Feels completely isolated from the suburb.",
                reviewerVibeTags: ["nature-loving", "active"],
                reviewerInterests: ["hiking", "picnics", "nature"],
              }
            ]
          },
          {
            name: "Vaughan Mills",
            slug: "vaughan-mills-shopping",
            category: "practical",
            summary: "One of the largest outlet malls in Canada, featuring hundreds of retailers, entertainment options, and services.",
            priceRange: "$$",
            vibeTags: ["retail-hub", "busy", "practical"],
            bestForTags: ["shopping runs", "errands", "entertainment"],
            lat: 43.8250,
            lng: -79.5380,
            reviews: [
              {
                rating: 4,
                body: "Unrivaled shopping options. Super practical for buying clothes or home goods, though parking gets busy.",
                reviewerVibeTags: ["practical", "retail-oriented"],
                reviewerInterests: ["shopping", "errands"],
              }
            ]
          }
        ]
      },
      {
        name: "Richmond Hill",
        slug: "richmond-hill",
        summary: "An affluent, calm suburban community north of Toronto known for gorgeous parks, Lake Wilcox, top-rated schools, and residential peace.",
        vibeTags: [
          "family-friendly",
          "quiet",
          "upscale",
          "suburban",
          "professional",
          "residential",
        ],
        bestForTags: [
          "families",
          "professionals",
          "couples",
          "newcomers",
          "remote workers",
        ],
        rentMin: 1500,
        rentMax: 2400,
        walkabilityScore: 50,
        nightlifeScore: 30,
        quietScore: 85,
        transitScore: 60,
        lat: 43.8828,
        lng: -79.4403,
        places: [
          {
            name: "Covernotes Coffee House",
            slug: "covernotes-coffee-house",
            category: "food",
            summary: "Independent bookstore and cafe inside a historic building - cozy vintage vibe with local coffee and pastries.",
            priceRange: "$$",
            vibeTags: ["cozy", "vintage", "relaxed"],
            bestForTags: ["readers", "solo mornings", "cozy dates"],
            lat: 43.8790,
            lng: -79.4380,
            reviews: [
              {
                rating: 5,
                body: "So cozy! The combination of books, coffee, and history makes this the best cafe in Richmond Hill.",
                reviewerVibeTags: ["calm", "curious"],
                reviewerInterests: ["reading", "coffee", "cozy spots"],
              }
            ]
          },
          {
            name: "Richmond Hill Tavern",
            slug: "richmond-hill-tavern",
            category: "nightlife",
            summary: "Classic neighborhood pub serving craft beers, pub classics, and live music in a warm setting.",
            priceRange: "$$",
            vibeTags: ["warm", "neighborhood-favorite", "relaxed"],
            bestForTags: ["casual beers", "locals", "live music"],
            lat: 43.8640,
            lng: -79.4410,
            reviews: [
              {
                rating: 4,
                body: "Friendly service, good pub food, and a fantastic neighborhood atmosphere. Been a staple for years.",
                reviewerVibeTags: ["local", "social"],
                reviewerInterests: ["pub food", "live music", "casual drinks"],
              }
            ]
          },
          {
            name: "Lake Wilcox Park",
            slug: "lake-wilcox-park",
            category: "wellness",
            summary: "Stunning lakeside park with a paved promenade, splash pad, canoe club, and scenic sunset lookouts.",
            priceRange: "$",
            vibeTags: ["scenic", "waterfront", "calm"],
            bestForTags: ["sunset walks", "families", "couples"],
            lat: 43.9530,
            lng: -79.4280,
            reviews: [
              {
                rating: 5,
                body: "The sunset walks here are beautiful. Great trails and lovely lakeside atmosphere.",
                reviewerVibeTags: ["outdoorsy", "romantic"],
                reviewerInterests: ["scenery", "walking", "nature"],
              }
            ]
          },
          {
            name: "Hillcrest Mall",
            slug: "hillcrest-mall-shopping",
            category: "practical",
            summary: "Clean, modern shopping centre featuring major fashion brands, dining, and practical newcomer services.",
            priceRange: "$$",
            vibeTags: ["clean", "practical", "retail-hub"],
            bestForTags: ["errands", "clothing shopping", "grocery runs"],
            lat: 43.8600,
            lng: -79.4300,
            reviews: [
              {
                rating: 4,
                body: "Nice mall, not too crowded, has great stores and newcomer resources.",
                reviewerVibeTags: ["practical", "family-friendly"],
                reviewerInterests: ["shopping", "services"],
              }
            ]
          }
        ]
      },
      {
        name: "Brampton",
        slug: "brampton",
        summary: "A rapidly growing multicultural city northwest of Toronto known for family-friendly communities, spacious parks, and relatively affordable renting.",
        vibeTags: [
          "family-friendly",
          "diverse",
          "multicultural",
          "suburban",
          "growing",
          "affordable",
        ],
        bestForTags: [
          "families",
          "newcomers",
          "couples",
          "budget-conscious renters",
          "remote workers",
        ],
        rentMin: 1300,
        rentMax: 2500,
        walkabilityScore: 40,
        nightlifeScore: 30,
        quietScore: 75,
        transitScore: 60,
        lat: 43.7315,
        lng: -79.7624,
        places: [
          {
            name: "Segovia Coffee",
            slug: "segovia-coffee",
            category: "food",
            summary: "Specialty coffee shop in downtown Brampton serving Nicaraguan espresso and fresh house-baked pastries.",
            priceRange: "$$",
            vibeTags: ["artisanal", "cozy", "specialty"],
            bestForTags: ["coffee lovers", "work from cafe", "brunch"],
            lat: 43.6850,
            lng: -79.7600,
            reviews: [
              {
                rating: 5,
                body: "Best coffee in Brampton, hands down. Nicaraguan beans are fantastic.",
                reviewerVibeTags: ["local", "specialty"],
                reviewerInterests: ["coffee", "bakery"],
              }
            ]
          },
          {
            name: "Tracks Brew Pub",
            slug: "tracks-brew-pub",
            category: "nightlife",
            summary: "Cozy downtown Brampton pub known for craft beers, traditional comfort foods, and a welcoming neighborhood feel.",
            priceRange: "$$",
            vibeTags: ["cozy", "neighborhood", "warm"],
            bestForTags: ["drinks with friends", "casual dinner", "locals"],
            lat: 43.6870,
            lng: -79.7630,
            reviews: [
              {
                rating: 4,
                body: "Friendly bartenders, great draft selection, and good wings. Downtown Brampton staple.",
                reviewerVibeTags: ["local", "casual"],
                reviewerInterests: ["pub food", "craft beer"],
              }
            ]
          },
          {
            name: "Heart Lake Conservation Area",
            slug: "heart-lake-conservation",
            category: "wellness",
            summary: "Huge natural park with swimming, zip lining, boat rentals, and scenic hiking trails around a heart-shaped lake.",
            priceRange: "$",
            vibeTags: ["nature", "active", "outdoorsy"],
            bestForTags: ["families", "hikers", "outdoor activities"],
            lat: 43.7480,
            lng: -79.7890,
            reviews: [
              {
                rating: 5,
                body: "Perfect place for a family weekend trip. Hiking trails are well-maintained and the zip line is super fun.",
                reviewerVibeTags: ["outdoorsy", "active"],
                reviewerInterests: ["hiking", "outdoor sports", "family outings"],
              }
            ]
          },
          {
            name: "Bramalea City Centre",
            slug: "bramalea-city-centre-mall",
            category: "practical",
            summary: "Spacious shopping centre featuring major department stores, dining, and transit terminal connectivity.",
            priceRange: "$$",
            vibeTags: ["retail-hub", "spacious", "practical"],
            bestForTags: ["shopping", "errands", "newcomers"],
            lat: 43.7150,
            lng: -79.7210,
            reviews: [
              {
                rating: 4,
                body: "Massive selection of stores and services, and the transit hub makes it easy to get anywhere.",
                reviewerVibeTags: ["practical", "family-friendly"],
                reviewerInterests: ["shopping", "transit"],
              }
            ]
          }
        ]
      },
    ],
  },

  // ─── MUMBAI ──────────────────────────────────────────────────────────────
  {
    name: "Mumbai",
    slug: "mumbai",
    country: "India",
    neighborhoods: [
      {
        name: "Bandra West",
        slug: "bandra-west",
        summary:
          "The Queen of the Suburbs — cosmopolitan, coastal, and cafe-heavy. Old colonial lanes meet Bollywood energy, Carter Road sunsets, and Mumbai's best nightlife south of Andheri.",
        vibeTags: [
          "artsy",
          "coastal",
          "nightlife",
          "trendy",
          "cafe-culture",
          "upscale",
          "social",
        ],
        bestForTags: [
          "young professionals",
          "couples",
          "remote workers",
          "cafe hopping",
          "nightlife",
        ],
        rentMin: 800,
        rentMax: 1600,
        walkabilityScore: 72,
        nightlifeScore: 88,
        quietScore: 38,
        transitScore: 85,
        lat: 19.0596,
        lng: 72.8295,
        places: [
          {
            name: "Carter Road Promenade",
            slug: "carter-road-promenade",
            category: "wellness",
            summary:
              "Romantic seaside walkway with sunset views — Bandra's best decompression walk and the city's most iconic evening stroll.",
            priceRange: "$",
            vibeTags: ["coastal", "romantic", "calm", "outdoorsy"],
            bestForTags: [
              "evening walks",
              "couples",
              "solo resets",
              "sunsets",
            ],
            lat: 19.0702,
            lng: 72.8226,
            reviews: [
              {
                rating: 5,
                body: "When the city gets too loud, this walk fixes everything. Sunset at Carter Road is non-negotiable.",
                reviewerVibeTags: ["calm", "coastal"],
                reviewerInterests: ["walking", "sea views", "sunsets"],
              },
            ],
          },
          {
            name: "Toto's Garage",
            slug: "totos-garage",
            category: "nightlife",
            summary:
              "Legendary hidden-gem Bandra bar — a local institution that never gets old. No frills, loud music, and the best bar crawl starting point in the suburb.",
            priceRange: "$$",
            vibeTags: ["local", "dive-bar", "social", "iconic"],
            bestForTags: ["nightlife", "bar crawls", "new friends", "locals"],
            lat: 19.0605,
            lng: 72.8296,
            reviews: [
              {
                rating: 5,
                body: "Every Bandra local swears by this place. Hidden, loud, and packed — exactly what a good bar should be.",
                reviewerVibeTags: ["social", "nightlife"],
                reviewerInterests: ["bars", "live music", "nightlife"],
              },
            ],
          },
          {
            name: "The Workables",
            slug: "the-workables",
            category: "practical",
            summary:
              "Dedicated co-working space on Pali Hill with dedicated desks and a creative professional community. 4.2★ rating.",
            priceRange: "$$",
            vibeTags: ["productive", "creative", "professional"],
            bestForTags: ["remote workers", "freelancers", "startup crowd"],
            lat: 19.0618,
            lng: 72.8301,
            reviews: [
              {
                rating: 4,
                body: "Reliable wifi, good crowd, and the Pali Hill location means great lunch options nearby.",
                reviewerVibeTags: ["professional", "creative"],
                reviewerInterests: ["co-working", "startups", "productivity"],
              },
            ],
          },
          {
            name: "Jogger's Park",
            slug: "joggers-park",
            category: "wellness",
            summary:
              "Seaside jogging track and park with historic significance — a Bandra morning institution for runners and walkers.",
            priceRange: "$",
            vibeTags: ["outdoorsy", "community", "coastal", "calm"],
            bestForTags: ["runners", "morning walks", "fitness routines"],
            lat: 19.0651,
            lng: 72.8231,
            reviews: [
              {
                rating: 4,
                body: "Best morning run in Bandra. Sea air, a solid track, and always a good energy in the early hours.",
                reviewerVibeTags: ["outdoorsy", "calm"],
                reviewerInterests: ["running", "fitness", "mornings"],
              },
            ],
          },
        ],
      },
      {
        name: "Powai",
        slug: "powai",
        summary:
          "Mumbai's premier IT township — planned, clean, and self-contained. Google, Microsoft, and Accenture offices are all here. A Silicon Valley-style campus lifestyle with Powai Lake at its heart.",
        vibeTags: [
          "tech-hub",
          "corporate",
          "family-friendly",
          "planned",
          "modern",
          "upscale",
        ],
        bestForTags: [
          "tech workers",
          "families",
          "remote workers",
          "corporate professionals",
        ],
        rentMin: 550,
        rentMax: 1800,
        walkabilityScore: 78,
        nightlifeScore: 45,
        quietScore: 78,
        transitScore: 65,
        lat: 19.1176,
        lng: 72.906,
        places: [
          {
            name: "Powai Lake Promenade",
            slug: "powai-lake-promenade",
            category: "wellness",
            summary:
              "Romantic lakeside promenade and jogging stretch — a peaceful evening destination unlike anything else in Mumbai.",
            priceRange: "$",
            vibeTags: ["scenic", "calm", "outdoorsy", "green"],
            bestForTags: [
              "evening walks",
              "couples",
              "morning runs",
              "families",
            ],
            lat: 19.1197,
            lng: 72.9081,
            reviews: [
              {
                rating: 5,
                body: "Makes Powai feel like a different city entirely. The lake at sunset is something special for Mumbai.",
                reviewerVibeTags: ["calm", "professional"],
                reviewerInterests: ["walking", "work-life balance", "nature"],
              },
            ],
          },
          {
            name: "Awfis Powai",
            slug: "awfis-powai",
            category: "practical",
            summary:
              "Popular co-working hub in the IT zone — 4.3★, flexible plans, and a crowd of tech professionals and startup founders.",
            priceRange: "$$",
            vibeTags: ["productive", "tech", "professional"],
            bestForTags: ["remote workers", "tech workers", "freelancers"],
            lat: 19.116,
            lng: 72.9068,
            reviews: [
              {
                rating: 4,
                body: "Best co-working in the area. The crowd is all tech, which means the wifi is taken seriously.",
                reviewerVibeTags: ["professional", "tech"],
                reviewerInterests: ["co-working", "tech", "productivity"],
              },
            ],
          },
          {
            name: "Bar Ezekiel",
            slug: "bar-ezekiel",
            category: "nightlife",
            summary:
              "Upscale pub popular with the Powai IT crowd — a reliable spot for after-work drinks without heading into the city.",
            priceRange: "$$",
            vibeTags: ["upscale", "social", "corporate"],
            bestForTags: [
              "after-work drinks",
              "corporate crowd",
              "date nights",
            ],
            lat: 19.1155,
            lng: 72.9071,
            reviews: [
              {
                rating: 4,
                body: "Good cocktails and a calm enough vibe for actual conversation. Saves you the Bandra commute on a Tuesday.",
                reviewerVibeTags: ["professional", "social"],
                reviewerInterests: ["cocktails", "after-work", "tech industry"],
              },
            ],
          },
        ],
      },
      {
        name: "Andheri West",
        slug: "andheri-west",
        summary:
          "Mumbai's media and entertainment nerve centre — film studios, casting agencies, and a diverse mix of young professionals. More affordable than Bandra with excellent transit via Western Line and Metro Line 1.",
        vibeTags: [
          "entertainment-hub",
          "young-professionals",
          "fast-paced",
          "diverse",
          "well-connected",
          "startup-friendly",
        ],
        bestForTags: [
          "young professionals",
          "students",
          "media industry workers",
          "remote workers",
        ],
        rentMin: 450,
        rentMax: 800,
        walkabilityScore: 70,
        nightlifeScore: 72,
        quietScore: 48,
        transitScore: 88,
        lat: 19.136,
        lng: 72.826,
        places: [
          {
            name: "Oshiwara River Park",
            slug: "oshiwara-river-park",
            category: "wellness",
            summary:
              "Green riverside jogging and walking park — a rare calm pocket in Andheri's fast-paced suburban sprawl.",
            priceRange: "$",
            vibeTags: ["outdoorsy", "green", "calm"],
            bestForTags: ["runners", "morning walks", "nature breaks"],
            lat: 19.137,
            lng: 72.8242,
            reviews: [
              {
                rating: 4,
                body: "Hard to believe this exists in Andheri. A genuinely peaceful morning run track.",
                reviewerVibeTags: ["outdoorsy", "calm"],
                reviewerInterests: ["running", "fitness", "nature"],
              },
            ],
          },
          {
            name: "Toffees & Barrels",
            slug: "toffees-and-barrels",
            category: "nightlife",
            summary:
              "Popular local pub and the go-to nightlife anchor for Andheri West's young professional crowd.",
            priceRange: "$$",
            vibeTags: ["local", "social", "casual"],
            bestForTags: ["nightlife", "after-work drinks", "casual dates"],
            lat: 19.1354,
            lng: 72.8274,
            reviews: [
              {
                rating: 4,
                body: "Always a good crowd on weekends. More relaxed than Bandra but still a proper night out.",
                reviewerVibeTags: ["social", "young-professional"],
                reviewerInterests: ["nightlife", "bars", "meeting people"],
              },
            ],
          },
          {
            name: "Innov8 Andheri",
            slug: "innov8-andheri",
            category: "practical",
            summary:
              "Premium co-working space with private cabins and dedicated desks — 5.0★ rated and popular with startups and media professionals.",
            priceRange: "$$",
            vibeTags: ["productive", "startup", "premium"],
            bestForTags: [
              "remote workers",
              "startups",
              "media professionals",
              "freelancers",
            ],
            lat: 19.1348,
            lng: 72.8265,
            reviews: [
              {
                rating: 5,
                body: "Best co-working setup in Andheri. Private cabins if you need focus, open desks if you want energy.",
                reviewerVibeTags: ["professional", "startup"],
                reviewerInterests: ["co-working", "startups", "productivity"],
              },
            ],
          },
        ],
      },
      {
        name: "Dadar",
        slug: "dadar",
        summary:
          "The beating heart of central Mumbai — Shivaji Park, the best transit junction in the city, Maharashtrian heritage, and genuinely mid-range pricing. A local's Mumbai without the tourist veneer.",
        vibeTags: [
          "local-mumbai",
          "traditional",
          "community-oriented",
          "transit-hub",
          "diverse",
          "central",
        ],
        bestForTags: [
          "budget-conscious renters",
          "families",
          "students",
          "solo movers",
          "commuters",
        ],
        rentMin: 420,
        rentMax: 1100,
        walkabilityScore: 74,
        nightlifeScore: 55,
        quietScore: 50,
        transitScore: 98,
        lat: 19.0176,
        lng: 72.8429,
        places: [
          {
            name: "Shivaji Park",
            slug: "shivaji-park",
            category: "wellness",
            summary:
              "The largest open green space in South Mumbai — a Maharashtrian cultural landmark and community hub with a famous jogging track and sea breeze.",
            priceRange: "$",
            vibeTags: ["outdoorsy", "community", "local", "heritage"],
            bestForTags: [
              "morning runs",
              "families",
              "evening walks",
              "community events",
            ],
            lat: 19.0248,
            lng: 72.8405,
            reviews: [
              {
                rating: 5,
                body: "The soul of Dadar. Running here on a Sunday morning with the sea breeze is one of Mumbai's best free experiences.",
                reviewerVibeTags: ["local", "outdoorsy", "community"],
                reviewerInterests: ["running", "parks", "Mumbai culture"],
              },
            ],
          },
          {
            name: "Patil's Missal",
            slug: "patils-missal",
            category: "food",
            summary:
              "A Dadar institution for authentic Maharashtrian Missal Pav at about $1 — one of the cheapest and most satisfying breakfasts in the neighborhood.",
            priceRange: "$",
            vibeTags: ["local", "traditional", "budget", "authentic"],
            bestForTags: ["cheap eats", "local food", "breakfast", "regulars"],
            lat: 19.0203,
            lng: 72.8437,
            reviews: [
              {
                rating: 5,
                body: "About $1 for the best Missal in Mumbai. This is why Dadar locals never need to go to Bandra.",
                reviewerVibeTags: ["local", "budget-conscious"],
                reviewerInterests: [
                  "local food",
                  "street food",
                  "Maharashtrian cuisine",
                ],
              },
            ],
          },
          {
            name: "Dadar Market",
            slug: "dadar-market",
            category: "practical",
            summary:
              "Vibrant daily market with fresh produce, groceries, pharmacy, and a world-famous flower market — the best daily essentials hub in central Mumbai.",
            priceRange: "$",
            vibeTags: ["local", "practical", "community", "vibrant"],
            bestForTags: [
              "grocery runs",
              "daily essentials",
              "fresh produce",
              "flowers",
            ],
            lat: 19.0196,
            lng: 72.8444,
            reviews: [
              {
                rating: 4,
                body: "The flower market alone is worth visiting. Practical, chaotic, and genuinely Mumbai.",
                reviewerVibeTags: ["local", "practical"],
                reviewerInterests: ["markets", "fresh produce", "local culture"],
              },
            ],
          },
        ],
      },
    ],
  },

  // ─── NEW YORK CITY ───────────────────────────────────────────────────────
  {
    name: "New York City",
    slug: "nyc",
    country: "United States",
    neighborhoods: [
      {
        name: "Astoria",
        slug: "astoria",
        summary:
          "Neighborly Queens blocks with food from everywhere, solid N/W train access to Midtown, and a softer landing than Manhattan. One of NYC's best value-for-money neighborhoods — a real community feel without paying Brooklyn prices.",
        vibeTags: [
          "diverse",
          "food-forward",
          "neighborly",
          "multicultural",
          "walkable",
          "community",
        ],
        bestForTags: [
          "newcomers",
          "budget-aware renters",
          "food explorers",
          "commuters",
          "families",
        ],
        rentMin: 2300,
        rentMax: 3800,
        walkabilityScore: 88,
        nightlifeScore: 68,
        quietScore: 61,
        transitScore: 82,
        lat: 40.7644,
        lng: -73.9235,
        places: [
          {
            name: "Museum of the Moving Image",
            slug: "museum-of-the-moving-image",
            category: "practical",
            summary:
              "A neighborhood cultural anchor dedicated to film and media — easy to revisit, excellent for rainy-day solo exploring.",
            priceRange: "$$",
            vibeTags: ["creative", "curious", "local-anchor"],
            bestForTags: ["film lovers", "rainy days", "solo exploring"],
            lat: 40.7563,
            lng: -73.9239,
            reviews: [
              {
                rating: 5,
                body: "A great reminder that your neighborhood can have real culture nearby. The Jim Henson exhibit alone is worth it.",
                reviewerVibeTags: ["curious", "creative"],
                reviewerInterests: ["film", "museums", "design"],
              },
            ],
          },
          {
            name: "The Bonnie",
            slug: "the-bonnie",
            category: "nightlife",
            summary:
              "Warm neighborhood bar with excellent craft cocktails — all the quality of Manhattan without the attitude or price. The go-to for first drinks after moving in.",
            priceRange: "$$",
            vibeTags: ["social", "warm", "neighborhood", "craft"],
            bestForTags: [
              "casual dates",
              "new friends",
              "weeknight drinks",
              "craft cocktails",
            ],
            lat: 40.7723,
            lng: -73.9168,
            reviews: [
              {
                rating: 4,
                body: "Friendly enough for a first local drink after moving in. Bartenders actually talk to you here.",
                reviewerVibeTags: ["social", "low-key"],
                reviewerInterests: ["cocktails", "meeting people", "nightlife"],
              },
            ],
          },
          {
            name: "Astoria Park",
            slug: "astoria-park",
            category: "wellness",
            summary:
              "60-acre riverside park with Hell Gate Bridge and Manhattan skyline views — the best outdoor space in Queens and one of NYC's most underrated parks.",
            priceRange: "$",
            vibeTags: ["outdoorsy", "scenic", "community"],
            bestForTags: ["runners", "summer days", "families", "picnics"],
            lat: 40.7778,
            lng: -73.9297,
            reviews: [
              {
                rating: 5,
                body: "Best park view in New York that nobody talks about. The bridge, the river, the skyline — all from Queens.",
                reviewerVibeTags: ["outdoorsy", "curious"],
                reviewerInterests: ["running", "parks", "photography"],
              },
            ],
          },
          {
            name: "Taqueria Coatzingo",
            slug: "taqueria-coatzingo",
            category: "food",
            summary:
              "Astoria's beloved authentic Mexican taco institution — cash-friendly, always packed, and consistently the best cheap eat in the neighborhood.",
            priceRange: "$",
            vibeTags: ["local", "casual", "food-forward", "authentic"],
            bestForTags: [
              "cheap eats",
              "food explorers",
              "quick lunch",
              "groups",
            ],
            lat: 40.756,
            lng: -73.9252,
            reviews: [
              {
                rating: 5,
                body: "This is why I tell every new-mover to Astoria: best tacos per dollar in all of NYC, right here.",
                reviewerVibeTags: ["food-forward", "multicultural"],
                reviewerInterests: ["street food", "Mexican food", "cheap eats"],
              },
            ],
          },
        ],
      },
      {
        name: "Jackson Heights",
        slug: "jackson-heights",
        summary:
          "One of the world's most diverse neighborhoods — a UNESCO-recognized global food destination in Queens. South Asian, Latin American, Tibetan, and Colombian all within a few blocks. Most affordable livable neighborhood in NYC with exceptional transit.",
        vibeTags: [
          "highly-diverse",
          "food-obsessed",
          "community-driven",
          "multicultural",
          "affordable",
          "authentic",
        ],
        bestForTags: [
          "newcomers",
          "families",
          "budget-conscious renters",
          "food explorers",
          "remote workers",
        ],
        rentMin: 1900,
        rentMax: 2800,
        walkabilityScore: 92,
        nightlifeScore: 55,
        quietScore: 58,
        transitScore: 92,
        lat: 40.7498,
        lng: -73.8909,
        places: [
          {
            name: "Birria Landia",
            slug: "birria-landia",
            category: "food",
            summary:
              "Famous birria taco truck that's become a neighborhood landmark — always a line, always worth it. One of the best cheap eats in all of New York City.",
            priceRange: "$",
            vibeTags: ["iconic", "local", "food-forward", "casual"],
            bestForTags: [
              "cheap eats",
              "food explorers",
              "street food",
              "lunch",
            ],
            lat: 40.7496,
            lng: -73.8916,
            reviews: [
              {
                rating: 5,
                body: "A taco that makes you understand why people move to Jackson Heights and never leave. Unmissable.",
                reviewerVibeTags: ["food-forward", "curious"],
                reviewerInterests: [
                  "street food",
                  "Mexican food",
                  "food exploration",
                ],
              },
            ],
          },
          {
            name: "Travers Park",
            slug: "travers-park",
            category: "wellness",
            summary:
              "The beating heart of Jackson Heights outdoor life — great lawn, playgrounds, basketball courts, and community events all year round.",
            priceRange: "$",
            vibeTags: ["community", "outdoorsy", "family-friendly"],
            bestForTags: [
              "families",
              "community events",
              "weekend hangs",
              "sports",
            ],
            lat: 40.7519,
            lng: -73.8877,
            reviews: [
              {
                rating: 4,
                body: "This park is the neighborhood. Every culture, age, and background comes together here on a Saturday afternoon.",
                reviewerVibeTags: ["community", "diverse"],
                reviewerInterests: ["community", "parks", "sports"],
              },
            ],
          },
          {
            name: "Espresso 77",
            slug: "espresso-77",
            category: "food",
            summary:
              "Established independent espresso bar with a relaxed atmosphere and friendly staff — a reliable work-from-café anchor in the neighborhood.",
            priceRange: "$",
            vibeTags: ["cozy", "local", "relaxed"],
            bestForTags: [
              "remote workers",
              "morning coffee",
              "casual meetups",
            ],
            lat: 40.7489,
            lng: -73.8913,
            reviews: [
              {
                rating: 4,
                body: "Unpretentious, consistent, and always welcoming. The kind of coffee shop every neighborhood deserves.",
                reviewerVibeTags: ["practical", "community"],
                reviewerInterests: ["coffee", "work from cafe", "local spots"],
              },
            ],
          },
          {
            name: "34th Avenue Open Streets",
            slug: "34th-avenue-open-streets",
            category: "wellness",
            summary:
              "1.3-mile car-free promenade transformed into a linear park — perfect for evening walks, biking, and connecting with neighbors from every background.",
            priceRange: "$",
            vibeTags: ["community", "outdoorsy", "vibrant", "social"],
            bestForTags: [
              "evening walks",
              "cycling",
              "community",
              "families",
            ],
            lat: 40.7487,
            lng: -73.8891,
            reviews: [
              {
                rating: 5,
                body: "The open street is the best thing that's happened to this neighborhood. A real public space for real people.",
                reviewerVibeTags: ["community", "diverse"],
                reviewerInterests: ["walking", "cycling", "community spaces"],
              },
            ],
          },
        ],
      },
      {
        name: "Park Slope",
        slug: "park-slope",
        summary:
          "Leafy brownstone Brooklyn with Prospect Park as the backyard, strong subway access, and a calmer neighborhood rhythm. It is one of NYC's best fits for people who want cafes, parks, safety, and community more than late-night chaos.",
        vibeTags: ["leafy", "brownstone", "family-friendly", "walkable", "calm"],
        bestForTags: [
          "park lovers",
          "families",
          "remote workers",
          "quiet weekends",
          "coffee shop regulars",
        ],
        rentMin: 3000,
        rentMax: 5200,
        walkabilityScore: 91,
        nightlifeScore: 58,
        quietScore: 78,
        transitScore: 86,
        lat: 40.6728,
        lng: -73.9772,
        places: [
          {
            name: "Prospect Park",
            slug: "prospect-park",
            category: "wellness",
            summary:
              "Brooklyn's big green reset button — meadows, trails, a lake, weekend picnics, and enough space to make NYC feel breathable.",
            priceRange: "$",
            vibeTags: ["green", "community", "outdoorsy"],
            bestForTags: ["runners", "families", "weekend resets", "dog owners"],
            lat: 40.6602,
            lng: -73.969,
            reviews: [],
          },
          {
            name: "Cafe Regular",
            slug: "cafe-regular",
            category: "food",
            summary:
              "Tiny, beloved neighborhood cafe with a very local feel — ideal for slow mornings and becoming a regular.",
            priceRange: "$$",
            vibeTags: ["cozy", "local", "low-key"],
            bestForTags: ["coffee lovers", "solo mornings", "remote workers"],
            lat: 40.6748,
            lng: -73.9755,
            reviews: [],
          },
        ],
      },
      {
        name: "Upper West Side",
        slug: "upper-west-side",
        summary:
          "Classic Manhattan living between Central Park and Riverside Park, with museums, bookstores, subway access, and a quieter residential feel than downtown. Great if you want walkability without constant nightlife noise.",
        vibeTags: ["classic", "residential", "cultured", "park-rich", "walkable"],
        bestForTags: [
          "museum people",
          "park lovers",
          "families",
          "quiet Manhattan",
          "car-free living",
        ],
        rentMin: 3300,
        rentMax: 6200,
        walkabilityScore: 96,
        nightlifeScore: 50,
        quietScore: 72,
        transitScore: 92,
        lat: 40.787,
        lng: -73.9754,
        places: [
          {
            name: "Central Park",
            slug: "central-park-uws",
            category: "wellness",
            summary:
              "The neighborhood's eastern backyard — morning runs, museum walks, weekend picnics, and instant access to NYC's most iconic green space.",
            priceRange: "$",
            vibeTags: ["iconic", "green", "calm"],
            bestForTags: ["runners", "walkers", "families", "weekend resets"],
            lat: 40.7829,
            lng: -73.9654,
            reviews: [],
          },
          {
            name: "Zabar's",
            slug: "zabars",
            category: "practical",
            summary:
              "A legendary Upper West Side food institution for bagels, smoked fish, coffee, pantry staples, and weekend errands that feel local.",
            priceRange: "$$",
            vibeTags: ["classic", "local", "food-forward"],
            bestForTags: ["grocery runs", "bagel people", "home cooks"],
            lat: 40.7857,
            lng: -73.9762,
            reviews: [],
          },
        ],
      },
      {
        name: "East Village",
        slug: "east-village",
        summary:
          "Dense, expressive downtown Manhattan with ramen shops, dive bars, tiny music venues, vintage stores, and late-night energy on nearly every block. Best for people who want city intensity and social life immediately outside the door.",
        vibeTags: ["downtown", "nightlife", "creative", "dense", "food-heavy"],
        bestForTags: [
          "nightlife seekers",
          "food explorers",
          "students",
          "young professionals",
          "walk-everywhere living",
        ],
        rentMin: 3000,
        rentMax: 5200,
        walkabilityScore: 99,
        nightlifeScore: 96,
        quietScore: 28,
        transitScore: 91,
        lat: 40.7265,
        lng: -73.9815,
        places: [
          {
            name: "Tompkins Square Park",
            slug: "tompkins-square-park",
            category: "wellness",
            summary:
              "The East Village's central outdoor room — dog runs, people-watching, weekend hangs, and a strong neighborhood identity.",
            priceRange: "$",
            vibeTags: ["local", "social", "gritty"],
            bestForTags: ["dog owners", "people watching", "short walks"],
            lat: 40.7265,
            lng: -73.9815,
            reviews: [],
          },
          {
            name: "Veselka",
            slug: "veselka",
            category: "food",
            summary:
              "A neighborhood institution for Ukrainian comfort food, late-night meals, and the kind of place people miss when they leave New York.",
            priceRange: "$$",
            vibeTags: ["iconic", "casual", "late-night"],
            bestForTags: ["comfort food", "late dinners", "visiting friends"],
            lat: 40.7292,
            lng: -73.9874,
            reviews: [],
          },
        ],
      },
      {
        name: "Long Island City",
        slug: "long-island-city",
        summary:
          "Waterfront Queens with high-rise apartments, fast Manhattan access, skyline parks, and a polished practical feel. It works well for people who want convenience, views, transit, and a newer-building lifestyle.",
        vibeTags: ["waterfront", "modern", "transit-friendly", "polished", "practical"],
        bestForTags: [
          "Manhattan commuters",
          "new apartment seekers",
          "waterfront walks",
          "young professionals",
          "convenience-first renters",
        ],
        rentMin: 3000,
        rentMax: 5200,
        walkabilityScore: 88,
        nightlifeScore: 62,
        quietScore: 60,
        transitScore: 95,
        lat: 40.7447,
        lng: -73.9485,
        places: [
          {
            name: "Gantry Plaza State Park",
            slug: "gantry-plaza-state-park",
            category: "wellness",
            summary:
              "A dramatic waterfront park with Manhattan skyline views, piers, lawns, and one of the best sunset walks in Queens.",
            priceRange: "$",
            vibeTags: ["scenic", "waterfront", "calm"],
            bestForTags: ["sunset walks", "runners", "photography", "dates"],
            lat: 40.7479,
            lng: -73.9593,
            reviews: [],
          },
          {
            name: "M. Wells",
            slug: "m-wells",
            category: "food",
            summary:
              "Creative Queens restaurant with a playful menu and neighborhood-destination energy.",
            priceRange: "$$$",
            vibeTags: ["creative", "food-forward", "destination"],
            bestForTags: ["date nights", "food lovers", "special occasions"],
            lat: 40.7484,
            lng: -73.9423,
            reviews: [],
          },
        ],
      },
      {
        name: "Harlem",
        slug: "harlem",
        summary:
          "Historic, musical, community-rooted Upper Manhattan with brownstones, soul food, parks, express subway access, and more space for the money than many downtown neighborhoods.",
        vibeTags: ["historic", "community", "cultural", "music-rich", "spacious"],
        bestForTags: [
          "culture lovers",
          "budget-aware Manhattan",
          "community seekers",
          "park access",
          "express subway commuters",
        ],
        rentMin: 2300,
        rentMax: 4200,
        walkabilityScore: 88,
        nightlifeScore: 70,
        quietScore: 58,
        transitScore: 88,
        lat: 40.8116,
        lng: -73.9465,
        places: [
          {
            name: "Apollo Theater",
            slug: "apollo-theater",
            category: "nightlife",
            summary:
              "A legendary music and performance venue anchoring Harlem's cultural life.",
            priceRange: "$$",
            vibeTags: ["historic", "music", "iconic"],
            bestForTags: ["live music", "culture nights", "history lovers"],
            lat: 40.81,
            lng: -73.9501,
            reviews: [],
          },
          {
            name: "Morningside Park",
            slug: "morningside-park",
            category: "wellness",
            summary:
              "A steep, green neighborhood park with walking paths, playgrounds, and a quieter alternative to Central Park.",
            priceRange: "$",
            vibeTags: ["green", "local", "calm"],
            bestForTags: ["walks", "families", "weekend resets"],
            lat: 40.805,
            lng: -73.958,
            reviews: [],
          },
        ],
      },
      {
        name: "Prospect Heights",
        slug: "prospect-heights",
        summary:
          "Compact Brooklyn neighborhood with Prospect Park, museums, brownstones, restaurants, and easy access to multiple train lines. It feels cultured and relaxed without being sleepy.",
        vibeTags: ["brownstone", "cultured", "park-adjacent", "walkable", "balanced"],
        bestForTags: [
          "park lovers",
          "museum people",
          "couples",
          "remote workers",
          "balanced Brooklyn",
        ],
        rentMin: 2900,
        rentMax: 5000,
        walkabilityScore: 92,
        nightlifeScore: 65,
        quietScore: 70,
        transitScore: 86,
        lat: 40.6774,
        lng: -73.9692,
        places: [
          {
            name: "Brooklyn Museum",
            slug: "brooklyn-museum",
            category: "practical",
            summary:
              "A major art museum right by the park and Botanic Garden — a rare everyday cultural anchor.",
            priceRange: "$$",
            vibeTags: ["cultural", "creative", "local-anchor"],
            bestForTags: ["museum people", "rainy days", "solo exploring"],
            lat: 40.6712,
            lng: -73.9636,
            reviews: [],
          },
          {
            name: "Brooklyn Botanic Garden",
            slug: "brooklyn-botanic-garden",
            category: "wellness",
            summary:
              "A serene garden escape with cherry blossoms, conservatories, and one of Brooklyn's best calm resets.",
            priceRange: "$$",
            vibeTags: ["green", "calm", "beautiful"],
            bestForTags: ["quiet weekends", "dates", "nature lovers"],
            lat: 40.6694,
            lng: -73.9624,
            reviews: [],
          },
        ],
      },
      {
        name: "Williamsburg",
        slug: "williamsburg",
        summary:
          "Brooklyn's most iconic neighborhood — a transformed industrial waterfront packed with upscale restaurants, Domino Park sunsets, and the L train to Manhattan in 8 minutes. The best food and nightlife concentration in Brooklyn.",
        vibeTags: [
          "trendy",
          "waterfront",
          "nightlife",
          "upscale",
          "creative",
          "social",
          "food-scene",
        ],
        bestForTags: [
          "young professionals",
          "couples",
          "nightlife seekers",
          "food lovers",
          "creative professionals",
        ],
        rentMin: 3200,
        rentMax: 5200,
        walkabilityScore: 94,
        nightlifeScore: 90,
        quietScore: 38,
        transitScore: 90,
        lat: 40.7081,
        lng: -73.9571,
        places: [
          {
            name: "Devoción",
            slug: "devocion",
            category: "food",
            summary:
              "Stunning jungle-interior café with Colombia-sourced coffee — widely regarded as the best specialty coffee in Brooklyn. A Williamsburg landmark.",
            priceRange: "$$",
            vibeTags: ["specialty", "beautiful", "social"],
            bestForTags: [
              "coffee lovers",
              "remote workers",
              "morning dates",
              "Instagram-worthy",
            ],
            lat: 40.7146,
            lng: -73.9588,
            reviews: [
              {
                rating: 5,
                body: "The space alone is worth the trip. Light-filled, plant-filled, and the best pour-over I've had in NYC.",
                reviewerVibeTags: ["creative", "food-forward"],
                reviewerInterests: [
                  "specialty coffee",
                  "design",
                  "remote work",
                ],
              },
            ],
          },
          {
            name: "Domino Park",
            slug: "domino-park",
            category: "wellness",
            summary:
              "Former Domino Sugar Refinery turned waterfront park — Manhattan skyline sunsets, walking paths along the East River, and the best evening views in Brooklyn.",
            priceRange: "$",
            vibeTags: ["scenic", "romantic", "outdoorsy", "waterfront"],
            bestForTags: [
              "sunset walks",
              "couples",
              "summer evenings",
              "photography",
            ],
            lat: 40.7148,
            lng: -73.9695,
            reviews: [
              {
                rating: 5,
                body: "The Manhattan skyline from Domino at golden hour is the best free thing in New York. Period.",
                reviewerVibeTags: ["romantic", "social"],
                reviewerInterests: [
                  "photography",
                  "sunsets",
                  "waterfront walks",
                ],
              },
            ],
          },
          {
            name: "Hotel Delmano",
            slug: "hotel-delmano",
            category: "nightlife",
            summary:
              "Moody, sophisticated cocktail bar with turn-of-the-century European bar aesthetic — a classic Williamsburg institution for date nights and special occasions.",
            priceRange: "$$$",
            vibeTags: ["moody", "sophisticated", "romantic", "classic"],
            bestForTags: ["date nights", "cocktail lovers", "special occasions"],
            lat: 40.7131,
            lng: -73.9639,
            reviews: [
              {
                rating: 5,
                body: "The best bar in Brooklyn for a real date. Moody, beautiful, and the cocktails are works of art.",
                reviewerVibeTags: ["social", "upscale"],
                reviewerInterests: ["cocktails", "date nights", "design"],
              },
            ],
          },
          {
            name: "McCarren Park",
            slug: "mccarren-park",
            category: "wellness",
            summary:
              "Williamsburg's main park with a Saturday farmers market, summer outdoor movies, sports fields, and a great open lawn for picnics.",
            priceRange: "$",
            vibeTags: ["community", "social", "outdoorsy"],
            bestForTags: [
              "farmers market",
              "summer events",
              "picnics",
              "sports",
            ],
            lat: 40.7197,
            lng: -73.9512,
            reviews: [
              {
                rating: 4,
                body: "Saturday morning farmers market then a picnic on the lawn — this is the Williamsburg weekend ritual.",
                reviewerVibeTags: ["social", "community"],
                reviewerInterests: [
                  "farmers markets",
                  "outdoor events",
                  "picnics",
                ],
              },
            ],
          },
        ],
      },
      {
        name: "Bushwick",
        slug: "bushwick",
        summary:
          "Brooklyn's creative capital — warehouse-turned-venues, world-class street art, NYC's best coffee culture, and a nightlife scene that rivals anywhere in the city. More affordable than Williamsburg next door, with a raw creative energy that's hard to replicate.",
        vibeTags: [
          "creative",
          "artsy",
          "nightlife",
          "industrial-chic",
          "diverse",
          "street-art",
          "young",
        ],
        bestForTags: [
          "young creatives",
          "nightlife seekers",
          "remote workers",
          "artists",
          "students",
        ],
        rentMin: 2200,
        rentMax: 3400,
        walkabilityScore: 82,
        nightlifeScore: 92,
        quietScore: 32,
        transitScore: 75,
        lat: 40.6942,
        lng: -73.9168,
        places: [
          {
            name: "Sey Coffee",
            slug: "sey-coffee",
            category: "food",
            summary:
              "Nordic-style light roasts in a stunning converted warehouse space — widely regarded as one of the best specialty coffee shops in all of New York City.",
            priceRange: "$$",
            vibeTags: ["specialty", "airy", "creative", "focused"],
            bestForTags: [
              "coffee lovers",
              "remote workers",
              "solo mornings",
              "specialty coffee",
            ],
            lat: 40.7042,
            lng: -73.9264,
            reviews: [
              {
                rating: 5,
                body: "The warehouse space, the light roasts, the silence — this is where you come to actually focus. Best coffee in Brooklyn.",
                reviewerVibeTags: ["creative", "focused"],
                reviewerInterests: ["specialty coffee", "design", "remote work"],
              },
            ],
          },
          {
            name: "Elsewhere",
            slug: "elsewhere",
            category: "nightlife",
            summary:
              "Multi-floor music venue and club — Bushwick's nightlife anchor with a rooftop, basement club, and live music stage. One of Brooklyn's best large-scale venues.",
            priceRange: "$$",
            vibeTags: ["live-music", "club", "energetic", "social"],
            bestForTags: [
              "nightlife",
              "live music",
              "dancing",
              "friend groups",
            ],
            lat: 40.7005,
            lng: -73.9197,
            reviews: [
              {
                rating: 5,
                body: "Three floors, a rooftop, and a lineup that's always interesting. Elsewhere is why people move to Bushwick.",
                reviewerVibeTags: ["nightlife", "creative", "social"],
                reviewerInterests: ["live music", "nightlife", "dancing"],
              },
            ],
          },
          {
            name: "The Bushwick Collective",
            slug: "bushwick-collective",
            category: "wellness",
            summary:
              "Outdoor self-guided street art gallery — dozens of world-class murals by international artists across a few walkable blocks. The neighborhood's most iconic free experience.",
            priceRange: "$",
            vibeTags: ["artistic", "outdoor", "iconic", "creative"],
            bestForTags: [
              "art lovers",
              "solo exploring",
              "photography",
              "weekend walks",
            ],
            lat: 40.7042,
            lng: -73.9189,
            reviews: [
              {
                rating: 5,
                body: "45 minutes on Troutman Street and you've seen more world-class art than most galleries charge for. All free.",
                reviewerVibeTags: ["creative", "curious"],
                reviewerInterests: ["street art", "photography", "culture"],
              },
            ],
          },
          {
            name: "Roberta's",
            slug: "robertas",
            category: "food",
            summary:
              "Bushwick's most famous institution — wood-fired pizza in a sprawling industrial space with a beloved garden. The restaurant that put Bushwick on the culinary map.",
            priceRange: "$$",
            vibeTags: ["iconic", "casual", "social", "food-forward"],
            bestForTags: [
              "pizza lovers",
              "groups",
              "date nights",
              "first-timers",
            ],
            lat: 40.7054,
            lng: -73.9332,
            reviews: [
              {
                rating: 5,
                body: "Still the best pizza in Brooklyn after all these years. The garden is worth the wait alone.",
                reviewerVibeTags: ["food-forward", "social"],
                reviewerInterests: ["pizza", "food culture", "local icons"],
              },
            ],
          },
        ],
      },
    ],
  },
];
