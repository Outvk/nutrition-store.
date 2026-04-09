"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Package, BarChart2,
  Settings, Zap, Menu, X, LogOut, Tag, Layers, Layout, Globe, Monitor
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { STORE_CONFIG } from "@/lib/config";

const navItems = [
  { label: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard },
  { label: "Commandes", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Inventaire", href: "/dashboard/inventory", icon: Layout },
  { label: "Produits", href: "/dashboard/products", icon: Package },
  { label: "Catégories", href: "/dashboard/categories", icon: Layers },
  { label: "Marques", href: "/dashboard/marques", icon: Tag },
  { label: "Soldes", href: "/dashboard/sale", icon: Zap },
  { label: "Design Landing", href: "/dashboard/content", icon: Monitor },
  { label: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const Sidebar = ({ className = "" }: { className?: string }) => (
    <aside className={className} style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
    }}>
      {/* Logo */}
      <div className="dash-sidebar-header" style={{ padding: "24px 20px", borderBottom: "1px solid var(--border)", position: "relative" }}>
        <div className="corner-plus top-right" style={{ color: "var(--accent)", top: "10px", right: "10px" }}>+</div>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ 
            background: "var(--accent)", 
            width: "32px", height: "32px", 
            borderRadius: "0px", 
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 15px rgba(232,255,0,0.2)"
          }}>
            <Zap size={18} color="#000" strokeWidth={2.5} />
          </div>
          <div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "18px", letterSpacing: "0.06em", color: "var(--text-primary)", display: "block", lineHeight: 1 }}>
              {STORE_CONFIG.logoText}<span style={{ color: "var(--accent)" }}>{STORE_CONFIG.logoHighlight}</span>
            </span>
            <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-condensed)", letterSpacing: "0.08em", fontWeight: 700 }}>ADMIN CONTROL</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="dash-sidebar-nav" style={{ padding: "16px 12px", flex: 1, overflowY: "auto" }}>
        {navItems.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`dash-sidebar-nav-item ${active ? "active" : ""}`}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "0px",
                textDecoration: "none", marginBottom: "2px",
                background: active ? "rgba(232,255,0,0.1)" : "transparent",
                color: active ? "var(--accent)" : "var(--text-secondary)",
                fontFamily: "var(--font-condensed)", fontWeight: 600,
                fontSize: "14px", letterSpacing: "0.04em",
                transition: "all 0.15s ease",
                borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; } }}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="dash-sidebar-footer" style={{ padding: "16px 12px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "4px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "0px", textDecoration: "none", color: "var(--text-muted)", fontFamily: "var(--font-condensed)", fontSize: "13px", transition: "all 0.15s ease", fontWeight: 600 }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)" }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent" }}
        >
          <Globe size={15} /> Voir le site
        </Link>
        <button onClick={async () => {
          const supabase = createClient();
          await supabase.auth.signOut();
          window.location.href = "/login";
        }} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "0px", border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", fontFamily: "var(--font-condensed)", fontSize: "13px", transition: "all 0.15s ease", fontWeight: 600, width: "100%", textAlign: "left" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
        >
          <LogOut size={15} /> Déconnexion
        </button>
      </div>
    </aside>
  );

  return (
    <div className="dash-main-wrapper" style={{ 
      display: "flex", 
      minHeight: "100vh", 
      background: "var(--bg-primary)",
      backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
      backgroundSize: "40px 40px"
    }}>
      {/* Responsive Navigation Wrapper */}
      <style dangerouslySetInnerHTML={{ __html: `
        .dash-main-wrapper { flex-direction: row; }
        @media (max-width: 767px) {
          .dash-main-wrapper { flex-direction: column !important; }
          .dash-sidebar-container { width: 100% !important; height: auto !important; position: sticky !important; top: 0 !important; z-index: 100 !important; border-bottom: 1px solid var(--border) !important; padding-bottom: 0 !important; }
          .dash-sidebar-nav { display: flex !important; flex-direction: row !important; overflow-x: auto !important; padding: 4px !important; gap: 8px !important; -ms-overflow-style: none; scrollbar-width: none; }
          .dash-sidebar-nav::-webkit-scrollbar { display: none; }
          .dash-sidebar-nav-item { flex-shrink: 0 !important; padding: 12px 16px !important; border-left: none !important; border-bottom: 2px solid transparent !important; margin-bottom: 0 !important; }
          .dash-sidebar-nav-item.active { border-bottom-color: var(--accent) !important; background: rgba(232,255,0,0.05) !important; }
          .dash-sidebar-footer { display: none !important; }
          .dash-sidebar-header { padding: 16px 20px !important; border-bottom: 1px solid var(--border) !important; }
        }
      `}} />

      {/* Sidebar - Permanent and Responsive */}
      <div className="dash-sidebar-container" style={{ width: "240px", flexShrink: 0, position: "sticky", top: 0, height: "100vh", borderRight: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
        <Sidebar className="dash-sidebar-header" />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <main style={{ flex: 1, padding: "clamp(16px, 4vw, 32px)", maxWidth: "1400px", width: "100%" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
