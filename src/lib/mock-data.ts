import { Product, Brand, Category } from "@/types";

export const mockBrands: Brand[] = [
  { id: "1", name: "Optimum Nutrition", logo_url: "https://placehold.co/120x60/161616/888888?text=ON", is_visible: true },
  { id: "2", name: "Biotech USA", logo_url: "https://placehold.co/120x60/161616/888888?text=BIOTECH", is_visible: true },
  { id: "3", name: "Applied Nutrition", logo_url: "https://placehold.co/120x60/161616/888888?text=APPLIED", is_visible: true },
  { id: "4", name: "Dymatize", logo_url: "https://placehold.co/120x60/161616/888888?text=DYMATIZE", is_visible: true },
  { id: "5", name: "MuscleTech", logo_url: "https://placehold.co/120x60/161616/888888?text=MUSCLETECH", is_visible: true },
  { id: "6", name: "Nutrex", logo_url: "https://placehold.co/120x60/161616/888888?text=NUTREX", is_visible: true },
  { id: "7", name: "OstroVit", logo_url: "https://placehold.co/120x60/161616/888888?text=OSTROVIT", is_visible: true },
  { id: "8", name: "Rule One", logo_url: "https://placehold.co/120x60/161616/888888?text=R1", is_visible: true },
];

export const mockCategories: Category[] = [
  { id: "1", name: "Build Mass", slug: "build-mass", image_url: "https://images.unsplash.com/photo-1534368420009-621bfab424a8?w=400&q=80" },
  { id: "2", name: "Burn Fat", slug: "burn-fat", image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },
  { id: "3", name: "Boost Performance", slug: "boost-performance", image_url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80" },
  { id: "4", name: "Recover & Protect", slug: "recover-protect", image_url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80" },
  { id: "5", name: "Pre-workout", slug: "pre-workout", image_url: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=400&q=80" },
  { id: "6", name: "Vitamines", slug: "vitamines", image_url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80" },
  { id: "7", name: "Snacks", slug: "snacks", image_url: "https://images.unsplash.com/photo-1621643950478-f29e1eb16086?w=400&q=80" },
  { id: "8", name: "Boisson", slug: "boisson", image_url: "https://images.unsplash.com/photo-1527960471264-9326ef312c5b?w=400&q=80" },
];

export const mockProducts: Product[] = [
  {
    id: "1", name: "Gold Standard 100% Whey", description: "The world's best-selling whey protein powder. 24g of protein per serving, naturally occurring BCAAs and glutamine.",
    price: 8500, sale_price: 7200, images: ["https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&q=80"],
    brand_id: "1", category_id: "1", is_active: true, is_on_sale: true,
    variants: [
      { id: "v1", product_id: "1", flavor: "Double Rich Chocolate", size: "2lbs", stock: 12 },
      { id: "v2", product_id: "1", flavor: "Vanilla Ice Cream", size: "2lbs", stock: 8 },
      { id: "v3", product_id: "1", flavor: "Strawberry", size: "5lbs", stock: 4 },
    ]
  },
  {
    id: "2", name: "ISO100 Hydrolyzed Protein", description: "100% Whey Protein Isolate. 25g protein, 5.5g BCAAs, less than 1g fat and sugar.",
    price: 9800, images: ["https://images.unsplash.com/photo-1579722821273-0f6c1b0edef8?w=600&q=80"],
    brand_id: "4", category_id: "1", is_active: true, is_on_sale: false,
    variants: [
      { id: "v4", product_id: "2", flavor: "Gourmet Chocolate", size: "1.6lbs", stock: 6 },
      { id: "v5", product_id: "2", flavor: "Birthday Cake", size: "1.6lbs", stock: 3 },
    ]
  },
  {
    id: "3", name: "Pre-Workout LIPO-6 Black", description: "Ultra concentrate pre-workout. Maximum energy, focus and fat burning in one powerful formula.",
    price: 4500, sale_price: 3800, images: ["https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80"],
    brand_id: "6", category_id: "3", is_active: true, is_on_sale: true,
    variants: [
      { id: "v6", product_id: "3", flavor: "Black Cherry", size: "30 servings", stock: 15 },
    ]
  },
  {
    id: "4", name: "Creatine Monohydrate", description: "Pure pharmaceutical grade creatine monohydrate. Increases strength, power and muscle volume.",
    price: 3200, images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80"],
    brand_id: "2", category_id: "3", is_active: true, is_on_sale: false,
    variants: [
      { id: "v7", product_id: "4", flavor: "Unflavored", size: "300g", stock: 22 },
      { id: "v8", product_id: "4", flavor: "Unflavored", size: "500g", stock: 10 },
    ]
  },
  {
    id: "5", name: "Mass Gainer 5000", description: "High calorie mass gainer with 5000 calories per serving. 25 vitamins and minerals for optimal recovery.",
    price: 11500, sale_price: 9900, images: ["https://images.unsplash.com/photo-1534368420009-621bfab424a8?w=600&q=80"],
    brand_id: "5", category_id: "1", is_active: true, is_on_sale: true,
    variants: [
      { id: "v9", product_id: "5", flavor: "Chocolate Fudge", size: "5lbs", stock: 7 },
      { id: "v10", product_id: "5", flavor: "Vanilla", size: "5lbs", stock: 5 },
    ]
  },
  {
    id: "6", name: "BCAA 8:1:1 Ultra", description: "Branched chain amino acids in an 8:1:1 ratio for maximum muscle recovery and anti-catabolism.",
    price: 3800, images: ["https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80"],
    brand_id: "3", category_id: "4", is_active: true, is_on_sale: false,
    variants: [
      { id: "v11", product_id: "6", flavor: "Tropical", size: "200g", stock: 18 },
      { id: "v12", product_id: "6", flavor: "Watermelon", size: "200g", stock: 9 },
    ]
  },
  {
    id: "7", name: "CLA 1000 Softgels", description: "Conjugated Linoleic Acid for fat loss and lean muscle maintenance. 1000mg pure CLA per capsule.",
    price: 2900, images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80"],
    brand_id: "7", category_id: "2", is_active: true, is_on_sale: false,
    variants: [
      { id: "v13", product_id: "7", flavor: "Softgels", size: "60 caps", stock: 25 },
      { id: "v14", product_id: "7", flavor: "Softgels", size: "120 caps", stock: 11 },
    ]
  },
  {
    id: "8", name: "R1 Protein", description: "100% isolate and hydrolysate whey protein. Zero sugars, zero gluten. Pure performance.",
    price: 10200, sale_price: 8900, images: ["https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&q=80"],
    brand_id: "8", category_id: "1", is_active: true, is_on_sale: true,
    variants: [
      { id: "v15", product_id: "8", flavor: "Chocolate Fudge", size: "2lbs", stock: 6 },
    ]
  },
];

export const mockOrders = [
  { id: "ORD-001", full_name: "Ahmed Benali", phone: "0555123456", wilaya: "Alger", address: "12 Rue Didouche Mourad", total: 9700, delivery_fee: 400, status: "delivered" as const, created_at: "2024-01-15T10:30:00Z" },
  { id: "ORD-002", full_name: "Fatima Zahra Khelifi", phone: "0661234567", wilaya: "Oran", address: "5 Boulevard Front de Mer", total: 8500, delivery_fee: 500, status: "shipped" as const, created_at: "2024-01-16T14:20:00Z" },
  { id: "ORD-003", full_name: "Youcef Mansouri", phone: "0770987654", wilaya: "Constantine", address: "8 Rue Ben M'Hidi", total: 13200, delivery_fee: 500, status: "confirmed" as const, created_at: "2024-01-17T09:15:00Z" },
  { id: "ORD-004", full_name: "Amira Boudiaf", phone: "0554456789", wilaya: "Annaba", address: "22 Avenue de l'ALN", total: 4500, delivery_fee: 600, status: "pending" as const, created_at: "2024-01-18T16:45:00Z" },
  { id: "ORD-005", full_name: "Khaled Rahmani", phone: "0662345678", wilaya: "Blida", address: "3 Cité Bouarfa", total: 7600, delivery_fee: 400, status: "pending" as const, created_at: "2024-01-18T18:10:00Z" },
];
