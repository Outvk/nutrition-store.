"use client";
import { Brand, Product } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/i18n/LanguageContext";

interface PacksClientProps {
  products: Product[];
}

export default function PacksClient({ products }: PacksClientProps) {
  const { t, locale } = useLanguage();

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />
      
      {/* Hero Section */}
      <div style={{ 
        height: "350px", 
        background: "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url('https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=1600&q=80')", 
        backgroundSize: "cover", 
        backgroundPosition: "center", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center", 
        textAlign: "center",
        borderBottom: "1px solid var(--border-bright)"
      }}>
        <p style={{ 
          fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-condensed)', 
          fontSize: "14px", 
          letterSpacing: "0.25em", 
          color: "var(--accent)", 
          fontWeight: 700, 
          marginBottom: "16px" 
        }}>
          {locale === 'ar' ? "عروض حصرية" : "OFFRES EXCLUSIVES"}
        </p>
        <h1 className="section-heading" style={{ 
          fontSize: "clamp(40px, 8vw, 84px)", 
          color: "#fff", 
          lineHeight: "1",
          fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'inherit'
        }}>
          {locale === 'ar' ? <>حقائبنا <span style={{ color: "var(--accent)" }}>الاقتصادية</span></> : <>NOS <span style={{ color: "var(--accent)" }}>PACKS</span> ÉCO</>}
        </h1>
        <p style={{ 
          color: "var(--text-muted)", 
          marginTop: "20px", 
          maxWidth: "600px", 
          fontSize: "16px", 
          fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-alt)' 
        }}>
          {locale === 'ar' 
            ? "اكتشف مجموعاتنا المختارة بعناية لأهدافك. نتائج أكثر بأسعار أقل." 
            : "Découvrez nos sélections optimisées pour vos objectifs. Plus de résultats, moins de dépenses."}
        </p>
      </div>

      <div className="container" style={{ maxWidth: "1400px", margin: "0 auto", padding: "80px 24px" }}>
        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 0", border: "1px dashed var(--border)", background: "rgba(255,255,255,0.02)" }}>
            <p style={{ 
              fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-condensed)', 
              fontSize: "20px", 
              color: "var(--text-muted)", 
              letterSpacing: "0.05em" 
            }}>
              {locale === 'ar' ? "لا توجد حزم متاحة حالياً" : "AUCUN PACK DISPONIBLE POUR LE MOMENT"}
            </p>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(4, 1fr)", 
            gap: "24px" 
          }} className="packs-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        )}
      </div>
      
      <Footer />

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1100px) {
          .packs-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .packs-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
        }
      `}} />
    </div>
  );
}
