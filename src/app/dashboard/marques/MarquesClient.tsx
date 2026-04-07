"use client";
import { useState } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, X, Tag } from "lucide-react";
import { Brand } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const emptyForm = { name: "", logo_url: "", is_visible: true };

export default function MarquesClient({ 
  initialBrands 
}: { 
  initialBrands: Brand[];
}) {
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [showModal, setShowModal] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const openAdd = () => { setForm(emptyForm); setEditBrand(null); setShowModal(true); };
  const openEdit = (b: Brand) => {
    setForm({ name: b.name, logo_url: b.logo_url || "", is_visible: b.is_visible });
    setEditBrand(b);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) return alert("Nom requis.");
    setIsSaving(true);
    const supabase = createClient();

    try {
      if (editBrand) {
        const { error } = await supabase.from("brands").update(form).eq("id", editBrand.id);
        if (error) throw error;
        setBrands(ps => ps.map(b => b.id === editBrand.id ? { ...b, ...form } : b));
      } else {
        const { data, error } = await supabase.from("brands").insert(form).select().single();
        if (error) throw error;
        setBrands(ps => [...ps, data]);
      }
      setShowModal(false);
      router.refresh();
    } catch (e: any) {
      alert("Erreur: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteBrand = async (id: string) => {
    if (!confirm("Supprimer cette marque ?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (!error) {
      setBrands(ps => ps.filter(b => b.id !== id));
      router.refresh();
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <p style={{ fontFamily: "var(--font-condensed)", fontSize: "12px", letterSpacing: "0.12em", color: "var(--accent)", fontWeight: 700 }}>PARTENAIRES</p>
          <h1 className="section-heading" style={{ fontSize: "36px" }}>MARQUES</h1>
        </div>
        <button onClick={openAdd} className="btn-accent" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", borderRadius: "0", border: "none", cursor: "pointer", fontSize: "14px" }}>
          <Plus size={16} /> AJOUTER
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
        {brands.map(brand => (
          <div key={brand.id} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {brand.logo_url ? <Image src={brand.logo_url} alt="" width={32} height={32} style={{ objectFit: "contain" }} /> : <Tag size={18} color="var(--text-muted)" />}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: "15px" }}>{brand.name}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                   <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: brand.is_visible ? "#22c55e" : "#555" }}></div>
                   <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{brand.is_visible ? "Public" : "Caché"}</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => openEdit(brand)} style={{ padding: "8px", background: "none", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text-secondary)" }}><Edit2 size={13} /></button>
              <button onClick={() => deleteBrand(brand.id)} style={{ padding: "8px", background: "none", border: "1px solid var(--border)", cursor: "pointer", color: "#ef4444" }}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0", width: "100%", maxWidth: "400px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontFamily: "var(--font-condensed)", fontSize: "20px" }}>{editBrand ? "MODIFIER" : "AJOUTER"} MARQUE</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>NOM DE LA MARQUE</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-dark" style={{ width: "100%", padding: "10px", borderRadius: "0" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>LOGO URL (OPTIONNEL)</label>
                <input type="text" value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })} className="input-dark" style={{ width: "100%", padding: "10px", borderRadius: "0" }} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input type="checkbox" checked={form.is_visible} onChange={e => setForm({ ...form, is_visible: e.target.checked })} />
                <span style={{ fontSize: "13px" }}>Visible par le public</span>
              </label>
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
