import { getProducts, getBrands, getCategories } from "@/lib/supabase/queries";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

export const revalidate = 300; // 5 mins cache

export default async function PacksPage() {
  const [brands, categories] = await Promise.all([
    getBrands(),
    getCategories()
  ]);

  const packsCategory = categories.find(c => c.name.toLowerCase().includes("pack"));
  
  const productsData = packsCategory 
    ? await getProducts(0, { category_id: packsCategory.id }, 100) // Get up to 100 packs
    : { products: [], total: 0 };

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
        <p style={{ fontFamily: "var(--font-condensed)", fontSize: "14px", letterSpacing: "0.25em", color: "var(--accent)", fontWeight: 700, marginBottom: "16px" }}>OFFRES EXCLUSIVES</p>
        <h1 className="section-heading" style={{ fontSize: "clamp(40px, 8vw, 84px)", color: "#fff", lineHeight: "1" }}>NOS <span style={{ color: "var(--accent)" }}>PACKS</span> ÉCO</h1>
        <p style={{ color: "var(--text-muted)", marginTop: "20px", maxWidth: "600px", fontSize: "16px", fontFamily: "var(--font-alt)" }}>
          Découvrez nos sélections optimisées pour vos objectifs. Plus de résultats, moins de dépenses.
        </p>
      </div>

      <div className="container" style={{ maxWidth: "1400px", margin: "0 auto", padding: "80px 24px" }}>
        {productsData.products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 0", border: "1px dashed var(--border)", background: "rgba(255,255,255,0.02)" }}>
            <p style={{ fontFamily: "var(--font-condensed)", fontSize: "20px", color: "var(--text-muted)", letterSpacing: "0.05em" }}>AUCUN PACK DISPONIBLE POUR LE MOMENT</p>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(4, 1fr)", 
            gap: "24px" 
          }} className="packs-grid">
            {productsData.products.map((product) => (
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
