"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { 
  Save, 
  Layout, 
  Image as ImageIcon, 
  Type, 
  Zap, 
  MousePointer2, 
  Monitor,
  ChevronRight,
  RefreshCw,
  Target
} from "lucide-react";

import { Product } from "@/types";

export default function ContentEditorClient({ initialContent }: { initialContent: any }) {
  const [activeTab, setActiveTab] = useState("hero");
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("products").select("*, brand:brands(*)").order("name");
      if (data) setProducts(data);
    };
    fetchProducts();
  }, []);

  const defaults = {
    hero: {
      slides: [
        { tag: "", title: "", sub: "", cta: "", image: "", href: "" },
        { tag: "", title: "", sub: "", cta: "", image: "", href: "" },
        { tag: "", title: "", sub: "", cta: "", image: "", href: "" },
        { tag: "", title: "", sub: "", cta: "", image: "", href: "" }
      ]
    },
    brands: { label: "PARTENAIRES", heading: "MARQUES UNIVERSELLES" },
    goals: {
      label: "CHOISISSEZ VOTRE VOIE",
      heading: "QUEL EST VOTRE OBJECTIF ?",
      items: [
        { label: "", image: "", categoryId: "" },
        { label: "", image: "", categoryId: "" },
        { label: "", image: "", categoryId: "" },
        { label: "", image: "", categoryId: "" }
      ]
    },
    promo: { 
      text: "OFFRE SPÉCIALE · JUSQU'À -40% · STOCKS LIMITÉS",
      bgColor: "#FF51C5",
      textColor: "#000000"
    },
    flash: { 
      productId: "",
      label: "OFFRE LIMITÉE", 
      heading: "SOLDES SPÉCIAUX", 
      featuredTitle: "ON OPTI-WOMEN", 
      featuredTag: "[FEATURED]", 
      featuredImage: "/on-opti-women_Image_01.webp", 
      featuredSalePrice: "4900", 
      featuredOriginalPrice: "6500",
      bgColor: "#0A0A0A",
      accentColor: "#FF51C5",
      badgeColor: "#e6ff03ff",
      endsAt: new Date(Date.now() + 24 * 3600000).toISOString()
    },
    featured: { label: "EXCLUSIVITÉS NOEST", heading: "TOP SELLING WORTH THE HYPE", imageWorth: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80", imageSale: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80" }
  };

  const [content, setContent] = useState(() => {
    if (!initialContent || Object.keys(initialContent).length === 0) return defaults;
    return { ...defaults, ...initialContent };
  });

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    try {
      const fixedId = "00000000-0000-0000-0000-000000000000";
      const { error } = await supabase
        .from("store_settings")
        .upsert({ 
          id: fixedId,
          store_name: "RIVER NUTRITION",
          landing_content: content 
        });
      
      if (error) throw error;
      alert("Contenu mis à jour avec succès! 🎉");
      router.refresh();
    } catch (e: any) {
      alert("Erreur: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = (section: string, key: string, val: string) => {
    setContent((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [key]: val
      }
    }));
  };

  const handleHeroSlideUpdate = (idx: number, key: string, val: string) => {
    setContent((prev: any) => {
      const newSlides = [...prev.hero.slides];
      newSlides[idx] = { ...newSlides[idx], [key]: val };
      return { ...prev, hero: { ...prev.hero, slides: newSlides } };
    });
  };

  const handleGoalItemUpdate = (idx: number, key: string, val: string) => {
    setContent((prev: any) => {
      const newItems = [...prev.goals.items];
      newItems[idx] = { ...newItems[idx], [key]: val };
      return { ...prev, goals: { ...prev.goals, items: newItems } };
    });
  };

  const tabs = [
    { id: "hero", label: "Hero Slider", icon: ImageIcon },
    { id: "promo", label: "Promo Bar", icon: Zap },
    { id: "brands", label: "Partenaires", icon: Layout },
    { id: "goals", label: "Objectifs", icon: Target },
    { id: "flash", label: "Vente Flash", icon: Zap },
    { id: "featured", label: "Exclusivités", icon: MousePointer2 },
  ];

  return (
    <div className="dash-content-editor" style={{ color: "var(--text-primary)" }}>
      {/* Header */}
      <style>{`
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
      `}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid var(--border)" }}>
        <div>
          <p style={{ fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.22em", color: "var(--accent)", fontWeight: 700, marginBottom: "8px" }}>EDITEUR VISUEL</p>
          <h1 className="section-heading" style={{ fontSize: "clamp(28px, 5vw, 48px)", lineHeight: 1 }}>GESTION DU CONTENU</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-accent" style={{ padding: "14px 28px", borderRadius: "0px", display: "flex", alignItems: "center", gap: "10px", fontWeight: 700, fontSize: "14px", flexShrink: 0 }}>
          <Save size={18} className={saving ? "animate-spin" : ""} /> <span className="mobile-hide">{saving ? "SAUVEGARDE..." : "PUBLIER LES MODIFICATIONS"}</span><span className="mobile-show">{saving ? "GARDER.." : "PUBLIER"}</span>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "40px", alignItems: "start" }}>
        {/* Navigation Sidebar */}
        <div style={{ position: "sticky", top: "100px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "16px 20px", background: active ? "var(--bg-elevated)" : "transparent",
                  border: "none", borderLeft: active ? "3px solid var(--accent)" : "3px solid transparent",
                  color: active ? "var(--accent)" : "var(--text-secondary)",
                  cursor: "pointer", textAlign: "left", transition: "all 0.2s ease"
                }}>
                <tab.icon size={18} />
                <span style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "13px", letterSpacing: "0.05em" }}>{tab.label.toUpperCase()}</span>
                {active && <ChevronRight size={14} style={{ marginLeft: "auto" }} />}
              </button>
            );
          })}
        </div>

        {/* Editor Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Section: HERO */}
          {activeTab === "hero" && (
            <div className="fade-in" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", padding: "32px", position: "relative" }}>
              <div className="corner-plus top-right" style={{ color: "var(--accent)", top: "10px", right: "10px" }}>+</div>
              <h3 style={{ fontFamily: "var(--font-condensed)", fontSize: "18px", fontWeight: 700, letterSpacing: "0.06em", marginBottom: "28px" }}>SECTION HERO (4 SLIDES)</h3>
              
              <div style={{ display: "grid", gap: "48px" }}>
                {content.hero.slides.map((s: any, idx: number) => (
                  <div key={idx} style={{ 
                    padding: "24px", 
                    background: "rgba(255,255,255,0.02)", 
                    border: "1px solid var(--border)",
                    position: "relative"
                  }}>
                    <div style={{ position: "absolute", top: "-12px", right: "20px", background: "var(--accent)", color: "#000", padding: "2px 10px", fontSize: "10px", fontWeight: 900, fontFamily: "var(--font-condensed)" }}>
                      SLIDE {idx + 1}
                    </div>

                    <div style={{ display: "grid", gap: "20px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "16px", alignItems: "end" }}>
                        <div>
                          <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>URL IMAGE SLIDE {idx + 1}</label>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "4px 4px 4px 12px" }}>
                            <ImageIcon size={16} color="var(--text-muted)" />
                            <input type="text" value={s.image} onChange={e => handleHeroSlideUpdate(idx, "image", e.target.value)}
                              style={{ flex: 1, background: "none", border: "none", padding: "8px 0", color: "#fff", fontSize: "13px" }}
                            />
                          </div>
                        </div>
                        <div style={{ height: "46px", border: "1px solid var(--border)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.1)" }}>
                          {s.image ? (
                            <img src={s.image} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <ImageIcon size={16} color="var(--text-muted)" />
                          )}
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                          <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>LABEL (TAG)</label>
                          <input type="text" value={s.tag} onChange={e => handleHeroSlideUpdate(idx, "tag", e.target.value)}
                            style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "12px 16px", color: "#fff", fontSize: "13px" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>LIEN (HREF)</label>
                          <input type="text" value={s.href} onChange={e => handleHeroSlideUpdate(idx, "href", e.target.value)}
                            style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "12px 16px", color: "#fff", fontSize: "13px" }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>TITRE PRINCIPAL</label>
                        <textarea rows={2} value={s.title} onChange={e => handleHeroSlideUpdate(idx, "title", e.target.value)}
                          style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "12px 16px", color: "#fff", fontSize: "18px", fontFamily: "var(--font-display)" }}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                          <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>SOUS-TITRE</label>
                          <input type="text" value={s.sub} onChange={e => handleHeroSlideUpdate(idx, "sub", e.target.value)}
                            style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "12px 16px", color: "#fff", fontSize: "13px" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>MODALITÉ BOUTON (CTA)</label>
                          <input type="text" value={s.cta} onChange={e => handleHeroSlideUpdate(idx, "cta", e.target.value)}
                            style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "12px 16px", color: "#fff", fontSize: "13px" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: BRANDS */}
          {activeTab === "brands" && (
            <div className="fade-in" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", padding: "32px" }}>
              <h3 style={{ fontFamily: "var(--font-condensed)", fontSize: "18px", fontWeight: 700, letterSpacing: "0.06em", marginBottom: "28px" }}>SECTION PARTENAIRES</h3>
              <div style={{ display: "grid", gap: "24px" }}>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>LABEL</label>
                  <input type="text" value={content.brands.label} onChange={e => handleUpdate("brands", "label", e.target.value)}
                    style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "12px 16px", color: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>TITRE DE SECTION</label>
                  <input type="text" value={content.brands.heading} onChange={e => handleUpdate("brands", "heading", e.target.value)}
                    style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "12px 16px", color: "#fff" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section: GOALS */}
          {activeTab === "goals" && (
            <div className="fade-in" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", padding: "32px", position: "relative" }}>
              <div className="corner-plus top-right" style={{ color: "var(--accent)", top: "10px", right: "10px" }}>+</div>
              <h3 style={{ fontFamily: "var(--font-condensed)", fontSize: "18px", fontWeight: 700, letterSpacing: "0.06em", marginBottom: "24px" }}>SECTION OBJECTIFS (4 CARTES)</h3>
              
              <div style={{ display: "grid", gap: "24px", marginBottom: "32px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>PETIT LABEL</label>
                    <input type="text" value={content.goals.label} onChange={e => handleUpdate("goals", "label", e.target.value)}
                      style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "12px 16px", color: "#fff", fontSize: "13px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>TITRE PRINCIPAL</label>
                    <input type="text" value={content.goals.heading} onChange={e => handleUpdate("goals", "heading", e.target.value)}
                      style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "12px 16px", color: "#fff", fontSize: "13px" }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                {content.goals.items.map((item: any, idx: number) => (
                  <div key={idx} style={{ padding: "16px", border: "1px solid var(--border)", background: "rgba(255,255,255,0.01)" }}>
                    <p style={{ fontFamily: "var(--font-condensed)", fontSize: "11px", fontWeight: 800, color: "var(--accent)", marginBottom: "12px" }}>CARTE {idx + 1}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>LABEL</label>
                        <input type="text" value={item.label} onChange={e => handleGoalItemUpdate(idx, "label", e.target.value)}
                          style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", padding: "8px", color: "#fff", fontSize: "12px" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>IMAGE URL</label>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input type="text" value={item.image} onChange={e => handleGoalItemUpdate(idx, "image", e.target.value)}
                            style={{ flex: 1, background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", padding: "8px", color: "#fff", fontSize: "12px" }}
                          />
                          <div style={{ width: "32px", height: "32px", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                             {item.image ? (
                               <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                             ) : (
                               <Target size={14} color="var(--text-muted)" />
                             )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: PROMO */}
          {activeTab === "promo" && (
            <div className="fade-in" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", padding: "32px" }}>
              <h3 style={{ fontFamily: "var(--font-condensed)", fontSize: "18px", fontWeight: 700, letterSpacing: "0.06em", marginBottom: "28px" }}>BARRE DE PROMOTION DÉFILANTE</h3>
              <div>
                <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>TEXTE DÉFILANT</label>
                <textarea rows={3} value={content.promo.text} onChange={e => handleUpdate("promo", "text", e.target.value)}
                  style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "12px 16px", color: "#fff", lineHeight: 1.6 }}
                />
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "12px" }}>Utilisez le point médian (·) pour séparer les offres.</p>
              </div>
              
              <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "24px", marginTop: "16px" }}>
                <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.13em", fontWeight: 700, color: "var(--accent)", marginBottom: "16px" }}>PERSONNALISATION DES COULEURS</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>COULEUR DE FOND</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input type="color" value={content.promo.bgColor || "#FF51C5"} onChange={e => handleUpdate("promo", "bgColor", e.target.value)}
                        style={{ width: "32px", height: "32px", border: "1px solid var(--border)", background: "none", cursor: "pointer" }}
                      />
                      <input type="text" value={content.promo.bgColor || "#FF51C5"} onChange={e => handleUpdate("promo", "bgColor", e.target.value)}
                        style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "4px 8px", color: "#fff", fontSize: "12px" }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>COULEUR DU TEXTE</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input type="color" value={content.promo.textColor || "#000000"} onChange={e => handleUpdate("promo", "textColor", e.target.value)}
                        style={{ width: "32px", height: "32px", border: "1px solid var(--border)", background: "none", cursor: "pointer" }}
                      />
                      <input type="text" value={content.promo.textColor || "#000000"} onChange={e => handleUpdate("promo", "textColor", e.target.value)}
                        style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "4px 8px", color: "#fff", fontSize: "12px" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: FLASH */}
          {activeTab === "flash" && (
            <div className="fade-in" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", padding: "32px" }}>
              <h3 style={{ fontFamily: "var(--font-condensed)", fontSize: "18px", fontWeight: 700, letterSpacing: "0.06em", marginBottom: "28px" }}>SECTION VENTE FLASH</h3>
              <div style={{ display: "grid", gap: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>PETIT LABEL</label>
                    <input type="text" value={content.flash.label} onChange={e => handleUpdate("flash", "label", e.target.value)}
                      style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "12px 16px", color: "#fff" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>TITRE PRINCIPAL</label>
                    <input type="text" value={content.flash.heading} onChange={e => handleUpdate("flash", "heading", e.target.value)}
                      style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "12px 16px", color: "#fff" }}
                    />
                  </div>
                </div>

                <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "24px" }}>
                  <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.13em", fontWeight: 700, color: "var(--accent)", marginBottom: "16px" }}>PRODUIT VEDETTE (IMAGE & PRIX)</label>
                  
                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>SÉLECTIONNER UN PRODUIT</label>
                    <select 
                      value={content.flash.productId || ""} 
                      onChange={(e) => {
                        const pid = e.target.value;
                        const product = products.find(p => p.id === pid);
                        if (product) {
                          setContent((prev: any) => ({
                            ...prev,
                            flash: {
                              ...prev.flash,
                              productId: pid,
                              featuredTitle: product.name.toUpperCase(),
                              featuredImage: product.images[0] || "",
                              featuredSalePrice: (product.sale_price || product.price).toString(),
                              featuredOriginalPrice: product.price.toString(),
                              featuredTag: product.brand?.name ? `[${product.brand.name.toUpperCase()}]` : "[FEATURED]"
                            }
                          }));
                        } else {
                          handleUpdate("flash", "productId", "");
                        }
                      }}
                      style={{ 
                        width: "100%", 
                        background: "rgba(255,255,255,0.03)", 
                        border: "1px solid var(--border)", 
                        padding: "12px 16px", 
                        color: "#fff",
                        fontSize: "13px"
                      }}
                    >
                      <option value="" style={{ background: "var(--bg-secondary)" }}>-- Sélectionner un produit --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} style={{ background: "var(--bg-secondary)" }}>
                          {p.name} ({p.price} DA)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: "20px", marginBottom: "20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>URL IMAGE PRODUIT VEDETTE</label>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "4px 4px 4px 12px" }}>
                          <ImageIcon size={14} color="var(--text-muted)" />
                          <input type="text" value={content.flash.featuredImage} onChange={e => handleUpdate("flash", "featuredImage", e.target.value)}
                            style={{ flex: 1, background: "none", border: "none", padding: "8px 0", color: "#fff", fontSize: "12px" }}
                          />
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>PRIX DE VENTE (DA)</label>
                          <input type="text" value={content.flash.featuredSalePrice} onChange={e => handleUpdate("flash", "featuredSalePrice", e.target.value)}
                            style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "10px 12px", color: "var(--accent)", fontWeight: 700 }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>PRIX ORIGINAL (DA)</label>
                          <input type="text" value={content.flash.featuredOriginalPrice} onChange={e => handleUpdate("flash", "featuredOriginalPrice", e.target.value)}
                            style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "10px 12px", color: "var(--text-muted)", textDecoration: "line-through" }}
                          />
                        </div>
                      </div>
                    </div>
                    <div style={{ height: "100%", border: "1px solid var(--border)", background: "#000", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {content.flash.featuredImage ? (
                        <img src={content.flash.featuredImage} alt="featured preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      ) : (
                        <Zap size={24} color="var(--text-muted)" />
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div>
                      <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "8px" }}>NOM DU PRODUIT</label>
                      <input type="text" value={content.flash.featuredTitle} onChange={e => handleUpdate("flash", "featuredTitle", e.target.value)}
                        style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "12px 16px", color: "#fff" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "8px" }}>PETITE ÉTIQUETTE [BRACKETS]</label>
                      <input type="text" value={content.flash.featuredTag} onChange={e => handleUpdate("flash", "featuredTag", e.target.value)}
                        style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "12px 16px", color: "#fff" }}
                      />
                    </div>
                  </div>

                  <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "24px" }}>
                    <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.13em", fontWeight: 700, color: "var(--accent)", marginBottom: "16px" }}>PERSONNALISATION DES COULEURS</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>COULEUR DE FOND</label>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input type="color" value={content.flash.bgColor || "#0A0A0A"} onChange={e => handleUpdate("flash", "bgColor", e.target.value)}
                            style={{ width: "32px", height: "32px", border: "1px solid var(--border)", background: "none", cursor: "pointer" }}
                          />
                          <input type="text" value={content.flash.bgColor || "#0A0A0A"} onChange={e => handleUpdate("flash", "bgColor", e.target.value)}
                            style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "4px 8px", color: "#fff", fontSize: "12px" }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>COULEUR ACCENT (ROSE)</label>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input type="color" value={content.flash.accentColor || "#FF51C5"} onChange={e => handleUpdate("flash", "accentColor", e.target.value)}
                            style={{ width: "32px", height: "32px", border: "1px solid var(--border)", background: "none", cursor: "pointer" }}
                          />
                          <input type="text" value={content.flash.accentColor || "#FF51C5"} onChange={e => handleUpdate("flash", "accentColor", e.target.value)}
                            style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "4px 8px", color: "#fff", fontSize: "12px" }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>COULEUR BADGE (-25%)</label>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input type="color" value={content.flash.badgeColor || "#e6ff03ff"} onChange={e => handleUpdate("flash", "badgeColor", e.target.value)}
                            style={{ width: "32px", height: "32px", border: "1px solid var(--border)", background: "none", cursor: "pointer" }}
                          />
                          <input type="text" value={content.flash.badgeColor || "#e6ff03ff"} onChange={e => handleUpdate("flash", "badgeColor", e.target.value)}
                            style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "4px 8px", color: "#fff", fontSize: "12px" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "24px", marginTop: "16px" }}>
                    <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.13em", fontWeight: 700, color: "var(--accent)", marginBottom: "16px" }}>CONTRÔLE DU COMPTE À REBOURS</label>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>DATE ET HEURE D'EXPIRATION</label>
                      <input 
                        type="datetime-local" 
                        value={content.flash.endsAt ? new Date(content.flash.endsAt).toISOString().slice(0, 16) : ""} 
                        onClick={(e) => (e.target as any).showPicker?.()}
                        onChange={(e) => {
                          const val = e.target.value ? new Date(e.target.value).toISOString() : "";
                          handleUpdate("flash", "endsAt", val);
                        }}
                        style={{ 
                          width: "100%", 
                          background: "rgba(255,255,255,0.03)", 
                          border: "1px solid var(--border)", 
                          padding: "12px 16px", 
                          color: "#fff",
                          fontSize: "13px",
                          cursor: "pointer"
                        }}
                      />
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>Sélectionnez le moment précis où l'offre expire. Le compte à rebours s'ajustera automatiquement.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: FEATURED */}
          {activeTab === "featured" && (
            <div className="fade-in" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", padding: "32px" }}>
              <h3 style={{ fontFamily: "var(--font-condensed)", fontSize: "18px", fontWeight: 700, letterSpacing: "0.06em", marginBottom: "28px" }}>SECTION EXCLUSIVITÉS</h3>
              <div style={{ display: "grid", gap: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "10px", alignItems: "end" }}>
                    <div>
                      <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>IMAGE TUBE (WORTH THE HYPE)</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "4px 4px 4px 12px" }}>
                        <ImageIcon size={14} color="var(--text-muted)" />
                        <input type="text" value={content.featured.imageWorth} onChange={e => handleUpdate("featured", "imageWorth", e.target.value)}
                          style={{ flex: 1, background: "none", border: "none", padding: "8px 0", color: "#fff", fontSize: "12px" }}
                        />
                      </div>
                    </div>
                    <div style={{ height: "46px", border: "1px solid var(--border)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {content.featured.imageWorth ? (
                        <img src={content.featured.imageWorth} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <ImageIcon size={16} color="var(--text-muted)" />
                      )}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "10px", alignItems: "end" }}>
                    <div>
                      <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>IMAGE TUBE (ON SALE)</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "4px 4px 4px 12px" }}>
                        <ImageIcon size={14} color="var(--text-muted)" />
                        <input type="text" value={content.featured.imageSale} onChange={e => handleUpdate("featured", "imageSale", e.target.value)}
                          style={{ flex: 1, background: "none", border: "none", padding: "8px 0", color: "#fff", fontSize: "12px" }}
                        />
                      </div>
                    </div>
                    <div style={{ height: "46px", border: "1px solid var(--border)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {content.featured.imageSale ? (
                        <img src={content.featured.imageSale} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <ImageIcon size={16} color="var(--text-muted)" />
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>ÉTIQUETTE NOIRE (LABEL)</label>
                  <input type="text" value={content.featured.label} onChange={e => handleUpdate("featured", "label", e.target.value)}
                    style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "12px 16px", color: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>TITRE DE SECTION (H2)</label>
                  <textarea rows={2} value={content.featured.heading} onChange={e => handleUpdate("featured", "heading", e.target.value)}
                    style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: "12px 16px", color: "#fff", fontFamily: "var(--font-display)" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sidebar Hint */}
          <div style={{ background: "rgba(232,255,0,0.05)", border: "1px dashed var(--accent)33", padding: "20px", display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--accent)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Monitor size={16} />
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "13px", color: "var(--accent)", letterSpacing: "0.04em", marginBottom: "4px" }}>MODE APERÇU DIRECT</p>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Toutes les modifications apportées ici seront reflétées immédiatement sur le site après avoir cliqué sur "Publier". Assurez-vous que les titres restent concis pour une meilleure lisibilité mobile.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
