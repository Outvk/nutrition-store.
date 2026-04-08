"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCart, removeFromCart, updateQuantity } from "@/lib/cart";
import { CartItem } from "@/types";
import { useEffect } from "react";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCart(getCart());
    setMounted(true);
  }, []);

  const updateQty = (index: number, qty: number) => {
    if (qty < 1) return;
    updateQuantity(index, qty);
    setCart(getCart());
  };

  const removeItem = (index: number) => {
    removeFromCart(index);
    setCart(getCart());
  };

  if (!mounted) return null;

  const subtotal = cart.reduce((sum, item) => {
    const price = item.product.sale_price || item.product.price;
    return sum + price * item.quantity;
  }, 0);
  const delivery = 500;
  const total = subtotal + delivery;

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <div style={{ maxWidth: "600px", margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
          <ShoppingBag size={64} color="var(--text-muted)" style={{ marginBottom: "24px" }} />
          <h2 className="section-heading" style={{ fontSize: "36px", marginBottom: "12px" }}>PANIER VIDE</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>Ajoutez des produits pour commencer</p>
          <Link href="/products" className="btn-accent" style={{ padding: "14px 40px", borderRadius: "0", textDecoration: "none", fontSize: "15px", display: "inline-block" }}>
            VOIR LES PRODUITS
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: "36px" }}>
          <p style={{ fontFamily: "var(--font-condensed)", fontSize: "12px", letterSpacing: "0.12em", color: "var(--accent)", fontWeight: 700, marginBottom: "6px" }}>MON PANIER</p>
          <h1 className="section-heading" style={{ fontSize: "clamp(36px, 5vw, 52px)" }}>
            PANIER <span style={{ color: "var(--accent)" }}>({cart.length})</span>
          </h1>
        </div>

        <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "32px", alignItems: "start" }}>
          {/* Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {cart.map((item, i) => {
              const price = item.product.sale_price || item.product.price;
              return (
                <div key={i} className="mobile-stack" style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", gap: "16px", alignItems: "center", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "0", padding: "16px" }}>
                  <div style={{ position: "relative", width: "80px", height: "80px", borderRadius: "0", overflow: "hidden", background: "var(--bg-elevated)" }}>
                    <Image src={item.product.images[0]} alt={item.product.name} fill style={{ objectFit: "cover" }} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "var(--font-condensed)", fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>{item.product.name}</p>
                    {item.variant && (
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                        {item.variant.flavor} {item.variant.size && `/ ${item.variant.size}`}
                      </p>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "0", overflow: "hidden" }}>
                        <button onClick={() => updateQty(i, item.quantity - 1)} style={{ width: "32px", height: "32px", background: "var(--bg-elevated)", border: "none", cursor: "pointer", color: "var(--text-primary)", fontSize: "16px" }}>−</button>
                        <span style={{ width: "40px", textAlign: "center", fontSize: "14px", fontWeight: 700, fontFamily: "var(--font-condensed)" }}>{item.quantity}</span>
                        <button onClick={() => updateQty(i, item.quantity + 1)} style={{ width: "32px", height: "32px", background: "var(--bg-elevated)", border: "none", cursor: "pointer", color: "var(--text-primary)", fontSize: "16px" }}>+</button>
                      </div>
                      <span style={{ fontFamily: "var(--font-condensed)", fontSize: "18px", fontWeight: 700, color: item.product.sale_price ? "var(--accent)" : "var(--text-primary)" }}>
                        {(price * item.quantity).toLocaleString()} DA
                      </span>
                    </div>
                  </div>
                  <button onClick={() => removeItem(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "8px", transition: "color 0.2s ease" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#ff3b3b")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0", padding: "24px", position: "sticky", top: "110px" }} className="checkout-summary-sticky">
            <h3 style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "20px", letterSpacing: "0.04em", marginBottom: "24px" }}>RÉCAPITULATIF</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--text-secondary)" }}>
                <span>Sous-total</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{subtotal.toLocaleString()} DA</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--text-secondary)" }}>
                <span>Livraison</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{delivery.toLocaleString()} DA</span>
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "24px" }}>
              <span style={{ fontFamily: "var(--font-condensed)", fontSize: "16px", letterSpacing: "0.04em" }}>TOTAL</span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "28px", color: "var(--accent)" }}>{total.toLocaleString()} DA</span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>
              * Frais de livraison finaux calculés selon votre wilaya
            </p>
            <Link href="/checkout" className="btn-accent" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "15px", borderRadius: "0", textDecoration: "none", fontSize: "15px", marginBottom: "12px" }}>
              PASSER LA COMMANDE <ArrowRight size={16} />
            </Link>
            <Link href="/products" style={{ display: "block", textAlign: "center", fontSize: "13px", color: "var(--text-muted)", textDecoration: "none" }}>
              ← Continuer les achats
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
