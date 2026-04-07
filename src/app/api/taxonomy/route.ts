import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  
  const supabase = await createClient();
  
  if (type === "categories") {
    const { data } = await supabase.from("categories").select("*").order("name");
    return NextResponse.json(data || []);
  }
  
  if (type === "brands") {
    const { data } = await supabase.from("brands").select("*").order("name").eq("is_visible", true);
    return NextResponse.json(data || []);
  }

  return NextResponse.json([]);
}
