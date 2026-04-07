import { updateVariantStock } from "@/lib/supabase/queries";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { stock } = await req.json();
    const success = await updateVariantStock(id, stock);
    if (success) return NextResponse.json({ success: true });
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
