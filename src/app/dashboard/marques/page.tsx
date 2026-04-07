import { createClient } from "@/lib/supabase/server";
import MarquesClient from "./MarquesClient";

export default async function MarquesPage() {
  const supabase = await createClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("*")
    .order("name");

  return <MarquesClient initialBrands={brands || []} />;
}
