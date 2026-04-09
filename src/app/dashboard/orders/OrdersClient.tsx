"use client";
import { useState } from "react";
import { Search, Filter, Clock, CheckCircle, Truck, XCircle, Phone, MapPin, ChevronDown, UserCheck, Trash2 } from "lucide-react";
import { Order } from "@/types";

interface OrdersClientProps {
  initialOrders: Order[];
}


type Status = Order["status"];

const statusConfig: Record<Status, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  pending:   { label: "En attente",  color: "#f59e0b", bg: "#2a1f00", Icon: Clock },
  confirmed: { label: "Confirmée",   color: "#3b82f6", bg: "#001a2a", Icon: CheckCircle },
  shipped:   { label: "Expédiée",    color: "#a855f7", bg: "#1a0029", Icon: Truck },
  delivered: { label: "Livrée",      color: "#22c55e", bg: "#002214", Icon: CheckCircle },
  cancelled: { label: "Annulée",     color: "#ef4444", bg: "#2a0000", Icon: XCircle },
  returned:  { label: "Retour",      color: "#f43f5e", bg: "#4c0519", Icon: XCircle },
};

const nextStatus: Partial<Record<Status, Status>> = {
  pending: "confirmed",
  confirmed: "shipped",
  shipped: "delivered",
};

export default function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // Count occurrences of each phone number to signal recurring customers
  const phoneCounts = orders.reduce((acc, o) => {
    acc[o.phone] = (acc[o.phone] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filtered = orders.filter(o => {
    const matchSearch = o.full_name.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search) || o.id.toLowerCase().includes(search.toLowerCase()) || o.wilaya.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusPriority: Record<Status, number> = {
    pending: 0,
    confirmed: 1,
    shipped: 2,
    returned: 3,
    cancelled: 4,
    delivered: 5,
  };

  const sorted = [...filtered].sort((a, b) => {
    const pA = statusPriority[a.status];
    const pB = statusPriority[b.status];
    if (pA !== pB) return pA - pB;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (val: Status | "all") => {
    setFilterStatus(val);
    setCurrentPage(1);
  };

  const updateStatus = async (id: string, status: Status) => {
    // Optimistic UI
    setOrders(os => os.map(o => o.id === id ? { ...o, status } : o));
    
    // Server fetch
    try {
      await fetch(`/api/dashboard/orders/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteOrder = async (id: string) => {

    // Optimistic UI
    const previousOrders = [...orders];
    setOrders(os => os.filter(o => o.id !== id));

    try {
      const res = await fetch(`/api/dashboard/orders/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
    } catch (err) {
      console.error(err);
      setOrders(previousOrders);
      alert("Impossible de supprimer la commande.");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <p style={{ fontFamily: "var(--font-condensed)", fontSize: "12px", letterSpacing: "0.12em", color: "var(--accent)", fontWeight: 700, marginBottom: "6px" }}>GESTION</p>
        <h1 className="section-heading" style={{ fontSize: "36px" }}>COMMANDES</h1>
      </div>

      {/* Filters row */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search size={15} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Chercher par nom, téléphone, wilaya..."
            className="input-dark"
            style={{ width: "100%", padding: "11px 16px 11px 40px", borderRadius: "0px", fontSize: "14px", border: "1px solid var(--border)" }}
          />
        </div>

        {/* Status filter */}
        <div style={{ position: "relative" }}>
          <select
            value={filterStatus}
            onChange={e => handleStatusFilterChange(e.target.value as Status | "all")}
            className="input-dark"
            style={{ padding: "11px 40px 11px 16px", borderRadius: "0px", fontSize: "14px", border: "1px solid var(--border)", appearance: "none", cursor: "pointer", fontFamily: "var(--font-body)" }}
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(statusConfig).map(([val, cfg]) => (
              <option key={val} value={val}>{cfg.label}</option>
            ))}
          </select>
          <ChevronDown size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
        </div>
      </div>

      {/* Count badges */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {(["all", "pending", "confirmed", "shipped", "delivered", "cancelled", "returned"] as const).map(s => {
          const count = s === "all" ? orders.length : orders.filter(o => o.status === s).length;
          const cfg = s !== "all" ? statusConfig[s] : null;
          return (
            <button key={s}
              onClick={() => handleStatusFilterChange(s)}
              style={{
                padding: "5px 12px", borderRadius: "0px", border: "none", cursor: "pointer",
                background: filterStatus === s ? (cfg?.bg || "rgba(232,255,0,0.1)") : "var(--bg-secondary)",
                color: filterStatus === s ? (cfg?.color || "var(--accent)") : "var(--text-muted)",
                fontFamily: "var(--font-condensed)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em",
                transition: "all 0.15s ease",
              }}
            >
              {s === "all" ? "TOUT" : statusConfig[s].label.toUpperCase()} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-condensed)", fontSize: "16px", letterSpacing: "0.06em" }}>
            AUCUNE COMMANDE TROUVÉE
          </div>
        ) : (
          paginated.map((order: Order) => {
            const cfg = statusConfig[order.status];
            const StatusIcon = cfg.Icon;
            const isExpanded = expanded === order.id;
            const next = nextStatus[order.status];

            return (
              <div key={order.id} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0px", overflow: "hidden" }}>
                {/* Main row */}
                <div
                  style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 120px 200px 48px", alignItems: "center", padding: "16px 20px", cursor: "pointer", transition: "background 0.15s ease" }}
                  onClick={() => setExpanded(isExpanded ? null : order.id)}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <p style={{ fontSize: "15px", fontWeight: 500, marginBottom: "3px" }}>{order.full_name}</p>
                      {phoneCounts[order.phone] > 1 && (
                        <span style={{ 
                          fontSize: "9px", 
                          background: "var(--accent)", 
                          color: "#000", 
                          padding: "2px 6px", 
                          borderRadius: "0px", 
                          fontFamily: "var(--font-condensed)", 
                          fontWeight: 800,
                          letterSpacing: "0.04em",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}>
                          <UserCheck size={10} /> RÉCURRENT
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{order.id}</span>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {new Date(order.created_at).toLocaleDateString("fr-DZ")} • {new Date(order.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <MapPin size={12} color="var(--text-muted)" />
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{order.wilaya}</span>
                  </div>
                  <span style={{ fontFamily: "var(--font-condensed)", fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {order.total.toLocaleString()} DA
                  </span>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "5px 11px", borderRadius: "0px",
                    background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}44`,
                    fontFamily: "var(--font-condensed)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em",
                    width: "fit-content",
                  }}>
                    <StatusIcon size={11} />
                    {cfg.label}
                  </span>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    {next && (
                      <button
                        onClick={e => { e.stopPropagation(); updateStatus(order.id, next); }}
                        className="btn-accent"
                        style={{ padding: "7px 10px", borderRadius: "0px", border: "none", cursor: "pointer", fontSize: "11px", whiteSpace: "nowrap" }}
                      >
                        {statusConfig[next].label}
                      </button>
                    )}
                    {order.status === "shipped" && (
                      <button
                        onClick={e => { e.stopPropagation(); updateStatus(order.id, "returned"); }}
                        style={{ padding: "7px 12px", borderRadius: "0px", border: "1px solid #f43f5e44", background: "#f43f5e11", cursor: "pointer", fontSize: "11px", color: "#f43f5e", fontFamily: "var(--font-condensed)", fontWeight: 700 }}
                      >
                        Retour
                      </button>
                    )}
                    {order.status !== "cancelled" && order.status !== "delivered" && order.status !== "returned" && (
                      <button
                        onClick={e => { e.stopPropagation(); updateStatus(order.id, "cancelled"); }}
                        style={{ padding: "7px 12px", borderRadius: "0px", border: "1px solid #ef444444", background: "transparent", cursor: "pointer", fontSize: "11px", color: "#ef4444", fontFamily: "var(--font-condensed)", fontWeight: 700 }}
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                  <button
                    onClick={e => { 
                      e.stopPropagation(); 
                      if (confirmingDelete === order.id) {
                        deleteOrder(order.id);
                        setConfirmingDelete(null);
                      } else {
                        setConfirmingDelete(order.id);
                        // Auto-cancel after 3 seconds
                        setTimeout(() => setConfirmingDelete(prev => prev === order.id ? null : prev), 3000);
                      }
                    }}
                    style={{ 
                      background: confirmingDelete === order.id ? "#ef4444" : "none", 
                      border: "none", 
                      color: confirmingDelete === order.id ? "#fff" : "var(--text-muted)", 
                      cursor: "pointer", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      padding: confirmingDelete === order.id ? "4px 10px" : "8px",
                      borderRadius: "0px",
                      transition: "all 0.2s",
                      fontSize: "10px",
                      fontWeight: 800,
                      fontFamily: "var(--font-condensed)",
                      minWidth: confirmingDelete === order.id ? "80px" : "auto"
                    }}
                    onMouseEnter={e => { if (!confirmingDelete) e.currentTarget.style.color = "#ef4444"; }}
                    onMouseLeave={e => { if (!confirmingDelete) e.currentTarget.style.color = "var(--text-muted)"; }}
                  >
                    {confirmingDelete === order.id ? "CONFIRMER ?" : <Trash2 size={16} />}
                  </button>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid var(--border)", padding: "16px 20px", background: "var(--bg-card)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                      <div>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-condensed)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "6px" }}>TÉLÉPHONE</p>
                        <a href={`tel:${order.phone}`} style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent)", textDecoration: "none", fontSize: "15px", fontFamily: "var(--font-condensed)", fontWeight: 700 }}>
                          <Phone size={14} /> {order.phone}
                        </a>
                      </div>
                      <div>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-condensed)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "6px" }}>ADRESSE</p>
                        <p style={{ fontSize: "14px", color: "var(--text-primary)" }}>{order.address}</p>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{order.wilaya}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-condensed)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "6px" }}>PRODUITS COMMANDÉS</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {order.items?.map((item: any) => (
                            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", pb: "6px" }}>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: "14px", fontWeight: 600 }}>{item.products?.name}</p>
                                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{item.variants?.flavor} {item.variants?.size && `/ ${item.variants?.size}`}</p>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <p style={{ fontSize: "13px", fontWeight: 700 }}>{item.quantity} x {item.unit_price.toLocaleString()} DA</p>
                                <p style={{ fontSize: "14px", color: "var(--accent)", fontWeight: 800 }}>{(item.quantity * item.unit_price).toLocaleString()} DA</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-condensed)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "6px" }}>RÉCAPITULATIF</p>
                        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Sous-total: <span style={{ color: "var(--text-primary)" }}>{(order.total - order.delivery_fee).toLocaleString()} DA</span></p>
                        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Livraison: <span style={{ color: "var(--text-primary)" }}>{order.delivery_fee.toLocaleString()} DA</span></p>
                        <p style={{ fontSize: "15px", fontWeight: 700, fontFamily: "var(--font-condensed)", color: "var(--accent)", marginTop: "4px" }}>Total: {order.total.toLocaleString()} DA</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
 
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", marginTop: "32px", padding: "20px 0" }}>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            style={{ 
              padding: "8px 16px", borderRadius: "0px", border: "1px solid var(--border)", 
              background: "var(--bg-secondary)", color: "var(--text-primary)", 
              cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1,
              fontFamily: "var(--font-condensed)", fontSize: "13px", fontWeight: 700
            }}
          >
            PRÉCÉDENT
          </button>
          
          <div style={{ display: "flex", gap: "8px" }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  width: "36px", height: "36px", borderRadius: "0px", border: "none",
                  background: currentPage === page ? "var(--accent)" : "var(--bg-secondary)",
                  color: currentPage === page ? "#000" : "var(--text-primary)",
                  cursor: "pointer", fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "14px",
                  transition: "all 0.2s"
                }}
              >
                {page}
              </button>
            ))}
          </div>
 
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            style={{ 
              padding: "8px 16px", borderRadius: "0px", border: "1px solid var(--border)", 
              background: "var(--bg-secondary)", color: "var(--text-primary)", 
              cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1,
              fontFamily: "var(--font-condensed)", fontSize: "13px", fontWeight: 700
            }}
          >
            SUIVANT
          </button>
        </div>
      )}
    </div>
  );
}
