"use client";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Brand, Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { ChevronRight, Filter, Search } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface BrandsClientProps {
  brands: Brand[];
  initialProducts: Product[];
}

export default function BrandsClient({ brands, initialProducts }: BrandsClientProps) {
  const { t, locale, dir } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const brandProducts = useMemo(() => {
    const grouped: Record<string, Product[]> = {};
    
    // Sort brands alphabetically
    const sortedBrands = [...brands].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedBrands.forEach(brand => {
      // In a real app, we'd fetch all products for the brand. 
      // Here we filter the initialProducts we received.
      const products = initialProducts.filter(p => p.brand_id === brand.id);
      if (products.length > 0) {
        grouped[brand.id] = products;
      }
    });
    
    return { sortedBrands, grouped };
  }, [brands, initialProducts]);

  const filteredBrands = useMemo(() => {
    if (!searchTerm) return brandProducts.sortedBrands;
    return brandProducts.sortedBrands.filter(b => 
      b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [brandProducts.sortedBrands, searchTerm]);

  return (
    <div className="container" style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px" }}>
      {/* Header Section */}
      <div style={{ marginBottom: "64px", textAlign: "center" }}>
        <p style={{ fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-condensed)', fontSize: "14px", letterSpacing: "0.2em", color: "var(--accent)", fontWeight: 700, marginBottom: "12px", textTransform: "uppercase" }}>
          {locale === 'ar' ? "شركاؤنا الرسميون" : "NOS PARTENAIRES OFFICIELS"}
        </p>
        <h1 className="section-heading" style={{ fontSize: "clamp(40px, 8vw, 84px)", lineHeight: "0.9", marginBottom: "32px", color: "#fff", fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'inherit' }}>
          {locale === 'ar' ? <>جميع <br /><span style={{ color: "var(--accent)" }}>العلامات</span></> : <>TOUTES LES <br /><span style={{ color: "var(--accent)" }}>MARQUES</span></>}
        </h1>
        
        {/* Search Bar */}
        <div style={{ maxWidth: "500px", margin: "0 auto", position: "relative" }}>
          <Search size={20} style={{ position: "absolute", [locale === 'ar' ? 'right' : 'left']: "20px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
          <input 
            type="text" 
            placeholder={locale === 'ar' ? "ابحث عن علامة تجارية..." : "Rechercher une marque..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: locale === 'ar' ? "18px 56px 18px 24px" : "18px 24px 18px 56px",
              color: "#fff",
              fontSize: "16px",
              fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-condensed)',
              letterSpacing: "0.05em",
              borderRadius: "0px",
              outline: "none",
              transition: "border-color 0.3s ease",
              textAlign: locale === 'ar' ? 'right' : 'left'
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
            onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
          />
        </div>
      </div>

      {/* Quick Brand Links */}
      {!searchTerm && (
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "8px", 
          justifyContent: "center", 
          marginBottom: "80px",
          padding: "20px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)"
        }}>
          {brandProducts.sortedBrands.map(brand => (
            <a 
              key={brand.id} 
              href={`#brand-${brand.id}`}
              style={{
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.6)",
                textDecoration: "none",
                fontFamily: "var(--font-condensed)",
                letterSpacing: "0.05em",
                border: "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--accent)";
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.background = "rgba(232,255,0,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              {brand.name.toUpperCase()}
            </a>
          ))}
        </div>
      )}

      {/* Brands Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", 
        gap: "40px",
        marginBottom: "100px"
      }}>
        {filteredBrands.map(brand => {
          const products = brandProducts.grouped[brand.id] || [];
          if (products.length === 0 && !searchTerm) return null;
          
          return (
            <section key={brand.id} id={`brand-${brand.id}`} style={{ 
              background: "rgba(255,255,255,0.03)", 
              border: "1px solid rgba(255,255,255,0.05)",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              height: "100%"
            }}>
              <div style={{ 
                display: "flex", 
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                marginBottom: "32px",
                gap: "16px"
              }}>
                {brand.logo_url ? (
                  <div style={{ width: "120px", height: "120px", position: "relative", background: "#fff", padding: "12px" }}>
                    <Image 
                      src={brand.logo_url} 
                      alt={brand.name} 
                      fill 
                      style={{ objectFit: "contain", padding: "8px" }} 
                    />
                  </div>
                ) : (
                  <div style={{ width: "120px", height: "120px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Filter size={40} color="rgba(255,255,255,0.1)" />
                  </div>
                )}
                <div>
                  <h2 className="section-heading" style={{ fontSize: "24px", color: "#fff", margin: 0, letterSpacing: "0.05em", fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'inherit' }}>
                    {brand.name.toUpperCase()}
                  </h2>
                  <p style={{ fontSize: "12px", color: "var(--accent)", fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-condensed)', marginTop: "4px", fontWeight: 700 }}>
                    {products.length} {locale === 'ar' ? "منتجات" : "PRODUITS"}
                  </p>
                </div>
              </div>

              <div style={{ flex: 1, marginBottom: "32px" }}>
                {/* Show top 2 products simple preview */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {products.slice(0, 2).map(p => (
                    <Link key={p.id} href={`/products/${p.id}`} style={{ textDecoration: "none" }}>
                      <div style={{ width: "100%", aspectRatio: "1/1", position: "relative", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        {p.images?.[0] && <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: "contain", padding: "8px" }} />}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <Link 
                href={`/products?brand=${brand.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: "var(--accent)",
                  color: "#000",
                  textDecoration: "none",
                  fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-condensed)',
                  fontSize: "14px",
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  padding: "16px",
                  transition: "transform 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                {locale === 'ar' ? "عرض المجموعة" : "VOIR LA COLLECTION"} 
                {locale === 'ar' ? <ChevronRight size={16} style={{ transform: 'scaleX(-1)' }} /> : <ChevronRight size={16} />}
              </Link>
            </section>
          );
        })}
      </div>

      
      {/* Scroll to Top */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          position: "fixed",
          bottom: "40px",
          right: "40px",
          width: "50px",
          height: "50px",
          background: "var(--accent)",
          color: "#000",
          border: "none",
          borderRadius: "0",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
        }}
      >
        <ChevronRight size={24} style={{ transform: "rotate(-90deg)" }} />
      </button>

      <style jsx>{`
        .scroll-mt-32 {
          scroll-margin-top: 120px;
        }
      `}</style>
    </div>
  );
}
