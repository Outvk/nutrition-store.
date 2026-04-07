"use client";
import { useEffect, useState } from "react";
import { ShoppingBag, TrendingUp, Package, AlertTriangle, Clock, CheckCircle, Truck, XCircle, RotateCw } from "lucide-react";
import { Order } from "@/types";
import Link from "next/link";
import { resetRevenue } from "./actions";
import { useRouter } from "next/navigation";

function useCountUp(target: number, duration = 1500, trigger = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    // Reset to 0 first, then wait for React to paint it before animating
    setValue(0);
    let raf: number;
    const timer = setTimeout(() => {
      let start: number | null = null;
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.floor(eased * target));
        if (progress < 1) raf = requestAnimationFrame(step);
        else setValue(target);
      };
      raf = requestAnimationFrame(step);
    }, 50);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [target, duration, trigger]);
  return value;
}

interface DashboardClientProps {
  stats: any;
  allOrders: Order[];
  recentOrders: Order[];
  lowStock: any[];
  activeProductsCount: number;
  revenueResetAt?: string | null;
}


const statusConfig = {
  pending:   { label: "En attente",  color: "#f59e0b", bg: "#2a1f00", Icon: Clock },
  confirmed: { label: "Confirmée",   color: "#3b82f6", bg: "#001a2a", Icon: CheckCircle },
  shipped:   { label: "Expédiée",    color: "#a855f7", bg: "#1a0029", Icon: Truck },
  delivered: { label: "Livrée",      color: "#22c55e", bg: "#002214", Icon: CheckCircle },
  cancelled: { label: "Annulée",     color: "#ef4444", bg: "#2a0000", Icon: XCircle },
};

export default function DashboardClient({ stats, allOrders, recentOrders, lowStock, activeProductsCount, revenueResetAt }: DashboardClientProps) {
  const totalRevenue = Number(stats?.total_revenue || 0);
  const totalOrders = Number(stats?.total_orders || 0);
  const pendingCount = Number(stats?.pending_count || 0);
  const outOfStockArr = lowStock.filter((v: any) => v.stock === 0);
  const lowStockArr = lowStock.filter((v: any) => v.stock > 0);

  const [showConfirm, setShowConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const router = useRouter();

  const animatedRevenue = useCountUp(totalRevenue, 1500, totalRevenue);
  const animatedOrders = useCountUp(totalOrders, 1500, totalOrders);
  const animatedProducts = useCountUp(Number(activeProductsCount || 0), 1500, activeProductsCount);
  const animatedLowStock = useCountUp(Number(lowStock.length || 0), 1500, lowStock.length);

  const statCards = [
    { label: "Revenu total", value: `${animatedRevenue.toLocaleString()} DA`, icon: TrendingUp, color: "#e8ff00", sub: "Commandes livrées" },
    { label: "Commandes totales", value: animatedOrders, icon: ShoppingBag, color: "#3b82f6", sub: `${pendingCount} en attente` },
    { label: "Produits actifs", value: animatedProducts, icon: Package, color: "#22c55e", sub: `${outOfStockArr.length} épuisés` },
    { label: "Stock faible", value: animatedLowStock, icon: AlertTriangle, color: "#f59e0b", sub: "variants ≤ 5 unités" },
  ];

  // --- Chart Logic ---
  const [chartMode, setChartMode] = useState<"day" | "month">("day");
  const [selectedItem, setSelectedItem] = useState<{ label: string; value: number; orders?: Order[] } | null>(null);
  const [visibleDetailCount, setVisibleDetailCount] = useState(10);
  
  const resetDate = revenueResetAt ? new Date(revenueResetAt) : new Date(0);
  const deliveredOrders = allOrders.filter(o => o.status === 'delivered' && new Date(o.created_at) >= resetDate);

  const chartData = (() => {
    if (chartMode === "day") {
      return [...Array(14)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const isoDate = d.toISOString().split('T')[0];
        const dayOrders = allOrders.filter(o => o.created_at && o.created_at.includes(isoDate) && new Date(o.created_at) >= resetDate);
        const dayRevenue = dayOrders
          .filter(o => o.status === 'delivered')
          .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        return { label: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }), value: dayRevenue, count: dayOrders.length };
      }).reverse();
    } else {
      return [...Array(6)].map((_, i) => {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        const m = d.getMonth();
        const y = d.getFullYear();
        const monthOrders = allOrders.filter(o => {
          const od = new Date(o.created_at);
          return od.getMonth() === m && od.getFullYear() === y && od >= resetDate;
        });
        const monthRevenue = monthOrders
          .filter(o => o.status === 'delivered')
          .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        return { label: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }), value: monthRevenue, count: monthOrders.length };
      }).reverse();
    }
  })();

  const allZeroRevenue = chartData.every(d => d.value === 0);
  const maxRevenue = Math.max(...chartData.map(d => d.value), 1000);
  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
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
          ADMINISTRATION
        </p>
        <h1 className="section-heading" style={{ fontSize: "clamp(32px, 5vw, 42px)", lineHeight: "1.1", color: "var(--text-primary)" }}>VUE D'ENSEMBLE</h1>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "36px" }}>
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={{ 
              background: "var(--bg-secondary)", 
              border: `1px dashed ${card.color}44`, 
              borderRadius: "0px", 
              padding: "24px",
              position: "relative",
              overflow: "visible"
            }}>
              {/* Corner Accents */}
              <div className="corner-plus tl" style={{ color: card.color, fontSize: "12px", width: "12px", height: "12px", top: "-6px", left: "-6px" }}>+</div>
              <div className="corner-plus tr" style={{ color: card.color, fontSize: "12px", width: "12px", height: "12px", top: "-6px", right: "-6px" }}>+</div>
              <div className="corner-plus bl" style={{ color: card.color, fontSize: "12px", width: "12px", height: "12px", bottom: "-6px", left: "-6px" }}>+</div>
              <div className="corner-plus br" style={{ color: card.color, fontSize: "12px", width: "12px", height: "12px", bottom: "-6px", right: "-6px" }}>+</div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <p style={{ fontFamily: "var(--font-condensed)", fontSize: "12px", letterSpacing: "0.08em", color: "var(--text-muted)", fontWeight: 600 }}>
                  {card.label.toUpperCase()}
                </p>
                <div style={{ width: "36px", height: "36px", borderRadius: "0px", background: `${card.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color={card.color} />
                </div>
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "32px", color: "var(--text-primary)", lineHeight: 1, marginBottom: "6px" }}>{card.value}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{card.sub}</p>
                {card.label === "Revenu total" && (
                  <button
                    onClick={() => setShowConfirm(true)}
                    title="Remettre à zéro"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", padding: "2px", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#e8ff00")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                  >
                    <RotateCw size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Graph Card */}
      <div style={{ 
        background: "var(--bg-secondary)", 
        border: "1px solid var(--border)", 
        padding: "24px", 
        marginBottom: "36px", 
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <h2 style={{ fontFamily: "var(--font-condensed)", fontSize: "16px", fontWeight: 700, letterSpacing: "0.1em", color: "#fff" }}>ANALYSE DES REVENUS</h2>
              {selectedItem && (
                <button 
                  onClick={() => { setSelectedItem(null); setVisibleDetailCount(10); }}
                  style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", cursor: "pointer", padding: "2px 6px", fontSize: "10px", fontFamily: "var(--font-condensed)", fontWeight: 700, borderRadius: "0px" }}
                >EFFACER</button>
              )}
            </div>
            <p style={{ fontSize: "12px", color: selectedItem ? "var(--accent)" : "var(--text-muted)", transition: "color 0.3s ease" }}>
              {selectedItem 
                ? `${selectedItem.value.toLocaleString()} DA (${selectedItem.label})` 
                : "Cliquer sur une barre pour voir le détail des transactions"
              }
            </p>
          </div>
          
          <div style={{ display: "flex", background: "var(--bg-card)", padding: "4px", border: "1px solid var(--border)" }}>
            <button 
              onClick={() => { setChartMode("day"); setSelectedItem(null); }}
              style={{ 
                padding: "6px 16px", background: chartMode === "day" ? "var(--accent)" : "transparent", color: chartMode === "day" ? "#000" : "var(--text-muted)", 
                border: "none", cursor: "pointer", fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "11px", letterSpacing: "0.05em" 
              }}
            >JOUR</button>
            <button 
              onClick={() => { setChartMode("month"); setSelectedItem(null); }}
              style={{ 
                padding: "6px 16px", background: chartMode === "month" ? "var(--accent)" : "transparent", color: chartMode === "month" ? "#000" : "var(--text-muted)", 
                border: "none", cursor: "pointer", fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "11px", letterSpacing: "0.05em" 
              }}
            >MOIS</button>
          </div>
        </div>

        {/* Custom SVG Chart Wrapper for Scroll */}
        <div style={{ width: "100%", overflowX: "auto", overflowY: "visible", paddingBottom: "10px", marginTop: "24px", scrollbarWidth: "thin", scrollbarColor: "var(--accent) transparent" }}>
          <div style={{ 
            height: "260px", 
            minWidth: "var(--chart-min-width, 100%)", 
            position: "relative", 
            display: "flex", 
            alignItems: "flex-end", 
            gap: "var(--chart-gap, 10px)", 
            padding: "24px 10px 0 10px" 
          }}>
          {/* Horizontal lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(p => (
            <div key={p} style={{ position: "absolute", left: 0, right: 0, bottom: `${p * 100}%`, height: "1px", background: "rgba(255,255,255,0.06)", zIndex: 1 }} />
          ))}

          {allZeroRevenue && chartData.every(d => d.count === 0) && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
              <p style={{ fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", color: "var(--text-muted)", background: "var(--bg-secondary)", padding: "8px 16px", border: "1px dashed var(--border)" }}>
                AUCUNE ACTIVITÉ DÉTECTÉE SUR CETTE PÉRIODE
              </p>
            </div>
          )}

          {chartData.map((d, i) => {
            const hRev = (d.value / maxRevenue) * 100;
            const hCount = (d.count / maxCount) * 100;
            
            // Find orders for this specific bar to show details on click
            const barOrders = allOrders.filter(o => {
              const od = new Date(o.created_at);
              if (chartMode === "day") {
                const labelDate = d.label.split("/"); // DD/MM
                return od.getDate() === parseInt(labelDate[0]) && (od.getMonth() + 1) === parseInt(labelDate[1]);
              } else {
                return od.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }) === d.label;
              }
            }).filter(o => o.status === 'delivered');

            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", zIndex: 2, position: "relative" }}>
                {/* Volume Bar (All Orders) */}
                <div style={{ 
                  position: "absolute", bottom: "28px", left: "2px", right: "2px", 
                  height: `${hCount}%`, background: "rgba(255,255,255,0.03)", 
                  borderTop: "1px solid rgba(255,255,255,0.1)", zIndex: 1,
                  transition: "all 0.4s ease"
                }} />

                {/* Revenue Bar (Delivered Only) */}
                <div 
                  className="bar-hover"
                  onClick={() => setSelectedItem({ label: d.label, value: d.value, orders: barOrders })}
                  title={`${d.label}: ${d.value.toLocaleString()} DA (${d.count} commandes)`}
                  style={{ 
                    width: "100%", 
                    height: `${Math.max(hRev, d.value > 0 ? 2 : 0)}%`, 
                    cursor: "pointer",
                    background: d.value > 0 ? (selectedItem?.label === d.label ? "#fff" : `linear-gradient(to top, rgba(255,255,255,0.1), rgba(255,255,255,0.9))`) : "transparent", 
                    borderTop: d.value > 0 ? `2px solid #fff` : "none",
                    transform: selectedItem?.label === d.label ? "scaleX(1.1)" : "none",
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                    position: "relative",
                    boxShadow: (d.value > 0 && selectedItem?.label === d.label) ? "0 0 20px rgba(255,255,255,0.3)" : (d.value > 0 ? "0 0 15px rgba(255,255,255,0.1)" : "none"),
                    zIndex: 2
                  }} 
                >
                  {d.value > 0 && (
                    <span 
                      className="chart-value"
                      style={{ 
                        position: "absolute", top: "-24px", left: "50%", transform: "translateX(-50%)", 
                        fontSize: "9px", fontFamily: "var(--font-condensed)", fontWeight: 700, 
                        color: "#fff", whiteSpace: "nowrap" 
                      }}
                    >
                      {d.value >= 1000 ? `${(d.value/1000).toFixed(1)}k` : d.value}
                    </span>
                  )}
                </div>
                
                <span 
                  className="chart-label"
                  style={{ fontSize: "10px", fontFamily: "var(--font-condensed)", fontWeight: 700, color: (d.value > 0 || d.count > 0) ? "#fff" : "var(--text-muted)", marginTop: "14px", textTransform: "uppercase" }}>{d.label}</span>
              </div>
            );
          })}
          </div>
        </div>

        {/* Selected Day Details Section */}
        {selectedItem && selectedItem.orders && selectedItem.orders.length > 0 && (
          <div style={{ marginTop: "24px", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
            <p style={{ fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", color: "var(--text-muted)", fontWeight: 700, marginBottom: "12px", textTransform: "uppercase" }}>
              TRANSACTIONS RÉUSSIES : {selectedItem.label} ({selectedItem.orders.length})
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {selectedItem.orders.slice(0, visibleDetailCount).map(o => (
                <div key={o.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", padding: "8px 14px", display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontFamily: "var(--font-condensed)", fontWeight: 700, color: "var(--accent)" }}>{Number(o.total).toLocaleString()} DA</span>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-condensed)" }}>à {new Date(o.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              ))}
            </div>
            
            {selectedItem.orders.length > visibleDetailCount && (
              <button 
                onClick={() => setVisibleDetailCount(prev => prev + 10)}
                style={{ marginTop: "16px", background: "none", border: "1px dashed var(--border)", color: "var(--accent)", padding: "10px 20px", fontFamily: "var(--font-condensed)", fontSize: "12px", fontWeight: 700, cursor: "pointer", width: "100%", letterSpacing: "0.08em" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
              >
                VOIR PLUS (+10)
              </button>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1099px) {
          .dashboard-content-split { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          :root { 
            --chart-gap: 8px !important; 
            --chart-min-width: 600px !important;
          }
          .chart-label { font-size: 9px !important; margin-top: 10px !important; }
          .chart-value { font-size: 8px !important; top: -16px !important; }
        }
      `}} />
      <div className="dashboard-content-split" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>

        {/* Recent orders */}
        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0px", overflow: "hidden" }}>
          <div style={{ padding: "20px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "17px", letterSpacing: "0.04em" }}>COMMANDES RÉCENTES</h2>
            <Link href="/dashboard/orders" style={{ fontFamily: "var(--font-condensed)", fontSize: "12px", letterSpacing: "0.08em", color: "var(--accent)", textDecoration: "none", fontWeight: 700 }}>
              VOIR TOUT →
            </Link>
          </div>
          <div>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 100px", padding: "12px 22px", borderBottom: "1px solid var(--border)" }}>
              {["CLIENT", "WILAYA", "TOTAL", "STATUS"].map(h => (
                <span key={h} style={{ fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.1em", color: "var(--text-muted)", fontWeight: 700 }}>{h}</span>
              ))}
            </div>
            {recentOrders.map(order => {
              const cfg = statusConfig[order.status];
              const Icon = cfg.Icon;
              return (
                <div key={order.id}
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 100px", padding: "14px 22px", borderBottom: "1px solid var(--border)", alignItems: "center", transition: "background 0.15s ease", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 500, marginBottom: "2px" }}>{order.full_name}</p>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{order.id}</p>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{order.wilaya}</p>
                  <p style={{ fontFamily: "var(--font-condensed)", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{order.total.toLocaleString()} DA</p>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    padding: "4px 10px", borderRadius: "0px",
                    background: cfg.bg, color: cfg.color,
                    border: `1px solid ${cfg.color}44`,
                    fontFamily: "var(--font-condensed)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em",
                    width: "fit-content",
                  }}>
                    <Icon size={10} />
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Low stock alert */}
          {(lowStockArr.length > 0 || outOfStockArr.length > 0) && (
            <div style={{ background: "var(--bg-secondary)", border: "1px solid #f59e0b44", borderRadius: "0px", overflow: "hidden" }}>
              <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={15} color="#f59e0b" />
                <h3 style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "14px", letterSpacing: "0.06em", color: "#f59e0b" }}>ALERTES STOCK</h3>
              </div>
              <div style={{ padding: "12px" }}>
                {outOfStockArr.slice(0, 3).map(v => (
                  <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: "0px", marginBottom: "4px", background: "rgba(239,68,68,0.06)" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{v.flavor} / {v.size}</span>
                    <span style={{ fontSize: "11px", fontFamily: "var(--font-condensed)", fontWeight: 700, color: "#ef4444" }}>ÉPUISÉ</span>
                  </div>
                ))}
                {lowStockArr.slice(0, 3).map(v => (
                  <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: "0px", marginBottom: "4px", background: "rgba(245,158,11,0.06)" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{v.flavor} / {v.size}</span>
                    <span style={{ fontSize: "11px", fontFamily: "var(--font-condensed)", fontWeight: 700, color: "#f59e0b" }}>{v.stock} restants</span>
                  </div>
                ))}
                <Link href="/dashboard/inventory" style={{ display: "block", textAlign: "center", padding: "8px", fontSize: "12px", color: "var(--accent)", textDecoration: "none", fontFamily: "var(--font-condensed)", fontWeight: 700, letterSpacing: "0.06em", marginTop: "8px" }}>
                  GÉRER LE STOCK →
                </Link>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0px", padding: "18px" }}>
            <h3 style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "14px", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "14px" }}>ACTIONS RAPIDES</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "Nouveau produit", href: "/dashboard/products" },
                { label: "Commandes en attente", href: "/dashboard/orders" },
                { label: "Configurer une vente flash", href: "/dashboard/sale" },
              ].map(a => (
                <Link key={a.label} href={a.href}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "0px", textDecoration: "none", color: "var(--text-primary)", fontSize: "13px", fontFamily: "var(--font-condensed)", fontWeight: 600, letterSpacing: "0.03em", transition: "all 0.15s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                >
                  {a.label} <span>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Custom Confirmation Modal */}
      {showConfirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--accent)", padding: "40px", maxWidth: "480px", width: "90%", position: "relative" }}>
            {/* Accents */}
            <div className="corner-plus tl" style={{ color: "var(--accent)", top: "-6px", left: "-6px" }}>+</div>
            <div className="corner-plus tr" style={{ color: "var(--accent)", top: "-6px", right: "-6px" }}>+</div>
            <div className="corner-plus bl" style={{ color: "var(--accent)", bottom: "-6px", left: "-6px" }}>+</div>
            <div className="corner-plus br" style={{ color: "var(--accent)", bottom: "-6px", right: "-6px" }}>+</div>

            <div style={{ textAlign: "center" }}>
              <div style={{ display: "inline-flex", padding: "16px", background: "rgba(232,255,0,0.1)", marginBottom: "24px" }}>
                <AlertTriangle size={32} color="var(--accent)" />
              </div>
              <h2 style={{ fontFamily: "var(--font-condensed)", fontSize: "24px", fontWeight: 700, letterSpacing: "0.05em", color: "#fff", marginBottom: "16px" }}>CONFIRMER LA RÉINITIALISATION</h2>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "32px" }}>
                Voulez-vous vraiment réinitialiser le revenu total à zéro ? 
                <br/>Cette action est irréversible et affectera l'affichage global.
              </p>

              <div style={{ display: "flex", gap: "12px" }}>
                <button 
                  onClick={() => setShowConfirm(false)}
                  disabled={isResetting}
                  className="btn-ghost" 
                  style={{ flex: 1, padding: "14px", borderRadius: "0", cursor: "pointer", fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "13px", letterSpacing: "0.1em" }}
                >
                  ANNULER
                </button>
                <button 
                  onClick={async () => {
                    setIsResetting(true);
                    try {
                      const res = await resetRevenue();
                      if (res.success) {
                        setShowConfirm(false);
                        router.refresh();
                      } else {
                        alert("Erreur: " + res.error);
                      }
                    } catch (err) {
                      alert("Erreur serveur.");
                    } finally {
                      setIsResetting(false);
                    }
                  }}
                  disabled={isResetting}
                  className="btn-accent" 
                  style={{ flex: 1, padding: "14px", borderRadius: "0", cursor: "pointer", fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "13px", letterSpacing: "0.1em", background: "#ef4444", color: "#fff", border: "none" }}
                >
                  {isResetting ? "TRAITEMENT..." : "RÉINITIALISER"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
