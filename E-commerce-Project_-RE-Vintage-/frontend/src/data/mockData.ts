export type Category = "apparel" | "turntables" | "vinyl";

export interface Vendor {
  id: string;
  shopName: string;
  avatarPlaceholder: string; // tailwind bg class; swap for an image URL later
  bannerPlaceholder: string;
  bio: string;
  rating: number;
  totalSales: number;
  location: string;
  specialties: string[];
  itemCount: number;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  category: Category;
  vendorId: string;
  imagePlaceholder: string; // tailwind bg class; swap for next/image src later
  hoverImagePlaceholder: string;
  description: string;
  specs: ProductSpec[];
  stockCount: number;
}

export const vendors: Vendor[] = [
  {
    id: "backroom-records",
    shopName: "Backroom Records",
    avatarPlaceholder: "bg-vinylBlack",
    bannerPlaceholder: "bg-vinylBlack",
    bio: "Jazz, soul and library records, graded by ear and sold with honest notes. Every pressing is cleaned before it ships.",
    rating: 4.9,
    totalSales: 1284,
    location: "Portland, OR",
    specialties: ["Rare Vinyl Specialist", "Audio Restoration"],
    itemCount: 214,
  },
  {
    id: "second-spin-vintage",
    shopName: "Second Spin Vintage",
    avatarPlaceholder: "bg-red-600",
    bannerPlaceholder: "bg-red-600",
    bio: "Vintage workwear, tour merch and restored portable players, sourced from estate sales and repaired in-house.",
    rating: 4.7,
    totalSales: 642,
    location: "Osaka, JP",
    specialties: ["Vintage Apparel", "Portable Players"],
    itemCount: 87,
  },
  {
    id: "needle-and-groove",
    shopName: "Needle & Groove",
    avatarPlaceholder: "bg-amberGlow",
    bannerPlaceholder: "bg-pine",
    bio: "Turntable service bench: belts, stylus swaps and full restorations on vintage decks.",
    rating: 4.8,
    totalSales: 419,
    location: "Berlin, DE",
    specialties: ["Audio Restorer", "Turntable Service"],
    itemCount: 36,
  },
  {
    id: "thread-theory",
    shopName: "Thread Theory",
    avatarPlaceholder: "bg-pine",
    bannerPlaceholder: "bg-amberGlow",
    bio: "Curated vintage tees, windbreakers and tour merch from the 70s to the 90s.",
    rating: 4.6,
    totalSales: 873,
    location: "Lisbon, PT",
    specialties: ["Vintage Apparel", "Tour Merch Curator"],
    itemCount: 152,
  },
  {
    id: "wax-cellar",
    shopName: "Wax Cellar",
    avatarPlaceholder: "bg-red-600",
    bannerPlaceholder: "bg-vinylBlack",
    bio: "Deep crates of jazz, soul and funk. First pressings and obscure imports.",
    rating: 4.9,
    totalSales: 2310,
    location: "Chicago, IL",
    specialties: ["Rare Vinyl Specialist", "Jazz & Soul"],
    itemCount: 468,
  },
  {
    id: "static-vault",
    shopName: "Static Vault",
    avatarPlaceholder: "bg-vinylBlack",
    bannerPlaceholder: "bg-red-600",
    bio: "Tube amps, receivers and speakers, bench-tested and sold with a service report.",
    rating: 4.7,
    totalSales: 302,
    location: "Melbourne, AU",
    specialties: ["Audio Restorer", "Tube Amps"],
    itemCount: 41,
  },
];

export const products: Product[] = [
  {
    id: "vnl-1",
    title: "Midnight at the Blue Room",
    price: 42,
    category: "vinyl",
    vendorId: "backroom-records",
    imagePlaceholder: "bg-vinylBlack",
    hoverImagePlaceholder: "bg-red-600",
    description: "Placeholder: original pressing of a smoky late-set jazz LP. Replace with real liner notes and pressing history.",
    specs: [
      { label: "Format", value: '12" LP, 33⅓ RPM' },
      { label: "Pressing", value: "Original, 1961" },
      { label: "Sleeve", value: "VG+, light ring wear" },
      { label: "Catalog #", value: "VNL-0042" },
    ],
    stockCount: 2,
  },
  {
    id: "vnl-2",
    title: "Slow Burn Sessions",
    price: 28.5,
    category: "vinyl",
    vendorId: "backroom-records",
    imagePlaceholder: "bg-pine",
    hoverImagePlaceholder: "bg-vinylBlack",
    description: "Placeholder: soul reissue with warm analogue mastering. Replace with real description.",
    specs: [
      { label: "Format", value: '12" LP, 33⅓ RPM' },
      { label: "Pressing", value: "Reissue, 1998" },
      { label: "Sleeve", value: "Mint" },
      { label: "Catalog #", value: "VNL-0107" },
    ],
    stockCount: 1,
  },
  {
    id: "app-1",
    title: "Tour Windbreaker, 1978",
    price: 65,
    category: "apparel",
    vendorId: "second-spin-vintage",
    imagePlaceholder: "bg-amberGlow",
    hoverImagePlaceholder: "bg-vinylBlack",
    description: "Placeholder: nylon windbreaker with faded tour print. Replace with measurements and flaws.",
    specs: [
      { label: "Material", value: "Nylon, cotton lining" },
      { label: "Era", value: "1970s" },
      { label: "Pit to pit", value: "21 in" },
      { label: "Catalog #", value: "APP-0311" },
    ],
    stockCount: 1,
  },
  {
    id: "app-2",
    title: "Corduroy Work Jacket",
    price: 54,
    category: "apparel",
    vendorId: "second-spin-vintage",
    imagePlaceholder: "bg-pine",
    hoverImagePlaceholder: "bg-red-600",
    description: "Placeholder: heavy corduroy chore jacket with brass snaps. Replace with real details.",
    specs: [
      { label: "Material", value: "Cotton corduroy" },
      { label: "Era", value: "1980s" },
      { label: "Pit to pit", value: "22 in" },
      { label: "Catalog #", value: "APP-0420" },
    ],
    stockCount: 0,
  },
  {
    id: "trn-1",
    title: "Belt-Drive Deck, Walnut",
    price: 340,
    category: "turntables",
    vendorId: "backroom-records",
    imagePlaceholder: "bg-vinylBlack",
    hoverImagePlaceholder: "bg-amberGlow",
    description: "Placeholder: serviced belt-drive turntable in a walnut plinth. Replace with service history.",
    specs: [
      { label: "Drive", value: "Belt" },
      { label: "Speeds", value: "33⅓ / 45" },
      { label: "Cartridge", value: "Moving magnet, new stylus" },
      { label: "Catalog #", value: "TT-0019" },
    ],
    stockCount: 1,
  },
  {
    id: "trn-2",
    title: "Briefcase Record Player, 1966",
    price: 120,
    category: "turntables",
    vendorId: "second-spin-vintage",
    imagePlaceholder: "bg-red-600",
    hoverImagePlaceholder: "bg-vinylBlack",
    description: "Placeholder: portable tube-era player with built-in speaker. Replace with testing notes.",
    specs: [
      { label: "Drive", value: "Idler wheel" },
      { label: "Speeds", value: "33⅓ / 45 / 78" },
      { label: "Output", value: "Built-in speaker + RCA" },
      { label: "Catalog #", value: "TT-0044" },
    ],
    stockCount: 3,
  },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
export const getVendor = (id: string) => vendors.find((v) => v.id === id);
export const getVendorProducts = (vendorId: string) =>
  products.filter((p) => p.vendorId === vendorId);
