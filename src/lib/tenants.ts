export interface TenantBrand {
  slug: string;
  name: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
}

/** Demo tenants. The seed script writes these rows; the landing page links to them. */
export const DEMO_TENANTS: TenantBrand[] = [
  {
    slug: "lumen",
    name: "Lumen Health",
    tagline: "Same-day virtual care",
    primaryColor: "#0f766e",
    accentColor: "#14b8a6",
  },
  {
    slug: "northwind",
    name: "Northwind Care",
    tagline: "Musculoskeletal telehealth",
    primaryColor: "#6d28d9",
    accentColor: "#a78bfa",
  },
];
