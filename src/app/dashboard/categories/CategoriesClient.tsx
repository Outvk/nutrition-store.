"use client";
import { useState } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, X, Folder } from "lucide-react";
import { Category } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const emptyForm = { name: "", slug: "", image_url: "" };

export default function CategoriesClient({ 
  initialCategories,
  initialPacks = []
}: { 
  initialCategories: Category[];
  initialPacks: any[];
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [packs, setPacks] = useState<any[]>(initialPacks);
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

  const togglePackNav = async (id: string, current: boolean) => {
    const supabase = createClient();
    setPacks(ps => ps.map(p => p.id === id ? { ...p, show_in_navbar: !current } : p));
    await supabase.from("products").update({ show_in_navbar: !current }).eq("id", id);
    router.refresh();
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "60px" }}>
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

      {/* Packs Section */}
      <div style={{ marginBottom: "28px", borderTop: "1px solid var(--border)", paddingTop: "40px" }}>
        <p style={{ fontFamily: "var(--font-condensed)", fontSize: "12px", letterSpacing: "0.12em", color: "var(--accent)", fontWeight: 700 }}>NAVIGATION</p>
        <h2 className="section-heading" style={{ fontSize: "28px", marginBottom: "16px" }}>PACKS DANS LE MENU</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>Sélectionnez jusqu'à 5 packs pour les afficher au survol du bouton "PACKS" dans la barre de navigation.</p>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "12px" }}>
          {packs.map(pack => (
            <div key={pack.id} style={{ 
              background: pack.show_in_navbar ? "rgba(232,255,0,0.05)" : "var(--bg-secondary)", 
              border: pack.show_in_navbar ? "1px solid var(--accent)" : "1px solid var(--border)", 
              padding: "12px 16px",
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                 <div style={{ position: "relative", width: "40px", height: "40px", background: "var(--bg-elevated)" }}>
                    {pack.images?.[0] && <Image src={pack.images[0]} alt="" fill style={{ objectFit: "contain" }} />}
                 </div>
                 <span style={{ fontSize: "14px", fontWeight: 600, color: pack.show_in_navbar ? "#fff" : "var(--text-secondary)" }}>{pack.name}</span>
              </div>
              <button 
                onClick={() => togglePackNav(pack.id, pack.show_in_navbar)}
                style={{ 
                  background: pack.show_in_navbar ? "var(--accent)" : "rgba(255,255,255,0.05)", 
                  border: "none", 
                  padding: "6px 12px", 
                  fontFamily: "var(--font-condensed)", 
                  fontWeight: 800, 
                  fontSize: "10px", 
                  color: pack.show_in_navbar ? "#000" : "var(--text-muted)",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}>
                {pack.show_in_navbar ? "AFFICHÉ" : "MASQUÉ"}
              </button>
            </div>
          ))}
          {packs.length === 0 && (
            <p style={{ gridColumn: "span 3", padding: "20px", textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--border)" }}>Créez d'abord des produits dans la catégorie "Packs".</p>
          )}
        </div>
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
