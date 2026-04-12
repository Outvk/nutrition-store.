"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Menu, X, Search, Zap } from "lucide-react";
import { getCart } from "@/lib/cart";
import { STORE_CONFIG } from "@/lib/config";
import { Category, Brand, Product } from "@/types";
import { useLanguage } from "@/i18n/LanguageContext";
import { Globe } from "lucide-react";

interface PackProduct extends Product {
  nav_image?: string;
  nav_label?: string;
}

export default function Navbar() {
  const { locale, setLocale, t, dir } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"categories" | "marques">("categories");
  const [isMobile, setIsMobile] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("recent_searches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term || term.length < 2) return;
    const cleanTerm = term.trim().toLowerCase();
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== cleanTerm);
      const updated = [cleanTerm, ...filtered].slice(0, 5);
      localStorage.setItem("recent_searches", JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recent_searches");
  };

  const [hovered, setHovered] = useState<string | null>(null);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [packProducts, setPackProducts] = useState<PackProduct[]>([]);

  const isManualRef = useRef(false);

  useEffect(() => {
    const performSearch = async () => {
      if (isManualRef.current) {
        isManualRef.current = false;
        return;
      }
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
        if (searchQuery.length > 2) {
          saveRecentSearch(searchQuery);
        }
      }
    };

    const timer = setTimeout(performSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCategorySearch = async (cat: Category) => {
    isManualRef.current = true;
    setSearchQuery(cat.name.toUpperCase());
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?category_id=${cat.id}`);
      if (res.ok) setSearchResults(await res.json());
    } catch (e) {
      console.error("Category search failed", e);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const loadTaxonomy = async () => {
      try {
        const resCat = await fetch('/api/taxonomy?type=categories');
        const resBrand = await fetch('/api/taxonomy?type=brands');
        const resPacks = await fetch('/api/taxonomy?type=pack_products');
        const resSale = await fetch('/api/search?sale=true');
        if (resCat.ok) setCategories(await resCat.json());
        if (resBrand.ok) setBrands(await resBrand.json());
        if (resPacks.ok) setPackProducts(await resPacks.json());
        if (resSale.ok) setSaleProducts((await resSale.json()).slice(0, 5));
        
        // Fetch popular products for search default
        const resPopular = await fetch('/api/search?popular=true');
        if (resPopular.ok) setPopularProducts((await resPopular.json()).slice(0, 3));
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
              <span className={locale === 'ar' ? 'font-arabic' : ''} style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "12px", letterSpacing: "0.08em", color: "#000" }}>
                {locale === 'ar' ? '🚚 توصيل إلى جميع الولايات' : '🚚 LIVRAISON PARTOUT EN ALGÉRIE'}
              </span>
              <span className={locale === 'ar' ? 'font-arabic' : ''} style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "12px", letterSpacing: "0.08em", color: "#000" }}>
                {locale === 'ar' ? '💳 الدفع عند الاستلام' : '💳 PAIEMENT À LA LIVRAISON'}
              </span>
              <span className={locale === 'ar' ? 'font-arabic' : ''} style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "12px", letterSpacing: "0.08em", color: "#000" }}>
                {locale === 'ar' ? '⚡ منتجات أصلية 100%' : '⚡ PRODUITS 100% AUTHENTIQUES'}
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
                  { label: "products", href: "/products" },
                  { label: "brands", href: "/marques" },
                  { label: "packs", href: "/packs" },
                  { label: "sale", href: "/products?sale=true" },
                ].map((item) => (
                  <Link key={item.label} href={item.href} 
                    onMouseEnter={() => setHovered(item.label)}
                    style={{
                      fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-alt)',
                      fontWeight: 700,
                      fontSize: locale === 'ar' ? "14px" : "13px",
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
                    {t(`nav.${item.label}`)}
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

                {/* Language Toggler */}
                <button 
                  onClick={() => setLocale(locale === 'fr' ? 'ar' : 'fr')}
                  style={{ 
                    background: "rgba(255,255,255,0.05)", 
                    border: "1px solid var(--border)", 
                    borderRadius: "4px",
                    color: "var(--accent)", 
                    fontSize: "11px", 
                    fontWeight: 700, 
                    padding: "4px 8px", 
                    cursor: "pointer",
                    fontFamily: locale === 'ar' ? 'var(--font-poppins)' : 'var(--font-cairo)',
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "#000"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--accent)"; }}
                >
                  {locale === 'fr' ? 'AR' : 'FR'}
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
          <div className="hide-scrollbar" style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px", maxHeight: "80vh", overflowY: "auto" }}>
            {hovered === "products" && (
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

            {hovered === "brands" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "20px" }}>
                {brands.map(brand => (
                  <Link key={brand.id} href={`/marques#brand-${brand.id}`} onClick={() => setHovered(null)}
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

            {hovered === "sale" && (
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
                    <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", color: "var(--accent)" }}>{(p.sale_price || p.price).toLocaleString()} DA</span>
                      {p.sale_price && (
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", textDecoration: "line-through" }}>{p.price.toLocaleString()} DA</span>
                      )}
                    </div>
                  </Link>
                ))}
                {saleProducts.length === 0 && (
                  <div style={{ gridColumn: "span 5", textAlign: "center", padding: "40px" }}>
                    <p style={{ fontFamily: "var(--font-condensed)", fontSize: "18px", color: "var(--text-muted)" }}>AUCUNE PROMO EN COURS</p>
                  </div>
                )}
              </div>
            )}

            {hovered === "packs" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
                {packProducts.map(p => (
                  <Link key={p.id} href={`/products/${p.id}`} onClick={() => setHovered(null)}
                    style={{ 
                      textDecoration: "none", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center",
                      padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)",
                      transition: "all 0.2s ease", position: "relative"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "rgba(252,255,0,0.05)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                  >
                    <div style={{ width: "80px", height: "80px", position: "relative", background: "var(--bg-elevated)", padding: "10px" }}>
                      {(p.nav_image || p.images?.[0]) && <Image src={p.nav_image || p.images[0]} alt={p.name} fill style={{ objectFit: "contain" }} />}
                    </div>
                    <span style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "14px", color: "#fff", letterSpacing: "0.05em", textAlign: "center" }}>{(p.nav_label || p.name).toUpperCase()}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", color: "var(--accent)" }}>{p.price.toLocaleString()} DA</span>
                  </Link>
                ))}
                {packProducts.length === 0 && (
                  <div style={{ gridColumn: "span 5", textAlign: "center", padding: "40px" }}>
                    <p style={{ fontFamily: "var(--font-condensed)", fontSize: "18px", color: "var(--text-muted)" }}>SÉLECTIONNEZ DES PACKS DANS LE DASHBOARD</p>
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
                   style={{ flex: 1, padding: "16px 0", background: "none", border: "none", borderBottom: mobileTab === "categories" ? "2px solid var(--accent)" : "2px solid transparent", color: mobileTab === "categories" ? "#fff" : "var(--text-secondary)", fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-alt)', fontSize: "14px", letterSpacing: "0.05em", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                   {t("nav.categories")}
                 </button>
                 <button 
                   onClick={() => setMobileTab("marques")}
                   style={{ flex: 1, padding: "16px 0", background: "none", border: "none", borderBottom: mobileTab === "marques" ? "2px solid var(--accent)" : "2px solid transparent", color: mobileTab === "marques" ? "#fff" : "var(--text-secondary)", fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-alt)', fontSize: "14px", letterSpacing: "0.05em", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                   {t("nav.brands_label")}
                 </button>
              </div>

              {/* Content */}
              <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
                {mobileTab === "categories" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {categories.length === 0 ? (
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'inherit' }}>{t("common.loading")}</p>
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
                        {cat.image_url && (
                          <div style={{ width: "40px", height: "40px", position: "relative", flexShrink: 0, background: "var(--bg-elevated)" }}>
                            <Image src={cat.image_url} alt={cat.name} fill style={{ objectFit: "cover" }} />
                          </div>
                        )}
                        <span>{cat.name.toUpperCase()}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {brands.length === 0 ? (
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'inherit' }}>{t("common.loading")}</p>
                    ) : brands.map((brand) => (
                      <Link key={brand.id} href={`/marques#brand-${brand.id}`} onClick={() => setMenuOpen(false)} 
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
                        {brand.logo_url && (
                          <div style={{ width: "40px", height: "40px", position: "relative", flexShrink: 0, background: "#fff", padding: "4px" }}>
                            <Image src={brand.logo_url} alt={brand.name} fill style={{ objectFit: "contain" }} />
                          </div>
                        )}
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
            <Link href="/products" style={{ textDecoration: "none", fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-alt)', fontWeight: 700, fontSize: "11px", color: "var(--text-primary)" }}>{t("nav.products")}</Link>
            <Link href="/marques" style={{ textDecoration: "none", fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-alt)', fontWeight: 700, fontSize: "11px", color: "var(--text-primary)" }}>{t("nav.brands")}</Link>
            <Link href="/packs" style={{ textDecoration: "none", fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-alt)', fontWeight: 700, fontSize: "11px", color: "var(--text-primary)" }}>{t("nav.packs")}</Link>
            <Link href="/products?sale=true" style={{ textDecoration: "none", fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-alt)', fontWeight: 700, fontSize: "11px", color: "var(--text-primary)" }}>{t("nav.sale")}</Link>
            <button onClick={() => setLocale(locale === 'fr' ? 'ar' : 'fr')} style={{ background: "none", border: "1px solid var(--accent)", color: "var(--accent)", fontSize: "10px", fontWeight: 800, padding: "2px 6px", cursor: "pointer", fontFamily: locale === 'ar' ? 'var(--font-condensed)' : 'var(--font-cairo)' }}>{locale === 'fr' ? 'AR' : 'FR'}</button>
          </div>
        )}

      </nav>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .mobile-hide-scrollbar::-webkit-scrollbar { display: none; }
      `}} />

      {/* Search Overlay */}
      {searchOpen && (
        <div style={{ 
          position: "fixed", 
          inset: 0, 
          background: "#ffffff", 
          zIndex: 300, 
          display: "flex", 
          flexDirection: "column", 
          animation: "fadeIn 0.2s ease",
          color: "#000"
        }}>
          <div style={{ position: "sticky", top: 0, zIndex: 10, background: "#fff", borderBottom: "1px solid #f0f0f0" }}>
            <SearchInput isMobile={isMobile} searchQuery={searchQuery} setSearchQuery={setSearchQuery} setSearchOpen={setSearchOpen} />
          </div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: isMobile ? "1fr" : "260px 1fr", 
            flex: 1, 
            overflow: isMobile ? "auto" : "hidden" 
          }} className="hide-scrollbar">
            {/* Sidebar */}
            <div style={{ 
              padding: isMobile ? "12px 0px" : "40px 40px", 
              borderRight: isMobile ? "none" : "1px solid #eee",
              overflowY: "auto",
              display: isMobile && searchQuery.length > 0 ? "none" : "block",
              background: "#fafafa"
            }}>
              {isMobile && (
                <div style={{ padding: "0 20px", marginBottom: "16px" }}>
                  <div style={{ 
                    display: "flex", 
                    overflowX: "auto", 
                    gap: "8px", 
                    padding: "4px 0",
                    msOverflowStyle: "none",
                    scrollbarWidth: "none"
                  }} className="mobile-hide-scrollbar">
                    {categories.map(cat => (
                      <button 
                        key={cat.id} 
                        onClick={() => handleCategorySearch(cat)} 
                        style={{ 
                          color: "#333", 
                          background: "#fff",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "12px", 
                          fontFamily: "var(--font-condensed)", 
                          whiteSpace: "nowrap",
                          padding: "8px 16px",
                          fontWeight: 700,
                          cursor: "pointer"
                        }} 
                      >
                        {cat.name.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}



              {!isMobile && (
                <div style={{ marginBottom: "40px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "20px" }}>
                    <h4 style={{ fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-condensed)', fontSize: "11px", letterSpacing: "0.15em", color: "#999", fontWeight: 800, margin: 0 }}>{t("search.recent")}</h4>
                    {recentSearches.length > 0 && (
                      <button onClick={clearRecentSearches} style={{ background: "none", border: "none", fontSize: "10px", color: "#ff6262ff", cursor: "pointer", fontWeight: 600 }}>{t("search.clear")}</button>
                    )}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {recentSearches.length > 0 ? (
                      recentSearches.map(item => (
                        <button 
                          key={item} 
                          onClick={() => setSearchQuery(item)} 
                          style={{ 
                            background: "#fff", 
                            border: "1px solid #ddd", 
                            color: "#444", 
                            padding: "5px 10px",
                            fontSize: "12px", 
                            fontFamily: "var(--font-condensed)", 
                            cursor: "pointer", 
                            transition: "all 0.2s",
                            borderRadius: "4px",
                            textTransform: "uppercase"
                          }} 
                        >
                          {item}
                        </button>
                      ))
                    ) : (
                      <p style={{ fontSize: "11px", color: "#ccc" }}>Aucune recherche récente</p>
                    )}
                  </div>
                </div>
              )}

              {!isMobile && (
                <div>
                  <h4 style={{ fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-condensed)', fontSize: "11px", letterSpacing: "0.15em", color: "#999", fontWeight: 800, marginBottom: "20px" }}>{t("nav.categories")}</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {categories.map(cat => (
                      <button 
                        key={cat.id} 
                        onClick={() => handleCategorySearch(cat)} 
                        style={{ 
                          color: "#333", 
                          background: "none",
                          border: "none",
                          textAlign: "left",
                          fontSize: "14px", 
                          fontFamily: "var(--font-condensed)", 
                          fontWeight: 600,
                          padding: 0,
                          cursor: "pointer"
                        }}
                      >
                        {cat.name.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div style={{ 
              padding: isMobile ? "20px" : "40px 60px", 
              overflowY: "auto",
              background: "#fff",
              minHeight: isMobile ? "calc(100vh - 200px)" : "auto"
            }}>
              {isSearching ? (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><p style={{ fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'inherit' }}>{t("common.loading")}</p></div>
              ) : searchQuery.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "20px" : "32px" }}>
                  <p style={{ fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-condensed)', fontSize: "11px", color: "#999", fontWeight: 800, letterSpacing: "0.1em" }}>{locale === 'ar' ? `نتائج ل "${searchQuery.toUpperCase()}"` : `RÉSULTATS POUR "${searchQuery.toUpperCase()}"`}</p>
                  
                  {searchResults.length > 0 ? (
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", 
                      gap: isMobile ? "16px" : "32px" 
                    }}>
                      {searchResults.map(p => (
                        <Link key={p.id} href={`/products/${p.id}`} onClick={() => setSearchOpen(false)} style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}>
                          <div style={{ width: "100%", aspectRatio: "1/1", border: "1px solid #eee", borderBottom: "2px solid #000", position: "relative", marginBottom: "12px" }}>
                            {p.images?.[0] && <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: "contain", padding: isMobile ? "12px" : "24px" }} />}
                          </div>
                          <p style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: isMobile ? "13px" : "15px", color: "#000", height: isMobile ? "32px" : "40px", overflow: "hidden" }}>{p.name.toUpperCase()}</p>
                          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                            <p style={{ fontFamily: "var(--font-display)", fontSize: isMobile ? "16px" : "20px", color: p.sale_price ? "var(--accent)" : "#000" }}>
                              {(p.sale_price || p.price).toLocaleString()} DA
                            </p>
                            {p.sale_price && (
                              <p style={{ fontSize: "12px", color: "#999", textDecoration: "line-through" }}>{p.price.toLocaleString()} DA</p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: "60px 20px", textAlign: "center", border: "1px dashed #eee", background: "#fafafa" }}>
                      <p style={{ fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-condensed)', color: "#999", fontSize: "14px" }}>{t("search.noResults")}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <p style={{ fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-condensed)', fontSize: "11px", color: "#999", marginBottom: "24px", fontWeight: 800 }}>{t("search.popular")}</p>
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", 
                    gap: isMobile ? "16px" : "32px" 
                  }}>
                    {popularProducts.map(p => (
                      <Link key={p.id} href={`/products/${p.id}`} onClick={() => setSearchOpen(false)} style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}>
                        <div style={{ width: "100%", aspectRatio: "1/1", border: "1px solid #eee", borderBottom: "2px solid #000", position: "relative", marginBottom: "12px" }}>
                          {p.images?.[0] && <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: "contain", padding: isMobile ? "12px" : "24px" }} />}
                        </div>
                        <p style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: isMobile ? "13px" : "15px", color: "#000", height: isMobile ? "32px" : "40px", overflow: "hidden" }}>{p.name.toUpperCase()}</p>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                          <p style={{ fontFamily: "var(--font-display)", fontSize: isMobile ? "16px" : "20px", color: p.sale_price ? "var(--accent)" : "#000" }}>
                            {(p.sale_price || p.price).toLocaleString()} DA
                          </p>
                          {p.sale_price && (
                            <p style={{ fontSize: "12px", color: "#999", textDecoration: "line-through" }}>{p.price.toLocaleString()} DA</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
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

const SearchInput = ({ isMobile, searchQuery, setSearchQuery, setSearchOpen }: { isMobile: boolean, searchQuery: string, setSearchQuery: (q: string) => void, setSearchOpen: (o: boolean) => void }) => (
  <div style={{ 
    padding: isMobile ? "16px 20px" : "24px 60px", 
    borderBottom: "1px solid #eee",
    display: "flex",
    alignItems: "center",
    gap: "24px",
    background: "#fff"
  }}>
    <Search size={isMobile ? 22 : 26} color="#000" />
    <input 
      autoFocus
      type="text" 
      value={searchQuery}
      onChange={e => setSearchQuery(e.target.value)}
      placeholder="RECHERCHER..." 
      style={{ 
        flex: 1, 
        background: "none", 
        border: "none", 
        color: "#000", 
        fontSize: isMobile ? "16px" : "24px", 
        fontFamily: "var(--font-condensed)", 
        fontWeight: 700, 
        outline: "none",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        width: "100%"
      }}
    />
    <button 
      onClick={() => { setSearchOpen(false); setSearchQuery(""); }} 
      style={{ 
        background: "#f5f5f5", 
        border: "none", 
        color: "#666", 
        cursor: "pointer", 
        width: "40px", 
        height: "40px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        transition: "all 0.2s",
        borderRadius: "50%"
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "#000"; e.currentTarget.style.color = "#fff"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "#f5f5f5"; e.currentTarget.style.color = "#666"; }}
    >
      <X size={20} />
    </button>
  </div>
);
