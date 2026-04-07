import Link from "next/link";
import { Zap, Globe, MessageCircle } from "lucide-react";
import { STORE_CONFIG } from "@/lib/config";

export default function Footer() {
  return (
    <footer style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", marginTop: "80px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "60px 24px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "48px", marginBottom: "48px" }}>

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ background: "var(--accent)", width: "28px", height: "28px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap size={15} color="#000" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "18px", letterSpacing: "0.06em" }}>
                {STORE_CONFIG.logoText}<span style={{ color: "var(--accent)" }}>{STORE_CONFIG.logoHighlight}</span>
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: "220px" }}>
              {STORE_CONFIG.description}
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <a href={STORE_CONFIG.socials.facebook} target="_blank" rel="noreferrer" style={{
                width: "36px", height: "36px", border: "1px solid var(--border)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", textDecoration: "none", transition: "all 0.2s ease",
              }} onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                <Globe size={16} />
              </a>
              <a href={STORE_CONFIG.socials.instagram} target="_blank" rel="noreferrer" style={{
                width: "36px", height: "36px", border: "1px solid var(--border)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", textDecoration: "none", transition: "all 0.2s ease",
              }} onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                <Globe size={16} />
              </a>
              <a href={STORE_CONFIG.socials.whatsapp} target="_blank" rel="noreferrer" style={{
                width: "36px", height: "36px", border: "1px solid var(--border)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", textDecoration: "none", transition: "all 0.2s ease",
              }} onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "13px", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "16px" }}>
              NAVIGATION
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Tous les produits", href: "/products" },
                { label: "Soldes spéciaux", href: "/products?filter=sale" },
                { label: "Nouvelles arrivées", href: "/products?filter=new" },
              ].map((item) => (
                <Link key={item.label} href={item.href} style={{ fontSize: "14px", color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.2s ease" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div>
            <h4 style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "13px", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "16px" }}>
              OBJECTIFS
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {["Build Mass", "Burn Fat", "Boost Performance", "Recover & Protect"].map((g) => (
                <Link key={g} href={`/products?goal=${g.toLowerCase().replace(/ /g, "-")}`}
                  style={{ fontSize: "14px", color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.2s ease" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
                >
                  {g}
                </Link>
              ))}
            </div>
          </div>

          {/* Delivery */}
          <div>
            <h4 style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "13px", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "16px" }}>
              LIVRAISON
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                "🚚 Partout en Algérie",
                "💳 Paiement à la livraison",
                "📦 Emballage sécurisé",
                "⚡ Expédition sous 24h",
              ].map((item) => (
                <span key={item} style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{item}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            © 2026 RiverNutrition. Tous droits réservés.
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Livraison assurée par <span style={{ color: "var(--text-secondary)" }}>Noest-DZ</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
