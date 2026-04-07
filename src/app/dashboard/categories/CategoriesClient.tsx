"use client";
import { useState } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, X, Folder } from "lucide-react";
import { Category } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const emptyForm = { name: "", slug: "", image_url: "" };

export default function CategoriesClient({ 
  initialCategories 
}: { 
  initialCategories: Category[];
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const openAdd = () => { setForm(emptyForm); setEditCategory(null); setShowModal(true); };
  const openEdit = (c: Category) => {
    setForm({ name: c.name, slug: c.slug || "", image_url: c.image_url || "" });
    setEditCategory(c);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) return alert("Nom requis.");
    setIsSaving(true);
    const supabase = createClient();
    const slug = form.slug || form.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    try {
      if (editCategory) {
        const { error } = await supabase.from("categories").update({ ...form, slug }).eq("id", editCategory.id);
        if (error) throw error;
        setCategories(ps => ps.map(c => c.id === editCategory.id ? { ...c, ...form, slug } : c));
      } else {
        const { data, error } = await supabase.from("categories").insert({ ...form, slug }).select().single();
        if (error) throw error;
        setCategories(ps => [...ps, data]);
      }
      setShowModal(false);
      router.refresh();
    } catch (e: any) {
      alert("Erreur: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (!error) {
      setCategories(ps => ps.filter(c => c.id !== id));
      router.refresh();
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <p style={{ fontFamily: "var(--font-condensed)", fontSize: "12px", letterSpacing: "0.12em", color: "var(--accent)", fontWeight: 700 }}>TAXONOMIE</p>
          <h1 className="section-heading" style={{ fontSize: "36px" }}>CATÉGORIES</h1>
        </div>
        <button onClick={openAdd} className="btn-accent" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", borderRadius: "0", border: "none", cursor: "pointer", fontSize: "14px" }}>
          <Plus size={16} /> AJOUTER
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
        {categories.map(cat => (
          <div key={cat.id} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0", overflow: "hidden" }}>
                {cat.image_url ? <Image src={cat.image_url} alt="" width={40} height={40} style={{ objectFit: "cover" }} /> : <Folder size={20} color="var(--text-muted)" />}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: "15px" }}>{cat.name}</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>/{cat.slug}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => openEdit(cat)} style={{ padding: "8px", background: "none", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text-secondary)" }}><Edit2 size={14} /></button>
              <button onClick={() => deleteCategory(cat.id)} style={{ padding: "8px", background: "none", border: "1px solid var(--border)", cursor: "pointer", color: "#ef4444" }}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0", width: "100%", maxWidth: "450px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontFamily: "var(--font-condensed)", fontSize: "20px" }}>{editCategory ? "MODIFIER" : "AJOUTER"} CATÉGORIE</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>NOM</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-dark" style={{ width: "100%", padding: "10px", borderRadius: "0" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>SLUG (OPTIONNEL)</label>
                <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="input-dark" style={{ width: "100%", padding: "10px", borderRadius: "0" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>IMAGE URL</label>
                <input type="text" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="input-dark" style={{ width: "100%", padding: "10px", borderRadius: "0" }} />
              </div>
              <button onClick={handleSave} disabled={isSaving} className="btn-accent" style={{ padding: "12px", border: "none", marginTop: "10px" }}>
                {isSaving ? "CHARGEMENT..." : "SAUVEGARDER"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
