"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Zap, Package, Shield, Truck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Countdown from "@/components/Countdown";
import { Product, Brand, Category } from "@/types";

interface HomeClientProps {
  featuredProducts: Product[];
  saleProducts: Product[];
  brands: Brand[];
  categories: Category[];
  activeSale: any;
  landingContent?: any;
}


export default function HomeClient({ featuredProducts, saleProducts, brands, categories, activeSale, landingContent }: HomeClientProps) {
  const slides = landingContent?.hero?.slides || [];
  const [slide, setSlide] = useState(0);
  const [brandStart, setBrandStart] = useState(0);
  const [fade, setFade] = useState(true);
  const [activeTab, setActiveTab] = useState<"worth" | "sale">("worth");
  const brandsPerPage = 5;

  useEffect(() => {
    if (slides.length === 0) return;
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => { setSlide(s => (s + 1) % slides.length); setFade(true); }, 300);
    }, 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  const goSlide = (dir: number) => {
    setFade(false);
    setTimeout(() => { setSlide(s => (s + dir + slides.length) % slides.length); setFade(true); }, 200);
  };

  const current = slides.length > 0 ? slides[slide] : null;
  const saleTarget = landingContent?.flash?.endsAt 
    ? new Date(landingContent.flash.endsAt) 
    : (activeSale?.ends_at ? new Date(activeSale.ends_at) : new Date(Date.now() + 18 * 3600000 + 44 * 60000 + 22000));
  const visibleBrands = brands.slice(brandStart, brandStart + brandsPerPage);

  // Determine the flash sale product link - prioritizing dashboard config, then common props
  const flashProductId = landingContent?.flash?.productId || 
    [...featuredProducts, ...saleProducts].find(p => p.name.toUpperCase().includes("OPTI-WOMEN"))?.id;

  return (
    <>
      <Navbar />

      {/* HERO */}
      {current && (
      <section className="hero-section" style={{ position: "relative", height: "100vh", minHeight: "520px", overflow: "hidden", marginTop: "-82px" ,fontFamily: "poppins"}}>
        <div style={{ position: "absolute", inset: 0, transition: "opacity 0.4s ease", opacity: fade ? 1 : 0 }}>
          <Image src={current.image} alt={current.title} fill style={{ objectFit: "cover" }} priority />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.2) 100%)" }} />
        </div>

        <div className="hero-content" style={{ position: "relative", zIndex: 2, maxWidth: "1280px", margin: "0 auto", padding: "0 24px", height: "100%", display: "flex", alignItems: "center" }}>
          <div style={{ maxWidth: "600px", opacity: fade ? 1 : 0, transform: fade ? "translateY(0)" : "translateY(12px)", transition: "all 0.5s ease 0.1s" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--accent)", color: "#000", fontFamily: "var(--font-alt)", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", padding: "5px 12px", borderRadius: "0px", marginBottom: "20px" }}>
              <Zap size={12} strokeWidth={3} />
              {current.tag}
            </div>
            <h1 className="section-heading glow-accent" style={{ fontFamily: "var(--font-alt)", fontSize: "clamp(40px, 7vw, 86px)", fontWeight: 700, color: "#fff", marginBottom: "20px", whiteSpace: "pre-line", lineHeight: 1.05 }}>
              {current.title}
            </h1>
            <p style={{ fontFamily: "var(--font-alt)", fontSize: "17px", color: "rgba(255,255,255,0.7)", marginBottom: "36px", fontWeight: 400 }}>
              {current.sub}
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link href={current.href} className="btn-accent" style={{ padding: "14px 32px", borderRadius: "0px", textDecoration: "none", fontSize: "15px", display: "inline-block", fontFamily: "var(--font-alt)", fontWeight: 700 }}>
                {current.cta}
              </Link>
              <Link href="/products" className="glass-btn" style={{ 
                padding: "14px 32px", 
                borderRadius: "0px", 
                textDecoration: "none", 
                fontSize: "15px", 
                display: "inline-block",
                fontFamily: "var(--font-alt)",
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#fff",
                fontWeight: 400,
                letterSpacing: "0.02em"
              }}>
                TOUS LES PRODUITS
              </Link>
            </div>

          </div>
        </div>

        {/* Slide arrows — absolutely positioned on desktop, inline on mobile */}
        <div className="hero-slide-arrows" style={{ display: "flex", gap: "10px" }}>
          {[-1, 1].map(dir => (
            <button key={dir} onClick={() => goSlide(dir)}
              className="hero-nav-btn"
              style={{
                background: "rgba(255,255,255,0.08)", 
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.15)", 
                borderRadius: "0px",
                width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#fff", transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "#000"; e.currentTarget.style.borderColor = "var(--accent)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
            >
              {dir === -1 ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
            </button>
          ))}
        </div>

        {/* Dots */}
        <div className="hero-dots" style={{ position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", zIndex: 3 }}>
          {slides.map((_: any, i: number) => (
            <button key={i} onClick={() => { setFade(false); setTimeout(() => { setSlide(i); setFade(true); }, 200); }}
              style={{ width: i === slide ? "40px" : "12px", height: "3px", borderRadius: "0px", border: "none", cursor: "pointer", transition: "all 0.3s ease", background: i === slide ? "var(--accent)" : "rgba(255,255,255,0.3)" }}
            />
          ))}
        </div>


        </section>
      )}

      {/* BRANDS */}
      <section style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "40px 0" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
            <div>
              <p style={{ fontFamily: "var(--font-condensed)", fontSize: "12px", letterSpacing: "0.12em", color: "var(--text-muted)", fontWeight: 600, marginBottom: "4px" }}>{landingContent?.brands?.label || "PARTENAIRES"}</p>
              <h2 className="section-heading" style={{ fontSize: "32px" }}>{landingContent?.brands?.heading || "MARQUES UNIVERSELLES"}</h2>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setBrandStart(i => Math.max(0, i - 1))} className="btn-ghost" style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--border)", background: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setBrandStart(i => Math.min(brands.length - brandsPerPage, i + 1))} className="btn-ghost" style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--border)", background: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="brands-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "3px" }}>
            {(brandStart === 0 ? brands.slice(0, brandsPerPage) : brands.slice(brandStart, brandStart + brandsPerPage)).map(brand => (
              <Link key={brand.id} href={`/products?brand=${brand.id}`}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "0", padding: "20px 16px", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", minHeight: "72px", transition: "all 0.25s ease" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-card)"; }}
              >
                <span style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "13px", letterSpacing: "0.06em", color: "var(--text-secondary)", textAlign: "center" }}>
                  {brand.name.toUpperCase()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* GOALS */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "72px 24px 0", background: "#" }}>
        <div style={{ marginBottom: "40px" }}>
          <p style={{ fontFamily: "var(--font-condensed)", fontSize: "12px", letterSpacing: "0.12em", color: "var(--accent)", fontWeight: 700, marginBottom: "6px" }}>{landingContent?.goals?.label || "CHOISISSEZ VOTRE VOIE"}</p>
          <h2 className="section-heading" style={{ fontSize: "clamp(36px, 5vw, 52px)", color: "#ffff", whiteSpace: "pre-line" }}>
            {landingContent?.goals?.heading || "QUEL EST VOTRE\nOBJECTIF ?"}
          </h2>
        </div>

        {landingContent?.goals?.items && landingContent.goals.items.some((i: any) => i.image) && (
          <div style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}>
            <style>{`
              .local-goals-grid {
                display: grid;
                grid-template-columns: repeat(${landingContent.goals.items.filter((i: any) => i.image).length}, 1fr);
                gap: 3px;
                padding: 0;
              }
              @media (max-width: 768px) {
                .local-goals-grid {
                  grid-template-columns: repeat(2, 1fr) !important;
                }
              }
            `}</style>
            <div className="local-goals-grid">
              {landingContent.goals.items.filter((i: any) => i.image).map((item: any, idx: number) => (
                <Link
                  key={idx}
                  href={item.categoryId ? `/products?category=${item.categoryId}` : `/products`}
                  className="goal-card"
                  style={{ position: "relative", borderRadius: "0", overflow: "hidden", aspectRatio: "3/4", display: "block", textDecoration: "none", border: "1px solid var(--border)" }}
                >
                  <Image
                    src={item.image}
                    alt={item.label || "Objectif"}
                    fill
                    className="goal-img"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="goal-overlay" />
                  <h3 className="goal-title section-heading" style={{ fontSize: "16px", marginBottom: "8px" }}>{(item.label || "OBJECTIF").toUpperCase()}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* PROMO TICKER */}
      <div className="promo-bar" style={{ width: "100vw", marginLeft: "calc(50% - 50vw)", background: landingContent?.promo?.bgColor || "#FF51C5", color: landingContent?.promo?.textColor || "#000" }}>
        <div className="promo-wrap" style={{ overflow: "hidden", maxWidth: "100vw" }}>
          <div className="promo-inner" style={{ display: "inline-block", whiteSpace: "nowrap", padding: "10px 0" }}>
            {landingContent?.promo?.text || "OFFRE SPÉCIALE · JUSQU'À -40% · STOCKS LIMITÉS · OFFRE SPÉCIALE · JUSQU'À -40% · STOCKS LIMITÉS · OFFRE SPÉCIALE · JUSQU'À -40% · STOCKS LIMITÉS"}
          </div>
        </div>
      </div>

      {/* FLASH SALE */}
      <section style={{ background: landingContent?.flash?.bgColor || "#0A0A0A", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "60px 0" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          {/* Header: button left, label+heading right */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
            <div style={{ flex: "0 0 auto" }}>
              <Link href="/products?filter=sale" className="btn-ghost" style={{ padding: "13px 24px", borderRadius: "6px", textDecoration: "none", fontSize: "14px", display: "inline-block" }}>
                VOIR TOUS LES SOLDES
              </Link>
            </div>
             <div className="mobile-text-center" style={{ textAlign: "right", flex: "1 1 320px" }}>
               <div style={{ marginBottom: "4px" }}>
                 <span style={{ fontFamily: "var(--font-dm)", fontSize: "12px", fontWeight: 400, letterSpacing: "0.25em", color: "#ff3b3b" }}>OFFRE LIMITÉE</span>
               </div>
               <h2 className="section-heading" style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(28px, 4vw, 56px)", margin: 0, lineHeight: 0.9 }}>
                SOLDES<br /><span style={{ color: landingContent?.flash?.accentColor || "#FF51C5" }}>SPÉCIAUX</span>
               </h2>
             </div>
          </div>

          {/* Big featured sale card - Redesigned for Premium Aesthetic */}
          <div className="flash-big-card" style={{ 
            background: "linear-gradient(145deg, #0D0D0D 0%, #151515 100%)", 
            border: "1px solid var(--border)", 
            borderRadius: "0px", 
            overflow: "hidden", 
            marginBottom: "16px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            position: "relative"
          }}>
            {/* Top Center Badge - Floating and Square */}
            <div className="mobile-hide" style={{ 
              position: "absolute", 
              top: "14px", 
              left: "61%", 
              transform: "translateX(-50%)", 
              background: landingContent?.flash?.badgeColor || "#e6ff03ff", 
              color: "#000000ff", 
              padding: "4px 12px", 
              fontFamily: "var(--font-bebas)", 
              fontWeight: 400, 
              fontSize: "14px", 
              letterSpacing: "0.05em",
              zIndex: 10,
              boxShadow: `0 4px 12px ${landingContent?.flash?.badgeColor ? landingContent.flash.badgeColor + '4d' : 'rgba(177, 255, 59, 0.3)'}`,
              borderRadius: "0"
            }}>
              -25%
            </div>

            <div className="flash-big-card-inner" style={{ display: "grid", gridTemplateColumns: "1fr 520px", gap: "0", alignItems: "stretch" }}>
              {/* Text Side */}
              <div className="flash-text-side" style={{ 
                padding: "40px 8px 40px 0", 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "center", 
                alignItems: "flex-end", 
                textAlign: "right", 
                borderRight: "1px solid rgba(255,255,255,0.06)",
                position: "relative",
                zIndex: 2,
                width: "100%"
              }}>
                <div style={{ width: "100%", paddingLeft: "32px", display: "flex", flexDirection: "column" }}>
                  <div className="flash-tagline" style={{ 
                    fontFamily: "var(--font-dm)", 
                    fontSize: "14px", 
                    color: landingContent?.flash?.accentColor || "#FF51C5", 
                    fontWeight: 400, 
                    letterSpacing: "0.45em",
                    marginBottom: "8px",
                    alignSelf: "flex-end",
                    marginRight: "12px"
                  }}>{landingContent?.flash?.featuredTag || "[FEATURED SUPPLEMENT]"}</div>
                  
                  <h3 className="flash-title" style={{ 
                    fontFamily: "var(--font-bebas)", 
                    fontWeight: 400, 
                    fontSize: "46px", 
                    lineHeight: "1",
                    marginBottom: "16px", 
                    color: "#fff",
                    textShadow: "0 0 20px rgba(255,255,255,0.1)",
                    alignSelf: "flex-end",
                    marginRight: "12px"
                  }}>{landingContent?.flash?.featuredTitle || "ON OPTI-WOMEN"}</h3>
                  
                  {/* Prices shifted right */}
                  <div className="flash-price-block" style={{ 
                    display: "flex", 
                    gap: "24px", 
                    alignItems: "flex-end", 
                    marginBottom: "32px", 
                    justifyContent: "flex-start",
                    alignSelf: "flex-start",
                    marginLeft: "4px" 
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
                      <span style={{ 
                        fontFamily: "var(--font-bebas)", 
                        fontSize: "14px", 
                        fontWeight: 400, 
                        color: "#ff3b3b", 
                        letterSpacing: "0.1em" 
                      }}>-25%</span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                        <span style={{ fontFamily: "var(--font-bebas)", fontSize: "44px", fontWeight: 400, color: "var(--accent)", lineHeight: "1" }}>{landingContent?.flash?.featuredSalePrice || "4900"} DA</span>
                        <span style={{ fontFamily: "var(--font-bebas)", fontSize: "22px", color: "var(--text-muted)", textDecoration: "line-through" }}>{landingContent?.flash?.featuredOriginalPrice || "6500"} DA</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flash-cta-wrap" style={{ display: "flex", justifyContent: "flex-end", marginRight: "12px" }}>
                    <Link href={flashProductId ? `/products/${flashProductId}` : "/products"} className="btn-accent" style={{ 
                      padding: "16px 40px", 
                      borderRadius: "0", 
                      background: landingContent?.flash?.accentColor || "#FF51C5",
                      textDecoration: "none", 
                      display: "inline-block",
                      fontSize: "14px",
                      boxShadow: `0 10px 20px ${landingContent?.flash?.accentColor ? landingContent.flash.accentColor + '38' : 'rgba(255, 7, 210, 0.22)'}`
                    }}>
                      ACHETER MAINTENANT
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Image Side */}
              <div className="flash-image-wrap" style={{ position: "relative", minHeight: "560px", overflow: "hidden" }}>
                <Image className="flash-image" src={landingContent?.flash?.featuredImage || "/on-opti-women_Image_01.webp"} alt="" fill style={{ objectFit: "cover" }} />
                <div style={{ 
                  position: "absolute", 
                  inset: 0, 
                  background: "linear-gradient(to right, rgba(13,13,13,0.8) 0%, rgba(13,13,13,0) 30%)" 
                }} />
              </div>
            </div>
          </div>

          {/* Expiry row moved under the big card */}
          <div className="mobile-stack" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "1280px", margin: "8px auto 24px", padding: "0 24px" }}>
            <div style={{ fontSize: "14px", color: "var(--text-secondary)" , letterSpacing: "0.3em", textTransform: "uppercase" }}>L'offre expire dans</div>
            <Countdown targetDate={saleTarget} />
          </div>

          {/* Grid of remaining sale products (if any) */}
          {/* removed remaining sale product cards per design */}
        </div>
      </section>

      {/* FEATURED REDESIGN - Split Layout */}
      <section style={{ maxWidth: "1600px", margin: "0 auto", padding: "80px 24px", background: "#FFFFFF" }}>
        {/* Section Heading Discovery */}
        <div style={{ marginBottom: "52px", paddingLeft: "0px" }}>
          <p style={{ 
            fontFamily: "var(--font-condensed)", 
            fontSize: "10px", 
            letterSpacing: "0.21em", 
            color: "#dfff95ff", 
            fontWeight: 700, 
            marginBottom: "12px",
            background: "#000",
            display: "inline-block",
            padding: "4px 12px",
            textTransform: "uppercase"
          }}>
            {landingContent?.featured?.label || "EXCLUSIVITÉS NOEST"}
          </p>
          <h2 className="section-heading" style={{ fontSize: "clamp(32px, 5vw, 42px)", lineHeight: "1.1", color: "#000", whiteSpace: "pre-line" }}>
            {landingContent?.featured?.heading || "TOP SELLING\nWORTH THE HYPE"}
          </h2>
        </div>

        <div className="responsive-grid-split" style={{ display: "grid", gridTemplateColumns: "520px 1fr", gap: "40px", alignItems: "start" }}>
          
          {/* Left: Featured Visual */}
          <div className="featured-visual" style={{ position: "relative", borderRadius: "0px", overflow: "visible", border: "1px solid #eee" }}>
            {/* Architectural Corners - positioned outside clip */}
            <span className="corner-plus tl">+</span>
            <span className="corner-plus tr">+</span>
            <span className="corner-plus bl">+</span>
            <span className="corner-plus br">+</span>
            
            <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
              <Image 
                src={landingContent?.featured?.image || (activeTab === "worth" 
                  ? "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80" 
                  : "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80")} 
                alt="" 
                fill 
                style={{ objectFit: "cover" }}
                key={activeTab} // Forces refresh for transition
                className="fade-in"
              />
              <div className="featured-visual-overlay">
                <p style={{ fontFamily: "var(--font-condensed)", fontSize: "12px", letterSpacing: "0.2em", color: "var(--accent)", fontWeight: 700, marginBottom: "8px" }}>
                  {activeTab === "worth" ? "EDITION 2024" : "OFFRE LIMITÉE"}
                </p>
                <h2 className="section-heading" style={{ color: "#fff", lineHeight: "1" }}>
                  {activeTab === "worth" ? "NOEST-DZ\nEXCLUSIVE" : "MEGA\nSOLDE DZ"}
                </h2>
                <div style={{ width: "40px", height: "2px", background: "var(--accent)", marginTop: "20px" }} />
              </div>
            </div>
          </div>

          {/* Right: Tabs & Product Grid */}
          <div style={{ paddingTop: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px", borderBottom: "1px solid #eee", paddingBottom: "12px" }}>
              <div style={{ display: "flex", gap: "32px" }}>
                {[
                  { id: "worth", label: "WORTH THE HYPE" },
                  { id: "sale", label: "ON SALE" }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{ 
                      background: "none",
                      border: "none",
                      color: activeTab === tab.id ? "#000" : "#999",
                      fontFamily: "var(--font-display)",
                      fontSize: "13px",
                      letterSpacing: "0.06em",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      position: "relative",
                      padding: "6px 0",
                      textTransform: "uppercase"
                    }}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div style={{ position: "absolute", bottom: "-13px", left: 0, right: 0, height: "2px", background: "#000" }} />
                    )}
                  </button>
                ))}
              </div>
              <Link href="/products" className="underline-btn mobile-hide">VOIR TOUT</Link>
            </div>

            <div className="mobile-grid-2" style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(4, 1fr)", 
              gap: "10px",
              animation: "fadeIn 0.5s ease" 
            }}>
              {(activeTab === "worth" ? featuredProducts : saleProducts.slice(0, 4)).map(product => (
                <ProductCard key={product.id} product={product} isLight={true} />
              ))}
            </div>

            {/* Mobile-only CTA */}
            <div className="mobile-show" style={{ justifyContent: "center", marginTop: "32px" }}>
              <Link href="/products" className="underline-btn" style={{ padding: "10px 20px" }}>VOIR TOUT LES PRODUITS</Link>
            </div>
          </div>
        </div>
      </section>

      {/* DELIVERY */}
      <section style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", padding: "72px 24px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <p style={{ fontFamily: "var(--font-condensed)", fontSize: "12px", letterSpacing: "0.12em", color: "var(--accent)", fontWeight: 700, marginBottom: "8px" }}>LIVRAISON & EXPÉDITION</p>
            <h2 className="section-heading" style={{ fontSize: "clamp(28px, 4vw, 40px)", maxWidth: "560px", margin: "0 auto" }}>
              VOTRE COMMANDE LIVRÉE AVEC SOIN AVEC NOEST-DZ
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "3px", marginBottom: "40px" }}>
            {[
              { icon: Zap, title: "Livraison Express", desc: "Expédition sous 24h ouvrées. Suivi en temps réel dès la confirmation." },
              { icon: Truck, title: "Partout en Algérie", desc: "Nous livrons dans les 58 wilayas. Délai : 2 à 5 jours." },
              { icon: Package, title: "Emballage Sécurisé", desc: "Chaque produit conditionné pour garantir son intégrité." },
              { icon: Shield, title: "Produits Authentiques", desc: "100% originaux, importés directement des fabricants." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "0", padding: "24px", transition: "border-color 0.2s ease" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                <div style={{ width: "40px", height: "40px", background: "rgba(232,255,0,0.08)", border: "1px solid rgba(232,255,0,0.2)", borderRadius: "0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <Icon size={20} color="var(--accent)" />
                </div>
                <h3 style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "17px", letterSpacing: "0.04em", marginBottom: "8px" }}>{title}</h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", padding: "24px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px" }}>
            <p style={{ fontFamily: "var(--font-condensed)", fontSize: "15px", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "4px" }}>LIVRAISON ASSURÉE PAR</p>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "32px", letterSpacing: "0.08em", color: "var(--accent)" }}>NOEST-DZ</span>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "8px" }}>Paiement à la livraison disponible</p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
