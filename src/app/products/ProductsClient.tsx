"use client";
import { useState } from "react";
import { Filter, SlidersHorizontal, X, ChevronDown, Sparkles, Tag, ArrowUpDown, LayoutGrid, Grid, List } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useRouter, useSearchParams } from "next/navigation";
import { Product, Brand, Category } from "@/types";

interface ProductsClientProps {
  initialProducts: Product[];
  total: number;
  brands: Brand[];
  categories: Category[];
}

export default function ProductsClient({ initialProducts, total, brands, categories }: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const selectedBrand = searchParams.get('brand');
  const selectedCategory = searchParams.get('category');
  const onSaleOnly = searchParams.get('sale') === 'true';
  const currentPage = searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 0;

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete('page'); // reset page on filter change
    router.push(`/products?${params.toString()}`);
  }

  const setSelectedBrand = (val: string | null) => updateParam('brand', val);
  const setSelectedCategory = (val: string | null) => updateParam('category', val);
  const setOnSaleOnly = (val: boolean) => updateParam('sale', val ? 'true' : null);

  const [popularOnly, setPopularOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");
  const [viewMode, setViewMode] = useState<"grid-3" | "grid-4" | "list">("grid-4");

  const [openSection, setOpenSection] = useState<string | null>("category");

  let filtered = [...initialProducts];
  if (popularOnly) {
    // Note: 'is_popular' may not match typed schema, if not remove or mock here
    // filtered = filtered.filter(p => p.is_popular);
  }
  if (sortBy === "price-asc") filtered.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
  if (sortBy === "price-desc") filtered.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));

  const hasFilters = selectedBrand || selectedCategory || onSaleOnly || popularOnly || sortBy !== "default";

  const FilterPanel = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      
      {/* Filter Card: Prix */}
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-condensed)", letterSpacing: "0.1em", color: "#fff", marginBottom: "8px" }}>PRIX</h3>
        <div style={{ border: "1px solid var(--border)", background: openSection === "price" ? "rgba(232,255,0,0.02)" : "transparent" }}>
          <button onClick={() => setOpenSection(openSection === "price" ? null : "price")}
            style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", border: "none", color: "#fff", cursor: "pointer", padding: "14px 16px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-condensed)", fontWeight: 700 }}>{openSection === "price" ? "FERMER" : "SÉLECTIONNER"}</span>
            <ChevronDown size={14} style={{ color: openSection === "price" ? "var(--accent)" : "inherit", transform: openSection === "price" ? "rotate(180deg)" : "none", transition: "0.2s" }} />
          </button>
          {openSection === "price" && (
            <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)" }}>
              <div style={{ padding: "12px 0 8px" }}>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-condensed)", fontWeight: 700, letterSpacing: "0.08em" }}>TRIER PAR PRIX</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {[
                  { val: "default", label: "Par défaut" },
                  { val: "price-asc", label: "Prix croissant" },
                  { val: "price-desc", label: "Prix décroissant" },
                ].map(opt => (
                  <button key={opt.val} onClick={() => setSortBy(opt.val as any)}
                    style={{ textAlign: "left", background: "none", border: "none", color: sortBy === opt.val ? "var(--accent)" : "var(--text-secondary)", fontSize: "13px", padding: "8px 0", cursor: "pointer", fontFamily: "var(--font-condensed)", fontWeight: sortBy === opt.val ? 700 : 400 }}>
                    {opt.label.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Toggle: Sales */}
      <div style={{ marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, fontFamily: "var(--font-condensed)", color: onSaleOnly ? "#fff" : "var(--text-secondary)", letterSpacing: "0.1em" }}>PRODUITS EN SOLDE</span>
        <button onClick={() => setOnSaleOnly(!onSaleOnly)} 
          style={{ width: "36px", height: "20px", background: onSaleOnly ? "var(--accent)" : "rgba(255,255,255,0.05)", borderRadius: "0px", border: `1px solid ${onSaleOnly ? "var(--accent)" : "var(--border)"}`, position: "relative", cursor: "pointer", transition: "all 0.3s ease", padding: 0 }}>
          <div style={{ position: "absolute", top: "50%", left: onSaleOnly ? "calc(100% - 16px)" : "2px", transform: "translateY(-50%)", width: "14px", height: "14px", background: onSaleOnly ? "#000" : "var(--text-muted)", borderRadius: "0%", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }} />
        </button>
      </div>

      {/* Filter Card: Sous-catégorie */}
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-condensed)", letterSpacing: "0.1em", color: "#fff", marginBottom: "8px" }}>SOUS-CATÉGORIE</h3>
        <div style={{ border: "1px solid var(--border)", background: openSection === "category" ? "rgba(232,255,0,0.02)" : "transparent" }}>
          <button onClick={() => setOpenSection(openSection === "category" ? null : "category")}
            style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", border: "none", color: "#fff", cursor: "pointer", padding: "14px 16px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-condensed)", fontWeight: 700 }}>{openSection === "category" ? "FERMER" : "SÉLECTIONNER"}</span>
            <ChevronDown size={14} style={{ color: openSection === "category" ? "var(--accent)" : "inherit", transform: openSection === "category" ? "rotate(180deg)" : "none", transition: "0.2s" }} />
          </button>
          {openSection === "category" && (
            <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)" }}>
              <div style={{ padding: "12px 0 8px" }}>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-condensed)", fontWeight: 700, letterSpacing: "0.08em" }}>BOUTIQUE / CATÉGORIES</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <button onClick={() => setSelectedCategory(null)}
                  style={{
                    background: !selectedCategory ? "var(--accent)" : "rgba(255,255,255,0.03)",
                    color: !selectedCategory ? "#000" : "#fff",
                    border: "1px solid var(--border)", padding: "6px 12px", fontSize: "11px",
                    fontFamily: "var(--font-condensed)", fontWeight: 700, cursor: "pointer", borderRadius: "0px"
                  }}>TOUTS</button>
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      background: selectedCategory === cat.id ? "var(--accent)" : "rgba(255,255,255,0.03)",
                      color: selectedCategory === cat.id ? "#000" : "var(--text-secondary)",
                      border: `1px solid ${selectedCategory === cat.id ? "var(--accent)" : "var(--border)"}`,
                      padding: "6px 12px", fontSize: "11px",
                      fontFamily: "var(--font-condensed)", fontWeight: 700, cursor: "pointer", borderRadius: "0px",
                      transition: "all 0.15s ease"
                    }}>
                    {cat.name.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Card: Marque */}
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-condensed)", letterSpacing: "0.1em", color: "#fff", marginBottom: "8px" }}>MARQUE</h3>
        <div style={{ border: "1px solid var(--border)", background: openSection === "brand" ? "rgba(232,255,0,0.02)" : "transparent" }}>
          <button onClick={() => setOpenSection(openSection === "brand" ? null : "brand")}
            style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", border: "none", color: "#fff", cursor: "pointer", padding: "14px 16px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-condensed)", fontWeight: 700 }}>{openSection === "brand" ? "FERMER" : "SÉLECTIONNER"}</span>
            <ChevronDown size={14} style={{ color: openSection === "brand" ? "var(--accent)" : "inherit", transform: openSection === "brand" ? "rotate(180deg)" : "none", transition: "0.2s" }} />
          </button>
          {openSection === "brand" && (
            <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)" }}>
              <div style={{ padding: "12px 0 8px" }}>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-condensed)", fontWeight: 700, letterSpacing: "0.08em" }}>BOUTIQUE / MARQUES</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <button onClick={() => setSelectedBrand(null)}
                  style={{
                    background: !selectedBrand ? "var(--accent)" : "rgba(255,255,255,0.03)",
                    color: !selectedBrand ? "#000" : "#fff",
                    border: "1px solid var(--border)", padding: "6px 12px", fontSize: "11px",
                    fontFamily: "var(--font-condensed)", fontWeight: 700, cursor: "pointer", borderRadius: "0px"
                  }}>TOUTS</button>
                {brands.map(brand => (
                  <button key={brand.id} onClick={() => setSelectedBrand(brand.id)}
                    style={{
                      background: selectedBrand === brand.id ? "var(--accent)" : "rgba(255,255,255,0.03)",
                      color: selectedBrand === brand.id ? "#000" : "var(--text-secondary)",
                      border: `1px solid ${selectedBrand === brand.id ? "var(--accent)" : "var(--border)"}`,
                      padding: "6px 12px", fontSize: "11px",
                      fontFamily: "var(--font-condensed)", fontWeight: 700, cursor: "pointer", borderRadius: "0px",
                      transition: "all 0.15s ease"
                    }}>
                    {brand.name.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toggles */}
      <div style={{ marginBottom: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <button onClick={() => setPopularOnly(!popularOnly)} style={{ display: "flex", alignItems: "center", gap: "10px", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <div style={{ width: "18px", height: "18px", border: `2px solid ${popularOnly ? "var(--accent)" : "var(--border-bright)"}`, background: popularOnly ? "var(--accent)" : "transparent", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {popularOnly && <span style={{ color: "#000", fontSize: "12px", fontWeight: 800 }}>✓</span>}
          </div>
          <span style={{ fontSize: "13px", color: popularOnly ? "#fff" : "var(--text-secondary)" }}>Produits populaires</span>
        </button>
      </div>

    </div>
  );

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />

      {/* Banner */}
      <div style={{ height: "300px", background: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://png.pngtree.com/thumb_back/fh260/background/20230527/pngtree-black-gym-with-heavy-weights-image_2687614.jpg')", backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div>
          <p style={{ fontFamily: "var(--font-condensed)", fontSize: "12px", letterSpacing: "0.2em", color: "var(--accent)", fontWeight: 700, marginBottom: "8px" }}>CATALOGUE EXCLUSIF</p>
          <h1 className="section-heading" style={{ fontSize: "clamp(32px, 6vw, 64px)", color: "#fff" }}>TOUS LES <span style={{ color: "var(--accent)" }}>PRODUITS</span></h1>
        </div>
      </div>

      <div style={{ maxWidth: "100%", margin: "0 auto", padding: "60px 40px 60px 12px" }}>
        
        <div className="product-layout-grid" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "40px", alignItems: "start" }}>
          
          {/* Sidebar */}
          <aside className="mobile-hide" style={{ 
            position: "sticky", 
            top: "54px", 
            height: "calc(100vh - 54px)", 
            overflowY: "auto", 
            borderRight: "1px solid var(--border)", 
            paddingBottom: "40px",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              borderTop: "1px solid var(--border)",
              borderBottom: "1px solid var(--border)",
              padding: "16px 20px 16px 12px", // tight left padding
              marginBottom: "32px",
              marginRight: "-1px"
            }}>
              <h2 style={{ 
                fontFamily: "var(--font-condensed)", 
                fontSize: "14px", 
                fontWeight: 800, 
                letterSpacing: "0.15em", 
                color: "#fff",
                margin: 0
              }}>FILTRES</h2>
              <button onClick={() => { setSelectedBrand(null); setSelectedCategory(null); setOnSaleOnly(false); setPopularOnly(false); setSortBy("default"); }}
                style={{ 
                  background: "rgba(255,255,255,0.03)", 
                  border: "1px solid var(--border)", 
                  color: "var(--accent)", 
                  fontSize: "10px", 
                  fontFamily: "var(--font-condensed)", 
                  letterSpacing: "0.04em", 
                  cursor: "pointer", 
                  padding: "6px 12px",
                  borderRadius: "2px",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}>
                RÉINITIALISER
              </button>
            </div>
            
            <div style={{ paddingRight: "40px" }}>
              <FilterPanel />
            </div>
          </aside>

          {/* Grid */}
          <main>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
              <span style={{ fontSize: "13px", color: "var(--text-muted)", letterSpacing: "0.04em", fontWeight: 700 }}>{filtered.length} PRODUITS DISPONIBLES</span>
              
              <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                {/* View Mode Buttons (Segmented Control) */}
                <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "2px", overflow: "hidden", background: "rgba(255,255,255,0.02)" }}>
                  <button onClick={() => setViewMode("grid-3")} 
                    style={{ 
                      background: viewMode === "grid-3" ? "var(--accent)" : "transparent", 
                      border: "none", padding: "8px 12px", cursor: "pointer", 
                      color: viewMode === "grid-3" ? "#000" : "rgba(255,255,255,0.4)", 
                      transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center" 
                    }} title="3 Colonnes">
                    <Grid size={16} strokeWidth={viewMode === "grid-3" ? 3 : 2} />
                  </button>
                  <button onClick={() => setViewMode("grid-4")} 
                    style={{ 
                      background: viewMode === "grid-4" ? "var(--accent)" : "transparent", 
                      borderLeft: "1px solid var(--border)", padding: "8px 12px", cursor: "pointer", 
                      color: viewMode === "grid-4" ? "#000" : "rgba(255,255,255,0.4)", 
                      transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center" 
                    }} title="4 Colonnes">
                    <LayoutGrid size={16} strokeWidth={viewMode === "grid-4" ? 3 : 2} />
                  </button>
                  <button onClick={() => setViewMode("list")} 
                    style={{ 
                      background: viewMode === "list" ? "var(--accent)" : "transparent", 
                      borderLeft: "1px solid var(--border)", padding: "8px 12px", cursor: "pointer", 
                      color: viewMode === "list" ? "#000" : "rgba(255,255,255,0.4)", 
                      transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center" 
                    }} title="Liste">
                    <List size={16} strokeWidth={viewMode === "list" ? 3 : 2} />
                  </button>
                </div>

                <button 
                  onClick={() => setFiltersOpen(!filtersOpen)} 
                  className="mobile-show btn-ghost" 
                  style={{ display: "flex", alignItems: "center", gap: "8px", border: "1px solid var(--border)", padding: "8px 16px", borderRadius: "4px" }}
                >
                  <SlidersHorizontal size={16} /> FILTRER
                </button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "100px 0" }}>
                <p style={{ fontFamily: "var(--font-condensed)", fontSize: "20px", color: "var(--text-muted)" }}>AUCUN PRODUIT NE CORRESPOND À VOS CRITÈRES</p>
              </div>
            ) : (
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: viewMode === "list" 
                  ? "1fr" 
                  : `repeat(auto-fill, minmax(${viewMode === "grid-3" ? "30%" : "22%"}, 1fr))`, 
                gap: "20px" 
              }} className="catalog-grid">
                {filtered.map(product => <ProductCard key={product.id} product={product} isList={viewMode === "list"} />)}
              </div>
            )}
          </main>

        </div>
      </div>

      <Footer />

      {/* Mobile Drawer */}
      {filtersOpen && (
        <div className="mobile-show">
          {/* Sidebar */}
          <div style={{ 
            position: "fixed", top: 0, left: 0, bottom: 0, width: "85%", maxWidth: "340px", 
            background: "var(--bg-primary)", zIndex: 1001, padding: "32px 24px", overflowY: "auto", 
            borderRight: "1px solid var(--border)", boxShadow: "20px 0 40px rgba(0,0,0,0.7)" 
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
               <h2 style={{ fontFamily: "var(--font-condensed)", fontSize: "24px", fontWeight: 800 }}>FILTRES</h2>
               <button onClick={() => setFiltersOpen(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={32} /></button>
            </div>
            <FilterPanel />
            <button onClick={() => setFiltersOpen(false)} className="btn-accent" style={{ width: "100%", marginTop: "40px", padding: "16px", cursor: "pointer" }}>VOIR LES RÉSULTATS</button>
          </div>
          {/* Backdrop */}
          <div onClick={() => setFiltersOpen(false)} style={{ 
             position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, 
             backdropFilter: "blur(4px)", animation: "fadeIn 0.3s ease", cursor: "pointer"
          }} />
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1024px) {
          .product-layout-grid { grid-template-columns: 1fr !important; }
          .mobile-hide { display: none !important; }
        }
        @media (min-width: 1025px) {
          .mobile-show { display: none !important; }
        }
      `}} />
    </div>
  );
}
