import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const revalidate = 300; // Cache taxonomy for 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  
  const supabase = await createClient();
  
  if (type === "categories") {
    const { data } = await supabase.from("categories").select("id, name, slug, image_url").order("name");
    return NextResponse.json(data || []);
  }
  
  if (type === "brands") {
    const { data } = await supabase.from("brands").select("id, name, logo_url").order("name").eq("is_visible", true);
    return NextResponse.json(data || []);
  }

  if (type === "pack_products") {
    const { data } = await supabase.from("products")
      .select("id, name, price, images, nav_label, nav_image, navbar_order")
      .not("navbar_order", "is", null)
      .order("navbar_order", { ascending: true })
      .limit(10);
    return NextResponse.json(data || []);
  }

  return NextResponse.json([]);
}
