import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const popular = searchParams.get("popular") === "true";
  const sale = searchParams.get("sale") === "true";
  const categoryId = searchParams.get("category_id");

  if (!popular && !sale && !categoryId && (!q || q.length < 2))
    return NextResponse.json([]);

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("id, name, price, sale_price, images, brand:brand_id(name)")
    .eq("is_active", true);

  if (categoryId) {
    query = query.eq("category_id", categoryId).limit(10);
  } else if (sale) {
    query = query.eq("is_on_sale", true).limit(5);
  } else if (q) {
    query = query.ilike("name", `%${q}%`).limit(12); // ← fix: added .limit(12)
  } else if (popular) {
    query = query.limit(3).order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Search API error", error);
    return NextResponse.json([]);
  }

  return NextResponse.json(data || []);
}