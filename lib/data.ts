import type {
  CityBadge,
  NavLink,
  FooterLink,
} from "@/types";

// ─── Navigation ──────────────────────────────────────────────────────────────

export const NAV_LINKS: NavLink[] = [
  { label: "Cities", href: "#cities" },
];

export const FOOTER_LINKS: FooterLink[] = [
  { label: "About",   href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Contact", href: "#" },
  { label: "GitHub",  href: "https://github.com" },
];

// ─── Cities ──────────────────────────────────────────────────────────────────

export const CITIES: CityBadge[] = [
  { name: "Mumbai",        flag: "🇮🇳", status: "live"         },
  { name: "Toronto",       flag: "🇨🇦", status: "live"         },
  { name: "New York City", flag: "🇺🇸", status: "live"         },
  { name: "London",        flag: "🇬🇧", status: "coming-soon"  },
  { name: "Singapore",     flag: "🇸🇬", status: "coming-soon"  },
  { name: "Dubai",         flag: "🇦🇪", status: "coming-soon"  },
  { name: "Bangalore",     flag: "🇮🇳", status: "coming-soon"  },
];
