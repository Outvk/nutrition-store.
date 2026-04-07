"use client";
import { useState } from "react";
import { AlertTriangle, Edit2, Save, X } from "lucide-react";


type VariantRow = { productName: string; productId: string; variantId: string; flavor: string; size: string; stock: number; };

interface InventoryClientProps {
  initialVariants: VariantRow[];
}

export default function InventoryClient({ initialVariants }: InventoryClientProps) {
  const [variants, setVariants] = useState(initialVariants);
  const [editId, setEditId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");

  const startEdit = (id: string, currentStock: number) => { setEditId(id); setEditVal(String(currentStock)); };
  const saveEdit = async (id: string) => {
    const val = parseInt(editVal);
    if (!isNaN(val) && val >= 0) {
      // Optimistic update
      setVariants(vs => vs.map(v => v.variantId === id ? { ...v, stock: val } : v));
      
      // Server update
      try {
        await fetch(`/api/dashboard/inventory/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stock: val })
        });
      } catch (err) {
        console.error(err);
      }
    }
    setEditId(null);
  };

  const outOfStock = variants.filter(v => v.stock === 0);
  const lowStock = variants.filter(v => v.stock > 0 && v.stock <= 5);
  const inStock = variants.filter(v => v.stock > 5);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "ÉPUISÉ", color: "#ef4444", bg: "#2a0000" };
    if (stock <= 5) return { label: "FAIBLE", color: "#f59e0b", bg: "#2a1f00" };
    return { label: "EN STOCK", color: "#22c55e", bg: "#002214" };
  };

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <p style={{ fontFamily: "var(--font-condensed)", fontSize: "12px", letterSpacing: "0.12em", color: "var(--accent)", fontWeight: 700, marginBottom: "6px" }}>GESTION</p>
        <h1 className="section-heading" style={{ fontSize: "36px" }}>INVENTAIRE</h1>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "En stock", count: inStock.length, color: "#22c55e", bg: "#002214" },
          { label: "Stock faible", count: lowStock.length, color: "#f59e0b", bg: "#2a1f00" },
          { label: "Épuisés", count: outOfStock.length, color: "#ef4444", bg: "#2a0000" },
        ].map(card => (
          <div key={card.label} style={{ background: card.bg, border: `1px solid ${card.color}44`, borderRadius: "0px", padding: "18px 20px" }}>
            <p style={{ fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", fontWeight: 700, color: card.color, marginBottom: "8px" }}>
              {card.label.toUpperCase()}
            </p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "36px", color: card.color, lineHeight: 1 }}>{card.count}</p>
            <p style={{ fontSize: "12px", color: `${card.color}88`, marginTop: "4px" }}>variants</p>
          </div>
        ))}
      </div>

      {/* Alert */}
      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <div style={{ background: "#2a1f00", border: "1px solid #f59e0b44", borderRadius: "0px", padding: "14px 18px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <AlertTriangle size={16} color="#f59e0b" />
          <span style={{ fontSize: "13px", color: "#f59e0b", fontFamily: "var(--font-condensed)", fontWeight: 700 }}>
            {outOfStock.length} variant(s) épuisé(s) — {lowStock.length} variant(s) en stock faible
          </span>
        </div>
      )}

      {/* Table */}
      <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0px", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 100px 120px 100px", padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
          {["PRODUIT / VARIANT", "ARÔME", "TAILLE", "STOCK", "STATUS"].map(h => (
            <span key={h} style={{ fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", color: "var(--text-muted)", fontWeight: 700 }}>{h}</span>
          ))}
        </div>

        {variants.map(v => {
          const status = getStockStatus(v.stock);
          const isEditing = editId === v.variantId;
          return (
            <div key={v.variantId}
              style={{ display: "grid", gridTemplateColumns: "1fr 160px 100px 120px 100px", padding: "13px 20px", borderBottom: "1px solid var(--border)", alignItems: "center", transition: "background 0.15s ease", background: v.stock === 0 ? "rgba(239,68,68,0.03)" : v.stock <= 5 ? "rgba(245,158,11,0.03)" : "transparent" }}
              onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.05)")}
              onMouseLeave={e => (e.currentTarget.style.filter = "none")}
            >
              <div>
                <p style={{ fontSize: "14px", fontWeight: 500 }}>{v.productName}</p>
              </div>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{v.flavor}</span>
              <span style={{ fontFamily: "var(--font-condensed)", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>{v.size}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {isEditing ? (
                  <>
                    <input
                      type="number"
                      value={editVal}
                      onChange={e => setEditVal(e.target.value)}
                      autoFocus
                      onKeyDown={e => { if (e.key === "Enter") saveEdit(v.variantId); if (e.key === "Escape") setEditId(null); }}
                      className="input-dark"
                      style={{ width: "70px", padding: "5px 8px", borderRadius: "0px", fontSize: "14px", border: "1px solid var(--accent)", fontFamily: "var(--font-condensed)", fontWeight: 700 }}
                    />
                    <button onClick={() => saveEdit(v.variantId)} style={{ background: "none", border: "none", cursor: "pointer", color: "#22c55e", display: "flex" }}><Save size={15} /></button>
                    <button onClick={() => setEditId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><X size={15} /></button>
                  </>
                ) : (
                  <>
                    <span style={{ fontFamily: "var(--font-condensed)", fontSize: "16px", fontWeight: 700, color: v.stock === 0 ? "#ef4444" : v.stock <= 5 ? "#f59e0b" : "var(--text-primary)" }}>
                      {v.stock}
                    </span>
                    <button onClick={() => startEdit(v.variantId, v.stock)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", transition: "color 0.15s ease" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                    >
                      <Edit2 size={13} />
                    </button>
                  </>
                )}
              </div>
              <span style={{ display: "inline-flex", padding: "4px 10px", borderRadius: "0px", background: status.bg, color: status.color, border: `1px solid ${status.color}44`, fontFamily: "var(--font-condensed)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", width: "fit-content" }}>
                {status.label}
              </span>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "12px", textAlign: "center" }}>
        Cliquer sur ✏️ pour modifier le stock d&apos;un variant directement
      </p>
    </div>
  );
}
