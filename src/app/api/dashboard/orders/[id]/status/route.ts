import { NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/supabase/queries";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    
    const success = await updateOrderStatus(id, status);
    
    if (!success) {
      return NextResponse.json({ error: "Failed to update status" }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Order Status Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
