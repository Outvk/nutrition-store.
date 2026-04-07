import { createClient } from "@/lib/supabase/server";
import ContentEditorClient from "./ContentEditorClient";

export default async function ContentEditorPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("store_settings")
    .select("landing_content")
    .eq("id", "00000000-0000-0000-0000-000000000000")
    .maybeSingle();

  return <ContentEditorClient initialContent={settings?.landing_content || null} />;
}
