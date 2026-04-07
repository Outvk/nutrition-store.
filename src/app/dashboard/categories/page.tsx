import { createClient } from "@/lib/supabase/server";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Fetch only products that belong to any category with "pack" in the name
  const { data: packsCategory } = await supabase
    .from("categories")
    .select("id")
    .ilike("name", "%pack%")
    .limit(1)
    .single();

  const { data: packs } = packsCategory 
    ? await supabase.from("products").select("*").eq("category_id", packsCategory.id).order("name")
    : { data: [] };

  return <CategoriesClient initialCategories={categories || []} initialPacks={packs || []} />;
}
