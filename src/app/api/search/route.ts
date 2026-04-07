import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  
  if (!q || q.length < 2) return NextResponse.json([]);
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, images, brand:brand_id(name)")
    .ilike("name", `%${q}%`)
    .eq("is_active", true)
    .limit(10);
    
  if (error) {
    console.error("Search API error", error);
    return NextResponse.json([]);
  }

  return NextResponse.json(data || []);
}
