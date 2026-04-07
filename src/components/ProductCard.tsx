"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap, Plus, Minus } from "lucide-react";
import { Product } from "@/types";
import { addToCart } from "@/lib/cart";
import { useRouter } from "next/navigation";

interface Props {
  product: Product;
  isLight?: boolean;
  isList?: boolean;
}

export default function ProductCard({ product, isLight = false, isList = false }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    
    // Pick first variant if available, otherwise just use common product data
    const variant = product.variants?.[0] || null;
    addToCart(product, variant, quantity);
    
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleQuickOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = product.variants?.[0] || null;
    addToCart(product, variant, quantity);
    router.push("/checkout");
  };

  const changeQty = (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(q => Math.max(1, q + delta));
  };
  
  const discount = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  return (
    <div
      className="product-card-container"
      style={{ height: "100%" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`} style={{ textDecoration: "none", height: "100%", display: "block" }}>
        <div
          className="product-card"
          style={{
            background: "transparent",
            border: "none",
            borderRadius: "0px",
            overflow: "hidden",
            cursor: "pointer",
            display: "flex",
            flexDirection: isList ? "row" : "column",
            height: "100%",
            gap: "0px",
            transition: "all 0.3s ease",
            minHeight: isList ? "180px" : "auto"
          }}
        >
          {/* Image Area with Separator */}
          <div style={{ 
            position: "relative", 
            aspectRatio: isList ? "1 / 1" : "1 / 1.15", 
            width: isList ? "200px" : "100%",
            background: "var(--bg-elevated)", 
            overflow: "hidden",
            borderBottom: isList ? "none" : "1px solid var(--border)",
            borderRight: isList ? "1px solid var(--border)" : "none" 
          }}>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              style={{ 
                objectFit: "cover", 
                transition: "transform 1.2s cubic-bezier(0.2, 0.9, 0.2, 1)",
                transform: isHovered ? "scale(1.1)" : "scale(1)"
              }}
            />
            {product.is_on_sale && discount > 0 && (
              <span
                className="badge-sale"
                style={{ 
                  position: "absolute", 
                  top: "12px", 
                  left: "12px", 
                  borderRadius: "0", 
                  background: "var(--red)",
                  color: "#fff",
                  padding: "4px 8px",
                  fontSize: "10px",
                  fontWeight: 800,
                  fontFamily: "var(--font-condensed)",
                  zIndex: 2
                }}
              >
                -{discount}%
              </span>
            )}
            {/* Quick Action Overlay (Always visible on mobile) */}
            <div style={{ 
              position: "absolute", 
              inset: 0, 
              background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)", 
              opacity: (isHovered || isMobile) ? 1 : 0, 
              transition: "opacity 0.4s ease",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              zIndex: 3
            }}>
              <div style={{
                transform: (isHovered || isMobile) ? "translateY(0)" : "translateY(100%)",
                opacity: (isHovered || isMobile) ? 1 : 0,
                transition: "all 0.4s cubic-bezier(0.2, 0.9, 0.2, 1)",
                width: "100%"
              }}>
                <button
                  onClick={handleQuickOrder}
                  style={{ 
                    width: "100%",
                    padding: "14px 0",
                    background: "var(--accent)", 
                    color: "#000",
                    border: "none", 
                    cursor: "pointer", 
                    fontSize: isMobile ? "9px" : "11px",
                    fontFamily: "var(--font-condensed)",
                    fontWeight: 900,
                    letterSpacing: isMobile ? "0.02em" : "0.1em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.4)"
                  }}
                >
                  <Zap size={14} fill="#000" /> COMMANDER DIRECT
                </button>
              </div>
            </div>
          </div>

          {/* Content Area - Fixed height flex container */}
          <div style={{ 
            padding: isList ? "12px 24px" : "16px 8px", 
            display: "flex", 
            flexDirection: "column", 
            flex: 1, 
            gap: isList ? "8px" : "10px", 
            position: "relative",
            justifyContent: isList ? "center" : "flex-start"
          }}>
            <h3 style={{ 
              fontSize: "13px", 
              fontWeight: 700, 
              color: isLight ? "#111" : "var(--text-primary)", 
              lineHeight: 1.3, 
              fontFamily: "var(--font-display)",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              height: "34px" // Fixed height for 2 lines
            }}>
              {product.name}
            </h3>

            <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
              {product.sale_price ? (
                <>
                  <span style={{ fontFamily: "var(--font-condensed)", fontSize: "16px", fontWeight: 700, color: isLight ? "#000" : "var(--accent)" }}>
                    {product.sale_price.toLocaleString()} DA
                  </span>
                  <span style={{ fontSize: "12px", color: isLight ? "#999" : "var(--text-muted)", textDecoration: "line-through" }}>
                    {product.price.toLocaleString()}
                  </span>
                </>
              ) : (
                <span style={{ fontFamily: "var(--font-condensed)", fontSize: "16px", fontWeight: 700, color: isLight ? "#111" : "var(--text-primary)" }}>
                  {product.price.toLocaleString()} DA
                </span>
              )}
            </div>

            {/* 3. Rating */}
            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              {[1, 2, 3, 4, 5].map(star => (
                <svg key={star} width="10" height="10" viewBox="0 0 24 24" fill={star <= 4 ? (isLight ? "#000" : "var(--accent)") : (isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)")}>
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
              <span style={{ fontSize: "9px", color: isLight ? "#666" : "var(--text-muted)", marginLeft: "4px", fontWeight: 600 }}>4.8/5.0</span>
            </div>

            {/* 4. Quantity Button (NEW REPLACEMENT) */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              border: `1px solid ${isLight ? "#eee" : "rgba(255,255,255,1)"}`,
              borderRadius: "0px",
              padding: "4px",
              marginTop: "4px",
              background: "#fff",
              color: "#000"
            }}>
              <button 
                onClick={e => changeQty(e, -1)}
                style={{ background: "none", border: "none", color: "#000", cursor: "pointer", width: "30px", fontSize: "16px", fontWeight: "300", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Minus size={12} />
              </button>
              <span style={{ fontSize: "12px", fontWeight: 700, fontFamily: "var(--font-condensed)" }}>{quantity}</span>
              <button 
                onClick={e => changeQty(e, 1)}
                style={{ background: "none", border: "none", color: "#000", cursor: "pointer", width: "30px", fontSize: "16px", fontWeight: "300", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Plus size={12} />
              </button>
            </div>

            {/* 5. Bottom Button */}
            <button
              onClick={handleAddToCart}
              className="btn-accent"
              disabled={isAdding}
              style={{ 
                width: "100%",
                padding: "12px 0", 
                borderRadius: "0px", 
                border: "none", 
                cursor: isAdding ? "default" : "pointer", 
                fontSize: "10px",
                fontFamily: "var(--font-condensed)",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: isAdding ? "var(--accent)" : "#fff",
                color: "#111",
                transition: "all 0.3s ease",
                boxShadow: isHovered ? "0 4px 15px rgba(0,0,0,0.2)" : "none"
              }}
              onMouseEnter={e => { if (!isAdding) e.currentTarget.style.background = "#eeeeee"; }}
              onMouseLeave={e => { if (!isAdding) e.currentTarget.style.background = "#ffffff"; }}
            >
              {isAdding ? "AJOUTÉ !" : "AJOUTER AU PANIER"}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
