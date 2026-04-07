import { NextResponse } from "next/server";
import { deleteOrder } from "@/lib/supabase/queries";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteOrder(id);
    
    if (!success) {
      return NextResponse.json({ error: "Failed to delete order" }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Order Delete Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
