export const DEMO_PASSWORD = "Demo1234!";

export const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@revintage.demo", home: "/admin", note: "Manage shops and users" },
  { label: "Seller", email: "seller@revintage.demo", home: "/dashboard/products", note: "Owns “Demo Records”" },
  { label: "Customer", email: "customer@revintage.demo", home: "/", note: "Browse and shop" },
] as const;

// Visible in `npm run dev`; hidden in production builds unless NEXT_PUBLIC_DEMO_LOGIN=true.
export const SHOW_DEMO = process.env.NEXT_PUBLIC_DEMO_LOGIN === "true" || process.env.NODE_ENV !== "production";
