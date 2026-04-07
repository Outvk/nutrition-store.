"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Menu, X, Search, Zap } from "lucide-react";
import { getCart } from "@/lib/cart";
import { STORE_CONFIG } from "@/lib/config";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"categories" | "marques">("categories");
  const [isMobile, setIsMobile] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [hovered, setHovered] = useState<string | null>(null);
  const [saleProducts, setSaleProducts] = useState<any[]>([]);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) setSearchResults(await res.json());
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(performSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const loadTaxonomy = async () => {
      try {
        const resCat = await fetch('/api/taxonomy?type=categories');
        const resBrand = await fetch('/api/taxonomy?type=brands');
        const resSale = await fetch('/api/search?sale=true');
        if (resCat.ok) setCategories(await resCat.json());
        if (resBrand.ok) setBrands(await resBrand.json());
        if (resSale.ok) setSaleProducts((await resSale.json()).slice(0, 5));
      } catch (e) {
        console.error("Failed to load navbar taxonomy", e);
      }
    };
    loadTaxonomy();
  }, []);

  useEffect(() => {
    const updateCount = () => {
      const cart = getCart();
      const count = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    };
    
    updateCount();
    
    // Listen for custom cart events and cross-tab storage events
    window.addEventListener("cart_updated", updateCount);
    window.addEventListener("storage", updateCount);
    
    // Fallback polling for immediate UI feedback if event is missed (e.g. from cart page direct localStorage mutation)
    const interval = setInterval(updateCount, 1000);
    
    return () => {
      window.removeEventListener("cart_updated", updateCount);
      window.removeEventListener("storage", updateCount);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lock background scroll when mobile menu or search is open
  useEffect(() => {
    if (menuOpen || searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  return (
    <>
      {/* Top bar */}
      <div
        className="ticker-wrap"
        style={{
          background: "var(--accent)",
          height: "28px",
          display: "flex",
          alignItems: "center",
          transform: scrolled ? "translateY(-28px)" : "translateY(0)",
          transition: "transform 0.25s ease",
        }}
      >
        <div className="ticker-inner" style={{ gap: "80px" }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "48px", paddingRight: "48px" }}>
              <span style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "12px", letterSpacing: "0.08em", color: "#000" }}>
                🚚 LIVRAISON PARTOUT EN ALGÉRIE
              </span>
              <span style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "12px", letterSpacing: "0.08em", color: "#000" }}>
                💳 PAIEMENT À LA LIVRAISON
              </span>
              <span style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "12px", letterSpacing: "0.08em", color: "#000" }}>
                ⚡ PRODUITS 100% AUTHENTIQUES
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main navbar */}
      <nav
        style={{
          position: "fixed",
          top: scrolled ? "0px" : "28px",
          left: 0,
          right: 0,
          zIndex: 100,
          background: (scrolled || hovered) ? "rgba(10,10,10,0.98)" : "var(--bg-primary)",
          borderBottom: `1px solid ${(scrolled || hovered) ? "var(--border-bright)" : "var(--border)"}`,
          backdropFilter: (scrolled || hovered) ? "blur(20px)" : "none",
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: hovered ? "0 20px 40px rgba(0,0,0,0.4)" : "none"
        }}
        onMouseLeave={() => setHovered(null)}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? "0 12px" : "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: isMobile ? "48px" : "54px" }}>
          {isMobile ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)" }}
                >
                  {menuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>

              <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  background: "var(--accent)",
                  width: isMobile ? "24px" : "28px", height: isMobile ? "24px" : "28px",
                  borderRadius: "4px",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Zap size={isMobile ? 14 : 16} color="#000" strokeWidth={2.5} />
                </div>
                <span className="logo-text" style={{ fontFamily: "var(--font-display)", fontSize: isMobile ? "16px" : "20px", letterSpacing: "0.06em", color: "var(--text-primary)" }}>
                  {STORE_CONFIG.logoText}<span style={{ color: "var(--accent)" }}>{STORE_CONFIG.logoHighlight}</span>
                </span>
              </Link>

              <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "10px" : "16px" }}>
                <button 
                  onClick={() => setSearchOpen(true)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
                >
                  <Search size={20} />
                </button>



                <Link href="/cart" style={{ position: "relative", display: "flex", alignItems: "center", textDecoration: "none", color: "var(--text-secondary)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
                >
                  <ShoppingCart size={22} />
                  {cartCount > 0 && (
                    <span style={{
                      position: "absolute", top: isMobile ? "-6px" : "-8px", right: isMobile ? "-6px" : "-8px",
                      background: "var(--accent)", color: "#000",
                      width: isMobile ? "16px" : "18px", height: isMobile ? "16px" : "18px",
                      borderRadius: "50%",
                      fontSize: isMobile ? "10px" : "11px", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--font-condensed)",
                    }}>
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Logo */}
              <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  background: "var(--accent)",
                  width: isMobile ? "24px" : "28px", height: isMobile ? "24px" : "28px",
                  borderRadius: "4px",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Zap size={isMobile ? 14 : 16} color="#000" strokeWidth={2.5} />
                </div>
                <span style={{ fontFamily: "var(--font-display)", fontSize: isMobile ? "16px" : "20px", letterSpacing: "0.06em", color: "var(--text-primary)" }}>
                  {STORE_CONFIG.logoText}<span style={{ color: "var(--accent)" }}>{STORE_CONFIG.logoHighlight}</span>
                </span>
              </Link>

              {/* Desktop nav links */}
              <div style={{ display: "flex", alignItems: "center", gap: "32px" }} className="hidden md:flex">
                {[
                  { label: "PRODUITS", href: "/products" },
                  { label: "MARQUES", href: "/products#brands" },
                  { label: "SOLDES", href: "/products?sale=true" },
                ].map((item) => (
                  <Link key={item.label} href={item.href} 
                    onMouseEnter={() => setHovered(item.label)}
                    style={{
                      fontFamily: "var(--font-alt)",
                      fontWeight: 600,
                      fontSize: "13px",
                      letterSpacing: "0.05em",
                      color: hovered === item.label ? "var(--accent)" : "var(--text-secondary)",
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                      height: isMobile ? "48px" : "54px",
                      display: "flex",
                      alignItems: "center",
                      borderBottom: `2px solid ${hovered === item.label ? "var(--accent)" : "transparent"}`,
                      marginBottom: "-1px"
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Right actions */}
              <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "10px" : "16px" }}>
                <button 
                  onClick={() => setSearchOpen(true)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
                >
                  <Search size={20} />
                </button>



                <Link href="/cart" style={{ position: "relative", display: "flex", alignItems: "center", textDecoration: "none", color: "var(--text-secondary)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
                >
                  <ShoppingCart size={22} />
                  {cartCount > 0 && (
                    <span style={{
                      position: "absolute", top: isMobile ? "-6px" : "-8px", right: isMobile ? "-6px" : "-8px",
                      background: "var(--accent)", color: "#000",
                      width: isMobile ? "16px" : "18px", height: isMobile ? "16px" : "18px",
                      borderRadius: "50%",
                      fontSize: isMobile ? "10px" : "11px", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--font-condensed)",
                    }}>
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Mobile menu toggle */}
                <button
                  className="flex md:hidden"
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)" }}
                >
                  {menuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mega Menu Content */}
        <div style={{
          maxHeight: hovered ? "400px" : "0",
          overflow: "hidden",
          transition: "max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          borderTop: hovered ? "1px solid var(--border)" : "none",
          background: "rgba(10,10,10,0.4)"
        }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px" }}>
            {hovered === "PRODUITS" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "20px" }}>
                {categories.map(cat => (
                  <Link key={cat.id} href={`/products?category=${cat.id}`} onClick={() => setHovered(null)}
                    style={{ 
                      textDecoration: "none", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center",
                      padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "rgba(252,255,0,0.05)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                  >
                    <div style={{ width: "80px", height: "80px", position: "relative", background: "var(--bg-elevated)", padding: "10px" }}>
                      {cat.image_url && <Image src={cat.image_url} alt={cat.name} fill style={{ objectFit: "contain" }} />}
                    </div>
                    <span style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "14px", color: "#fff", letterSpacing: "0.05em" }}>{cat.name.toUpperCase()}</span>
                  </Link>
                ))}
              </div>
            )}

            {hovered === "MARQUES" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "20px" }}>
                {brands.map(brand => (
                  <Link key={brand.id} href={`/products?brand=${brand.id}`} onClick={() => setHovered(null)}
                    style={{ 
                      textDecoration: "none", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center",
                      padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "rgba(252,255,0,0.05)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                  >
                    <div style={{ width: "80px", height: "80px", position: "relative", background: "#fff", padding: "10px" }}>
                      {brand.logo_url && <Image src={brand.logo_url} alt={brand.name} fill style={{ objectFit: "contain", padding: "5px" }} />}
                    </div>
                    <span style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "14px", color: "#fff", letterSpacing: "0.05em" }}>{brand.name.toUpperCase()}</span>
                  </Link>
                ))}
              </div>
            )}

            {hovered === "SOLDES" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "20px" }}>
                {saleProducts.map(p => (
                  <Link key={p.id} href={`/products/${p.id}`} onClick={() => setHovered(null)}
                    style={{ 
                      textDecoration: "none", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center",
                      padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid #ef444444",
                      transition: "all 0.2s ease", position: "relative"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.background = "rgba(239,68,68,0.05)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#ef444444"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                  >
                    <span style={{ position: "absolute", top: "8px", left: "8px", background: "#ef4444", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "2px 6px", fontFamily: "var(--font-condensed)" }}>SOLDE</span>
                    <div style={{ width: "80px", height: "80px", position: "relative", background: "var(--bg-elevated)", padding: "10px" }}>
                      {p.images?.[0] && <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: "contain" }} />}
                    </div>
                    <span style={{ fontFamily: "var(--font-condensed)", fontWeight: 300, fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.02em", textAlign: "center" }}>{p.name.toUpperCase()}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", color: "var(--accent)" }}>{p.price.toLocaleString()} DA</span>
                  </Link>
                ))}
                {saleProducts.length === 0 && (
                  <div style={{ gridColumn: "span 5", textAlign: "center", padding: "40px" }}>
                    <p style={{ fontFamily: "var(--font-condensed)", fontSize: "18px", color: "var(--text-muted)" }}>AUCUNE PROMO EN COURS</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Sidebar Overlay */}
        {menuOpen && (
          <>
            <div 
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                height: "100vh",
                width: "85%",
                maxWidth: "360px",
                background: "var(--bg-primary)",
                borderRight: "1px solid var(--border)",
                borderTop: "1px solid var(--border)",
                zIndex: 101,
                display: "flex",
                flexDirection: "column",
                boxShadow: "20px 0 40px rgba(0,0,0,0.5)",
                animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                paddingBottom: "80px"
              }}
            >
              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
                 <button 
                   onClick={() => setMobileTab("categories")}
                   style={{ flex: 1, padding: "16px 0", background: "none", border: "none", borderBottom: mobileTab === "categories" ? "2px solid var(--accent)" : "2px solid transparent", color: mobileTab === "categories" ? "#fff" : "var(--text-secondary)", fontFamily: "var(--font-alt)", fontSize: "14px", letterSpacing: "0.05em", fontWeight: 400, cursor: "pointer", transition: "all 0.2s" }}>
                   CATÉGORIES
                 </button>
                 <button 
                   onClick={() => setMobileTab("marques")}
                   style={{ flex: 1, padding: "16px 0", background: "none", border: "none", borderBottom: mobileTab === "marques" ? "2px solid var(--accent)" : "2px solid transparent", color: mobileTab === "marques" ? "#fff" : "var(--text-secondary)", fontFamily: "var(--font-alt)", fontSize: "14px", letterSpacing: "0.05em", fontWeight: 400, cursor: "pointer", transition: "all 0.2s" }}>
                   MARQUES
                 </button>
              </div>

              {/* Content */}
              <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
                {mobileTab === "categories" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {categories.length === 0 ? (
                      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Chargement...</p>
                    ) : categories.map((cat) => (
                      <Link key={cat.id} href={`/products?category=${cat.id}`} onClick={() => setMenuOpen(false)} 
                        style={{
                          textDecoration: "none", 
                          fontFamily: "var(--font-condensed)", 
                          fontSize: "16px",
                          letterSpacing: "0.04em",
                          fontWeight: 700,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          transition: "color 0.2s"
                        }}>
                        {cat.image_url && <img src={cat.image_url} alt={cat.name} style={{ width: "40px", height: "40px", borderRadius: "0", objectFit: "cover" }} />}
                        <span>{cat.name.toUpperCase()}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {brands.length === 0 ? (
                      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Chargement...</p>
                    ) : brands.map((brand) => (
                      <Link key={brand.id} href={`/products?brand=${brand.id}`} onClick={() => setMenuOpen(false)} 
                        style={{
                          textDecoration: "none", 
                          fontFamily: "var(--font-condensed)", 
                          fontSize: "16px",
                          letterSpacing: "0.04em",
                          fontWeight: 700,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px"
                        }}>
                        {brand.logo_url && <img src={brand.logo_url} alt={brand.name} style={{ width: "40px", height: "40px", borderRadius: "0", objectFit: "cover" }} />}
                        <span>{brand.name.toUpperCase()}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Backdrop */}
            <div 
              onClick={() => setMenuOpen(false)} 
              style={{ 
                position: "absolute", left: 0, right: 0, top: "100%", height: "100vh", 
                background: "rgba(0,0,0,0.7)", zIndex: 100, backdropFilter: "blur(4px)",
                animation: "fadeIn 0.3s ease"
              }} 
            />
          </>
        )}

        {mounted && isMobile && (
          <div style={{ display: "flex", justifyContent: "space-around", gap: "8px", borderTop: "1px solid var(--border)", background: "var(--bg-secondary)", padding: "10px 12px" }}>
            <Link href="/products" style={{ textDecoration: "none", fontFamily: "var(--font-alt)", fontWeight: 400, fontSize: "12px", color: "var(--text-primary)" }}>PRODUITS</Link>
            <Link href="/products#brands" style={{ textDecoration: "none", fontFamily: "var(--font-alt)", fontWeight: 400, fontSize: "12px", color: "var(--text-primary)" }}>MARQUES</Link>
            <Link href="/products?sale=true" style={{ textDecoration: "none", fontFamily: "var(--font-alt)", fontWeight: 400, fontSize: "12px", color: "var(--text-primary)" }}>SOLDES</Link>
          </div>
        )}

      </nav>

      {/* Search Overlay - Moved outside nav for proper transparency when scrolled */}
      {searchOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.7)", zIndex: 300, display: "flex", flexDirection: "column", padding: isMobile ? "20px" : "40px", backdropFilter: "blur(12px)" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: isMobile ? "30px" : "50px" }}>
              <Search size={isMobile ? 24 : 32} color="var(--accent)" />
              <input 
                autoFocus
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="NOM DU PRODUIT, MARQUE..." 
                style={{ flex: 1, background: "none", border: "none", borderBottom: "2px solid var(--border)", padding: "16px 0", color: "#fff", fontSize: isMobile ? "20px" : "32px", fontFamily: "var(--font-condensed)", fontWeight: 700, outline: "none" }}
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "10px" }}>
                <X size={isMobile ? 28 : 40} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "75vh", overflow: "auto", paddingRight: "10px" }}>
              {isSearching ? (
                <p style={{ fontFamily: "var(--font-condensed)", color: "var(--accent)", letterSpacing: "0.1em" }}>RECHERCHE EN COURS...</p>
              ) : searchResults.length > 0 ? (
                searchResults.map(p => (
                  <Link key={p.id} href={`/products/${p.id}`} onClick={() => { setSearchOpen(false); setSearchQuery(""); }} 
                    style={{ display: "flex", gap: "16px", alignItems: "center", padding: "12px", background: "#0A0A0A", border: "1px solid var(--border)", textDecoration: "none", transition: "all 0.15s ease", borderRadius: "0" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#0A0A0A"; e.currentTarget.style.borderColor = "var(--border)"; }}
                  >
                    <div style={{ position: "relative", width: "56px", height: "56px", background: "#0A0A0A", border: "1px solid var(--border)", borderRadius: "0", flexShrink: 0 }}>
                      {p.images?.[0] && <Image src={p.images[0]} alt="" fill style={{ objectFit: "contain", padding: "4px" }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "15px", color: "#fff", marginBottom: "2px" }}>{p.name.toUpperCase()}</p>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.02em" }}>{p.brand?.name || "RIVER NUTRITION"}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--accent)" }}>{p.price.toLocaleString()} DA</p>
                    </div>
                  </Link>
                ))
              ) : searchQuery.length > 2 && (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-condensed)", fontSize: "18px" }}>AUCUN RÉSULTAT POUR "{searchQuery.toUpperCase()}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div style={{ height: mounted ? (scrolled ? (isMobile ? "48px" : "54px") : (isMobile ? "76px" : "82px")) : "82px" }} />
    </>
  );
}
