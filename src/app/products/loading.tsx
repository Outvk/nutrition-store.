import ProductCardSkeleton from "@/components/ProductCardSkeleton";

export default function Loading() {
  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ height: "40px", background: "rgba(252,255,0,0.05)", width: "300px", marginBottom: "32px" }} />
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
        gap: "24px" 
      }}>
        {[...Array(8)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
