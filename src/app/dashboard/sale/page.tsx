"use client";
import { useState } from "react";
import { Zap, Tag, ToggleLeft, ToggleRight } from "lucide-react";
import { mockProducts } from "@/lib/mock-data";

export default function SalePage() {
  const [saleActive, setSaleActive] = useState(true);
  const [startDate, setStartDate] = useState("2024-01-18T00:00");
  const [endDate, setEndDate] = useState("2024-01-21T23:59");
  const [saleLabel, setSaleLabel] = useState("Soldes Spéciaux");
  const [onSaleIds, setOnSaleIds] = useState<string[]>(mockProducts.filter(p => p.is_on_sale).map(p => p.id));
  const [salePrices, setSalePrices] = useState<Record<string, string>>(
    Object.fromEntries(mockProducts.map(p => [p.id, p.sale_price ? String(p.sale_price) : ""]))
  );

  const toggleProduct = (id: string) => setOnSaleIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1099px) {
          .sale-page-grid { grid-template-columns: 1fr !important; }
          .sale-preview-sidebar { position: relative !important; top: 0 !important; width: 100% !important; margin-top: 24px; }
        }
        @media (max-width: 599px) {
          .date-grid { grid-template-columns: 1fr !important; }
          .product-sale-item { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .product-sale-price-input { width: 100% !important; }
        }
      `}} />

      <div>
        <div style={{ marginBottom: "28px" }}>
          <p style={{ 
            fontFamily: "var(--font-condensed)", 
            fontSize: "11px", 
            letterSpacing: "0.22em", 
            color: "var(--accent)", 
            fontWeight: 500, 
            background: "#000",
            display: "inline-block",
            padding: "4px 12px",
            textTransform: "uppercase",
            marginBottom: "12px"
          }}>
            PROMOTIONS
          </p>
          <h1 className="section-heading" style={{ fontSize: "clamp(32px, 5vw, 42px)", lineHeight: "1.1" }}>VENTE FLASH</h1>
        </div>

        <div className="sale-page-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px", alignItems: "start" }}>

          {/* Settings */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Toggle */}
            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0px", padding: "24px", position: "relative" }}>
              <div className="corner-plus top-right" style={{ color: "var(--accent)", top: "10px", right: "10px" }}>+</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-condensed)", fontSize: "18px", fontWeight: 700, letterSpacing: "0.04em", marginBottom: "4px" }}>STATUT DE LA VENTE</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Active / désactive le compte à rebours sur la page d&apos;accueil</p>
                </div>
                <button onClick={() => setSaleActive(!saleActive)} style={{ background: "none", border: "none", cursor: "pointer", color: saleActive ? "var(--accent)" : "var(--text-muted)" }}>
                  {saleActive ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                </button>
              </div>
            </div>

            {/* Label & dates */}
            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0px", padding: "24px", position: "relative" }}>
              <div className="corner-plus top-right" style={{ color: "var(--text-muted)", top: "10px", right: "10px" }}>+</div>
              <h3 style={{ fontFamily: "var(--font-condensed)", fontSize: "17px", fontWeight: 700, letterSpacing: "0.04em", marginBottom: "20px" }}>CONFIGURATION</h3>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>TITRE DE LA VENTE</label>
                <input type="text" value={saleLabel} onChange={e => setSaleLabel(e.target.value)} className="input-dark"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "6px", fontSize: "14px", border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)", color: "#fff" }}
                />
              </div>
              <div className="date-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[{ label: "DÉBUT", val: startDate, set: setStartDate }, { label: "FIN", val: endDate, set: setEndDate }].map(f => (
                  <div key={f.label}>
                    <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>{f.label}</label>
                    <input type="datetime-local" value={f.val} onChange={e => f.set(e.target.value)} className="input-dark"
                      style={{ width: "100%", padding: "11px 14px", borderRadius: "6px", fontSize: "13px", border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)", color: "#fff" }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Products in sale */}
            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0px", padding: "24px", position: "relative" }}>
              <div className="corner-plus top-right" style={{ color: "var(--accent)", top: "10px", right: "10px" }}>+</div>
              <h3 style={{ fontFamily: "var(--font-condensed)", fontSize: "17px", fontWeight: 700, letterSpacing: "0.04em", marginBottom: "20px" }}>PRODUITS EN SOLDE ({onSaleIds.length})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {mockProducts.map(p => {
                  const isSelected = onSaleIds.includes(p.id);
                  return (
                    <div key={p.id} className="product-sale-item" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 14px", background: isSelected ? "rgba(232,255,0,0.06)" : "var(--bg-card)", border: `1px solid ${isSelected ? "rgba(232,255,0,0.3)" : "var(--border)"}`, borderRadius: "6px", transition: "all 0.15s ease" }}>
                      <button onClick={() => toggleProduct(p.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}>
                        <div style={{ width: "20px", height: "20px", borderRadius: "4px", border: `2px solid ${isSelected ? "var(--accent)" : "var(--border-bright)"}`, background: isSelected ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s ease" }}>
                          {isSelected && <span style={{ fontSize: "12px", color: "#000", fontWeight: 700 }}>✓</span>}
                        </div>
                      </button>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "14px", fontWeight: 500 }}>{p.name}</p>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{p.price.toLocaleString()} DA</p>
                      </div>
                      {isSelected && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <label style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Prix solde:</label>
                          <input
                            type="number"
                            className="product-sale-price-input input-dark"
                            value={salePrices[p.id]}
                            onChange={e => setSalePrices(sp => ({ ...sp, [p.id]: e.target.value }))}
                            placeholder="DA"
                            style={{ width: "90px", padding: "6px 10px", borderRadius: "5px", fontSize: "13px", border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "#fff" }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button className="btn-accent" style={{ 
              padding: "16px", 
              borderRadius: "0px", 
              border: "none", 
              cursor: "pointer", 
              fontSize: "14px", 
              fontFamily: "var(--font-condensed)",
              fontWeight: 800,
              letterSpacing: "0.1em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              background: "var(--accent)", color: "#000"
            }}>
              <Zap size={16} /> SAUVEGARDER LA VENTE FLASH
            </button>
          </div>

          {/* Preview */}
          <div className="sale-preview-sidebar" style={{ position: "sticky", top: "32px" }}>
            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0px", padding: "24px", marginBottom: "16px", position: "relative" }}>
              <div className="corner-plus top-right" style={{ color: "#ff3b3b", top: "10px", right: "10px" }}>+</div>
              <p style={{ fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", color: "var(--text-muted)", fontWeight: 700, marginBottom: "16px" }}>APERÇU — ACCUEIL</p>

              {saleActive ? (
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#ff3b3b22", border: "1px solid #ff3b3b44", borderRadius: "0px", padding: "6px 14px", marginBottom: "14px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ff3b3b" }} className="ping-animate" />
                    <span style={{ fontFamily: "var(--font-condensed)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: "#ff3b3b" }}>OFFRE LIMITÉE</span>
                  </div>
                  <p className="section-heading" style={{ fontSize: "clamp(24px, 3vw, 32px)", marginBottom: "8px", lineHeight: "1.1" }}>
                    {saleLabel.toUpperCase()} <span style={{ color: "var(--accent)" }}>⚡</span>
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px", fontFamily: "var(--font-condensed)", letterSpacing: "0.04em" }}>TEMPS RESTANT</p>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                    {["12", "34", "56"].map((v, i) => (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: "0px", width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: "26px", color: "var(--accent)" }}>{v}</div>
                        <span style={{ fontSize: "9px", fontFamily: "var(--font-condensed)", fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginTop: "6px" }}>{["HH", "MM", "SS"][i]}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: "12px", color: "#22c55e", fontFamily: "var(--font-condensed)", fontWeight: 700 }}>✓ DIFFUSION ACTIVE</p>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <Tag size={32} color="var(--text-muted)" style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                  <p style={{ fontSize: "14px", color: "var(--text-muted)", fontFamily: "var(--font-condensed)", letterSpacing: "0.04em" }}>VENTE FLASH DÉSACTIVÉE</p>
                </div>
              )}
            </div>

            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0px", padding: "20px" }}>
              <p style={{ fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.08em", color: "var(--text-muted)", fontWeight: 700, marginBottom: "14px" }}>SÉLECTION ({onSaleIds.length})</p>
              {onSaleIds.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Aucun produit sélectionné</p>
              ) : (
                <div style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "4px" }}>
                  {onSaleIds.map(id => {
                    const p = mockProducts.find(pr => pr.id === id);
                    if (!p) return null;
                    return (
                      <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: "13px" }}>
                        <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>{p.name}</span>
                        <span style={{ color: "var(--accent)", fontFamily: "var(--font-condensed)", fontWeight: 700 }}>
                          {salePrices[id] ? `${parseInt(salePrices[id]).toLocaleString()} DA` : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
