"use client";
import { useState } from "react";
import Image from "next/image";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, X } from "lucide-react";
import { Product, Brand, Category } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const emptyForm = { 
  name: "", description: "", price: "", sale_price: "", brand_id: "", category_id: "", 
  is_on_sale: false, images: "", bienfaits: "", utilisation: "", ingredients: "",
  variants: [{ flavor: "Standard", size: "", stock: "0" }]
};

export default function ProductsDashboardClient({ 
  initialProducts, 
  brands, 
  categories 
}: { 
  initialProducts: any[];
  brands: Brand[];
  categories: Category[];
}) {
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand_id && p.brand_id.toLowerCase().includes(search.toLowerCase()))
  );

  const openAdd = () => { setForm(emptyForm); setEditProduct(null); setShowModal(true); };
  
  const openEdit = (p: any) => {
    setForm({ 
      name: p.name, 
      description: p.description, 
      price: String(p.price), 
      sale_price: String(p.sale_price || ""), 
      brand_id: p.brand_id || "", 
      category_id: p.category_id || "", 
      is_on_sale: p.is_on_sale,
      images: p.images ? p.images.join(", ") : "",
      bienfaits: p.bienfaits || "",
      utilisation: p.utilisation || "",
      ingredients: p.ingredients || "",
      variants: p.variants && p.variants.length > 0 
        ? p.variants.map((v: any) => ({ flavor: v.flavor, size: v.size, stock: String(v.stock) }))
        : [{ flavor: "Standard", size: "", stock: "0" }]
    });
    setEditProduct(p);
    setShowModal(true);
  };

  const toggleActive = async (id: string, current: boolean) => {
    const supabase = createClient();
    setProducts(ps => ps.map(p => p.id === id ? { ...p, is_active: !current } : p));
    await supabase.from("products").update({ is_active: !current }).eq("id", id);
  };

  const deleteProduct = async (id: string) => { 
    if (confirm("Voulez-vous vraiment supprimer ce produit ?")) {
      setProducts(ps => ps.filter(p => p.id !== id)); 
      const supabase = createClient();
      await supabase.from("products").delete().eq("id", id);
      router.refresh();
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return alert("Veuillez remplir le nom et le prix.");
    setIsSaving(true);
    const supabase = createClient();

    const parsedPrice = parseFloat(String(form.price).replace(/,/g, '')) || 0;
    const parsedSale = parseFloat(String(form.sale_price).replace(/,/g, ''));

    const productPayload = {
      name: form.name,
      description: form.description,
      price: parsedPrice,
      sale_price: !isNaN(parsedSale) ? parsedSale : null,
      brand_id: form.brand_id || null,
      category_id: form.category_id || null,
      is_on_sale: form.is_on_sale,
      images: form.images.split(",").map(i => i.trim()).filter(Boolean),
      is_active: true,
      bienfaits: form.bienfaits,
      utilisation: form.utilisation,
      ingredients: form.ingredients
    };

    try {
      let savedProductId = editProduct?.id;

      if (editProduct) {
        const { error } = await supabase.from("products").update(productPayload).eq("id", editProduct.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("products").insert(productPayload).select("id").single();
        if (error) throw error;
        savedProductId = data.id;
      }

      // Handle variants: delete old ones and insert new ones
      if (savedProductId) {
        // Delete existing variants if editing
        if (editProduct) {
          await supabase.from("variants").delete().eq("product_id", savedProductId);
        }

        // Insert new variants
        const variantsToInsert = form.variants.map(v => ({
          product_id: savedProductId,
          flavor: v.flavor || "Standard",
          size: v.size || "Default",
          stock: parseInt(v.stock) || 0
        }));

        const { error: vError } = await supabase.from("variants").insert(variantsToInsert);
        if (vError) throw vError;
      }

      setShowModal(false);
      router.refresh();
      // Optional: Update local state if refresh is too slow
      window.location.reload(); 
    } catch (e: any) {
      alert("Erreur lors de la sauvegarde : " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <p style={{ fontFamily: "var(--font-condensed)", fontSize: "12px", letterSpacing: "0.12em", color: "var(--accent)", fontWeight: 700, marginBottom: "6px" }}>CATALOGUE</p>
          <h1 className="section-heading" style={{ fontSize: "36px" }}>PRODUITS</h1>
        </div>
        <button onClick={openAdd} className="btn-accent" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", borderRadius: "0px", border: "none", cursor: "pointer", fontSize: "14px" }}>
          <Plus size={16} /> NOUVEAU PRODUIT
        </button>
      </div>

      <div style={{ position: "relative", marginBottom: "20px" }}>
        <Search size={15} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit..."
          className="input-dark" style={{ width: "100%", padding: "11px 16px 11px 40px", borderRadius: "0px", fontSize: "14px", border: "1px solid var(--border)" }}
        />
      </div>

      <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0px", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 120px 120px 100px 80px 100px", padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
          {["IMG", "PRODUIT", "PRIX", "SOLDE", "STOCK", "ACTIF", "ACTIONS"].map(h => (
            <span key={h} style={{ fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", color: "var(--text-muted)", fontWeight: 700 }}>{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-condensed)" }}>Aucun produit trouvé.</div>
        ) : filtered.map(product => {
          const totalStock = (product.variants || []).reduce((s: any, v: any) => s + v.stock, 0);
          return (
            <div key={product.id}
              style={{ display: "grid", gridTemplateColumns: "60px 1fr 120px 120px 100px 80px 100px", padding: "14px 20px", borderBottom: "1px solid var(--border)", alignItems: "center", transition: "background 0.15s ease" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ position: "relative", width: "48px", height: "48px", borderRadius: "0px", overflow: "hidden", background: "var(--bg-elevated)", flexShrink: 0 }}>
                {product.images?.[0] && <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: "cover" }} />}
              </div>
              <div style={{ paddingLeft: "8px" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "2px" }}>{product.name}</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{(product.variants || []).length} variants</p>
              </div>
              <span style={{ fontFamily: "var(--font-condensed)", fontSize: "14px", fontWeight: 700 }}>{product.price.toLocaleString()} DA</span>
              <span style={{ fontFamily: "var(--font-condensed)", fontSize: "14px", fontWeight: 700, color: product.sale_price ? "var(--accent)" : "var(--text-muted)" }}>
                {product.sale_price ? `${product.sale_price.toLocaleString()} DA` : "—"}
              </span>
              <span style={{ fontSize: "13px", color: totalStock <= 5 ? "#f59e0b" : "var(--text-secondary)" }}>
                {totalStock} unités
              </span>
              <button onClick={() => toggleActive(product.id, product.is_active)}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
                {product.is_active
                  ? <Eye size={18} color="#22c55e" />
                  : <EyeOff size={18} color="var(--text-muted)" />
                }
              </button>
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => openEdit(product)}
                  style={{ padding: "6px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "0px", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", transition: "all 0.15s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                >
                  <Edit2 size={14} />
                </button>
                <button onClick={() => deleteProduct(product.id)}
                  style={{ padding: "6px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "0px", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", transition: "all 0.15s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.color = "#ef4444"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflow: "auto", margin: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontFamily: "var(--font-condensed)", fontSize: "20px", fontWeight: 700, letterSpacing: "0.04em" }}>
                {editProduct ? "MODIFIER PRODUIT" : "NOUVEAU PRODUIT"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>NOM DU PRODUIT</label>
                <input type="text" value={form.name}
                  onChange={e => setForm(fm => ({ ...fm, name: e.target.value }))}
                  placeholder="Gold Standard 100% Whey"
                  className="input-dark"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "0px", fontSize: "14px", border: "1px solid var(--border)" }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>MARQUE (ID ou UID)</label>
                <select value={form.brand_id}
                  onChange={e => setForm(fm => ({ ...fm, brand_id: e.target.value }))}
                  className="input-dark"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "0px", fontSize: "14px", border: "1px solid var(--border)" }}
                >
                  <option value="">(Aucune marque)</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>CATÉGORIE</label>
                <select value={form.category_id}
                  onChange={e => setForm(fm => ({ ...fm, category_id: e.target.value }))}
                  className="input-dark"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "0px", fontSize: "14px", border: "1px solid var(--border)" }}
                >
                  <option value="">(Aucune catégorie)</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>IMAGES URL (séparées par virgule)</label>
                <input type="text" value={form.images}
                  onChange={e => setForm(fm => ({ ...fm, images: e.target.value }))}
                  placeholder="/images/whey.jpg, https://example.com/img.png"
                  className="input-dark"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "0px", fontSize: "14px", border: "1px solid var(--border)" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                {[
                  { label: "PRIX (DA)", key: "price", type: "number", placeholder: "0" }, 
                  { label: "PRIX SOLDE", key: "sale_price", type: "number", placeholder: "0" }, 
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                      {f.label}
                    </label>
                    <input type={f.type} value={form[f.key as keyof typeof form] as string}
                      onChange={e => setForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="input-dark"
                      style={{ width: "100%", padding: "11px 14px", borderRadius: "0", fontSize: "14px", border: "1px solid var(--border)" }}
                    />
                  </div>
                ))}
              </div>

              {/* Variants Section */}
              <div style={{ marginBottom: "24px", padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <label style={{ fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 700, color: "var(--accent)" }}>VARIANTS (GOÛT / TAILLE / STOCK)</label>
                  <button 
                    onClick={() => setForm(fm => ({ ...fm, variants: [...fm.variants, { flavor: "", size: "", stock: "0" }] }))}
                    style={{ background: "none", border: "1px solid var(--accent)", color: "var(--accent)", padding: "4px 8px", borderRadius: "0", fontSize: "10px", fontWeight: 700, cursor: "pointer" }}
                  >
                    + AJOUTER
                  </button>
                </div>
                
                {form.variants.map((v, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 40px", gap: "8px", marginBottom: "8px", alignItems: "end" }}>
                    <div>
                      <input type="text" value={v.flavor} placeholder="Goût" 
                        onChange={e => {
                          const newV = [...form.variants];
                          newV[idx].flavor = e.target.value;
                          setForm(fm => ({ ...fm, variants: newV }));
                        }}
                        className="input-dark" style={{ width: "100%", padding: "8px", borderRadius: "0", fontSize: "12px", border: "1px solid var(--border)" }} />
                    </div>
                    <div>
                      <input type="text" value={v.size} placeholder="Taille (Ex: 2kg)" 
                        onChange={e => {
                          const newV = [...form.variants];
                          newV[idx].size = e.target.value;
                          setForm(fm => ({ ...fm, variants: newV }));
                        }}
                        className="input-dark" style={{ width: "100%", padding: "8px", borderRadius: "0", fontSize: "12px", border: "1px solid var(--border)" }} />
                    </div>
                    <div>
                      <input type="number" value={v.stock} placeholder="0" 
                        onChange={e => {
                          const newV = [...form.variants];
                          newV[idx].stock = e.target.value;
                          setForm(fm => ({ ...fm, variants: newV }));
                        }}
                        className="input-dark" style={{ width: "100%", padding: "8px", borderRadius: "0", fontSize: "12px", border: "1px solid var(--border)" }} />
                    </div>
                    <button 
                      onClick={() => {
                        if (form.variants.length > 1) {
                          setForm(fm => ({ ...fm, variants: fm.variants.filter((_, i) => i !== idx) }));
                        }
                      }}
                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "8px 0" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>DESCRIPTION</label>
                <textarea value={form.description} onChange={e => setForm(fm => ({ ...fm, description: e.target.value }))}
                  placeholder="Description du produit..."
                  rows={3}
                  className="input-dark"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "0px", fontSize: "14px", border: "1px solid var(--border)", resize: "vertical" }}
                />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "24px" }}>
                <div
                  onClick={() => setForm(fm => ({ ...fm, is_on_sale: !fm.is_on_sale }))}
                  style={{ width: "20px", height: "20px", borderRadius: "0px", border: `2px solid ${form.is_on_sale ? "var(--accent)" : "var(--border-bright)"}`, background: form.is_on_sale ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s ease", flexShrink: 0 }}
                >
                  {form.is_on_sale && <span style={{ fontSize: "12px", color: "#000", fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: "14px", color: "var(--text-primary)" }}>Marquer comme en solde</span>
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                {[
                  { label: "BIENFAITS", key: "bienfaits" },
                  { label: "UTILISATION", key: "utilisation" },
                  { label: "INGRÉDIENTS", key: "ingredients" }
                ].map(f => (
                  <div key={f.key} style={{ gridColumn: f.key === "ingredients" ? "span 2" : "auto" }}>
                    <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>{f.label}</label>
                    <textarea value={form[f.key as keyof typeof form] as string} onChange={e => setForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                      placeholder="..."
                      rows={2}
                      className="input-dark"
                      style={{ width: "100%", padding: "11px 14px", borderRadius: "0px", fontSize: "14px", border: "1px solid var(--border)", resize: "vertical" }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowModal(false)} disabled={isSaving} className="btn-ghost" style={{ flex: 1, padding: "13px", borderRadius: "0px", border: "1px solid var(--border)", background: "none", cursor: "pointer", fontSize: "14px" }}>
                  ANNULER
                </button>
                <button onClick={handleSave} disabled={isSaving} className="btn-accent" style={{ flex: 1, padding: "13px", borderRadius: "0px", border: "none", cursor: isSaving ? "not-allowed" : "pointer", fontSize: "14px", opacity: isSaving ? 0.7 : 1 }}>
                  {isSaving ? "SAUVEGARDE..." : (editProduct ? "SAUVEGARDER" : "CRÉER PRODUIT")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
