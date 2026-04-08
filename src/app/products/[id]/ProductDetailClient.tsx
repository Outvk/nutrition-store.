"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ShoppingCart, Zap, Shield, Truck, Package, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { algeriaWilayas } from "@/lib/algeria-data";
import { addToCart } from "@/lib/cart";

import { STORE_CONFIG } from "@/lib/config";

import { createClient as createSupabaseClient } from "@/lib/supabase/client";

// Delivery fees are now fetched dynamically from Supabase RPC get_delivery_fee

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [added, setAdded] = useState(false);

  // Form State
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [commune, setCommune] = useState("");
  const [adresse, setAdresse] = useState("");
  const [livraisonType, setLivraisonType] = useState("domicile");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [isMobile, setIsMobile] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [loadingFee, setLoadingFee] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const related = relatedProducts;
  const discount = product.sale_price ? Math.round(((product.price - product.sale_price) / product.price) * 100) : 0;
  const totalStock = (product.variants || []).reduce((acc: number, v: any) => acc + v.stock, 0);

  useEffect(() => {
    const currentWilayaName = algeriaWilayas.find(w => w.code === selectedWilaya)?.name;
    if (!currentWilayaName) {
      setDeliveryFee(0);
      return;
    }

    const fetchFee = async () => {
      setLoadingFee(true);
      try {
        const supabase = createSupabaseClient();
        const { data, error } = await supabase.rpc('get_delivery_fee', { p_wilaya_name: currentWilayaName });
        if (!error && data !== null) {
          setDeliveryFee(Number(data));
        }
      } catch (err) {
        console.error("Failed to fetch delivery fee", err);
      } finally {
        setLoadingFee(false);
      }
    };
    fetchFee();
  }, [selectedWilaya]);

  const currentWilayaName = algeriaWilayas.find(w => w.code === selectedWilaya)?.name || "";
  const calculatedFee = selectedWilaya ? (livraisonType === 'domicile' ? deliveryFee : Math.max(200, deliveryFee - 200)) : 0;
  const totalWithShipping = ((product.sale_price || product.price) * qty) + calculatedFee;

  const handleAddToCart = () => {
    if (selectedVariant) {
      addToCart(product, selectedVariant, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px" }}>
          <Link href="/" style={{ fontSize: "13px", color: "var(--text-muted)", textDecoration: "none" }}>Accueil</Link>
          <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>/</span>
          <Link href="/products" style={{ fontSize: "13px", color: "var(--text-muted)", textDecoration: "none" }}>Produits</Link>
          <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>/</span>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{product.name}</span>
        </div>

        <div className="responsive-grid-split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(30px, 6vw, 60px)", marginBottom: "80px" }}>

          {/* Images Gallery — Sticky on Scroll (Desktop Only) */}
          <div className="product-images-sticky">
            <div className="product-gallery-flex">
              {/* Big Image Viewer — First in code for better responsive order */}
              <div style={{ flex: 1, width: "100%", position: "relative", aspectRatio: "1/1", background: "#0A0A0A", borderRadius: "0", overflow: "hidden", border: "1px solid var(--border)", padding: "20px" }}>
                {(() => {
                  const galleryImages = product.images.length > 0 ? product.images : ["https://placehold.co/800x800/111111/444444?text=Pas+d'image"];
                  const activeImg = galleryImages[imgIdx % galleryImages.length] || galleryImages[0];
                  return (
                    <>
                      <Image src={activeImg} alt={product.name} fill style={{ objectFit: "contain", padding: "20px" }} />
                      {product.is_on_sale && discount > 0 && (
                        <span className="badge-sale" style={{ position: "absolute", top: "16px", left: "16px", fontSize: "13px", padding: "4px 10px" }}>-{discount}%</span>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Thumbnails Sidebar — After main image in code */}
              <div className="product-thumbnails-list">
                {(() => {
                  const galleryImages = product.images.length > 0 ? product.images : ["https://placehold.co/800x800/111111/444444?text=Pas+d'image"];
                  if (galleryImages.length <= 1 && galleryImages[0].includes("placehold.co")) return null;
                  
                  return galleryImages.map((img, i) => (
                    <button key={i} onClick={() => setImgIdx(i)}
                      style={{ position: "relative", width: "80px", minWidth: "60px", aspectRatio: "1/1", borderRadius: "0", overflow: "hidden", border: `2px solid ${i === imgIdx ? "var(--accent)" : "var(--border)"}`, cursor: "pointer", background: "#0A0A0A", transition: "all 0.2s ease" }}
                    >
                      <Image src={img} alt="" fill style={{ objectFit: "cover" }} />
                    </button>
                  ));
                })()}
              </div>
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "var(--font-condensed)", fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, letterSpacing: "0.02em", lineHeight: 1.2, marginBottom: "12px" }}>
              {product.name}
            </h1>

            {/* Info Line */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              {product.brand?.name && (
                <div style={{ display: "flex", gap: "4px", fontSize: "13px" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Marque:</span>
                  <span style={{ color: "#fff", fontWeight: 700 }}>{product.brand.name}</span>
                </div>
              )}
              <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--border-bright)" }} />
              {product.category?.name && (
                <div style={{ display: "flex", gap: "4px", fontSize: "13px" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Catégorie:</span>
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}>{product.category.name}</span>
                </div>
              )}
              <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--border-bright)" }} />
              {totalStock > 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#22c55e" }}>DISPONIBLE</span>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444" }} />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#ef4444" }}>ÉPUISÉ</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "20px" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "40px", color: product.sale_price ? "var(--accent)" : "var(--text-primary)" }}>
                {(product.sale_price || product.price).toLocaleString()} DA
              </span>
              {product.sale_price && (
                <span style={{ fontSize: "18px", color: "var(--text-muted)", textDecoration: "line-through" }}>
                  {product.price.toLocaleString()} DA
                </span>
              )}
            </div>

            {/* Clean Interactive Tabs */}
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid var(--border)", marginBottom: "16px" }}>
                {[
                  { id: "description", label: "DESCRIPTION" },
                  { id: "bienfaits", label: "BIENFAITS" },
                  { id: "utilisation", label: "UTILISATION" },
                  { id: "ingredients", label: "INGRÉDIENTS" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: "12px 0", border: "none", background: "none", cursor: "pointer",
                      fontFamily: "var(--font-condensed)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em",
                      color: activeTab === tab.id ? "var(--accent)" : "var(--text-muted)",
                      borderBottom: `2px solid ${activeTab === tab.id ? "var(--accent)" : "transparent"}`,
                      transition: "all 0.2s ease",
                      marginBottom: "-1px"
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              
              <div style={{ minHeight: "100px" }}>
                {activeTab === "description" && (
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                    {product.description || "Aucune description disponible."}
                  </p>
                )}
                {activeTab === "bienfaits" && (
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                    {product.bienfaits || "Information non renseignée."}
                  </p>
                )}
                {activeTab === "utilisation" && (
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                    {product.utilisation || "Information non renseignée."}
                  </p>
                )}
                {activeTab === "ingredients" && (
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                    {product.ingredients || "Liste des ingrédients non renseignée."}
                  </p>
                )}
              </div>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <p style={{ fontFamily: "var(--font-condensed)", fontSize: "12px", letterSpacing: "0.1em", color: "var(--text-muted)", fontWeight: 600, marginBottom: "12px" }}>
                  VARIANTE — {selectedVariant ? `${selectedVariant.flavor} / ${selectedVariant.size}` : ""}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {product.variants.map(v => (
                    <button key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      style={{
                        padding: "8px 14px", borderRadius: "0", cursor: v.stock === 0 ? "not-allowed" : "pointer",
                        border: `1px solid ${selectedVariant?.id === v.id ? "var(--accent)" : "var(--border)"}`,
                        background: selectedVariant?.id === v.id ? "rgba(232,255,0,0.1)" : "var(--bg-card)",
                        color: v.stock === 0 ? "var(--text-muted)" : selectedVariant?.id === v.id ? "var(--accent)" : "var(--text-primary)",
                        fontFamily: "var(--font-condensed)", fontSize: "13px", letterSpacing: "0.04em",
                        opacity: v.stock === 0 ? 0.5 : 1, transition: "all 0.2s ease",
                      }}
                    >
                      {v.flavor} / {v.size}
                      {v.stock === 0 && <span style={{ marginLeft: "4px", fontSize: "10px" }}>(Épuisé)</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock indicator */}
            {selectedVariant && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "0", background: selectedVariant.stock > 5 ? "#22c55e" : selectedVariant.stock > 0 ? "#f59e0b" : "#ef4444" }} />
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  {selectedVariant.stock > 5 ? "En stock" : selectedVariant.stock > 0 ? `Plus que ${selectedVariant.stock} en stock` : "Épuisé"}
                </span>
              </div>
            )}

            {/* Qty + Add to cart */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "0", overflow: "hidden", opacity: (selectedVariant && selectedVariant.stock > 0) ? 1 : 0.5, pointerEvents: (selectedVariant && selectedVariant.stock > 0) ? "auto" : "none" }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{ width: "40px", height: "48px", background: "var(--bg-card)", border: "none", cursor: "pointer", color: "var(--text-primary)", fontSize: "18px", fontWeight: 300 }}>−</button>
                <span style={{ width: "48px", textAlign: "center", fontFamily: "var(--font-condensed)", fontSize: "16px", fontWeight: 700 }}>{qty}</span>
                <button onClick={() => setQty(q => (selectedVariant && q < selectedVariant.stock) ? q + 1 : q)}
                  style={{ width: "40px", height: "48px", background: "var(--bg-card)", border: "none", cursor: "pointer", color: "var(--text-primary)", fontSize: "18px", fontWeight: 300 }}>+</button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={added || !selectedVariant || selectedVariant.stock === 0}
                className="btn-accent"
                style={{ 
                  flex: 1, padding: "14px 24px", borderRadius: "0", border: "none", 
                  cursor: (added || !selectedVariant || selectedVariant.stock === 0) ? "not-allowed" : "pointer", 
                  fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  opacity: (added || !selectedVariant || selectedVariant.stock === 0) ? 0.6 : 1
                }}
              >
                <ShoppingCart size={18} />
                {selectedVariant && selectedVariant.stock === 0 ? "ÉPUISÉ" : added ? "AJOUTÉ ✓" : "AJOUTER AU PANIER"}
              </button>
            </div>

            <Link href={selectedVariant && selectedVariant.stock > 0 ? "/checkout" : "#"}
              style={{ 
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", 
                padding: "14px 24px", borderRadius: "0", background: "transparent", 
                border: "1px solid var(--border-bright)", textDecoration: "none", 
                color: "var(--text-primary)", fontFamily: "var(--font-condensed)", 
                fontWeight: 700, fontSize: "15px", letterSpacing: "0.06em", 
                marginBottom: "28px", transition: "all 0.2s ease",
                opacity: (selectedVariant && selectedVariant.stock > 0) ? 1 : 0.5,
                pointerEvents: (selectedVariant && selectedVariant.stock > 0) ? "auto" : "none"
              }}
              onMouseEnter={e => { if (selectedVariant && selectedVariant.stock > 0) { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; } }}
              onMouseLeave={e => { if (selectedVariant && selectedVariant.stock > 0) { e.currentTarget.style.borderColor = "var(--border-bright)"; e.currentTarget.style.color = "var(--text-primary)"; } }}
            >
              <Zap size={16} /> COMMANDER MAINTENANT
            </Link>

            {/* Guarantees */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "20px", background: "var(--bg-secondary)", borderRadius: "0", border: "1px solid var(--border)" }}>
              {[
                { icon: Truck, text: "Livraison partout en Algérie — 2 à 5 jours" },
                { icon: Shield, text: "Produit 100% authentique et garanti" },
                { icon: Zap, text: "Paiement à la livraison disponible" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Icon size={16} color="var(--accent)" />
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{text}</span>
                </div>
              ))}
            </div>

            </div>
          </div>

        {/* Achat Rapide & Infos */}
        <div className="responsive-grid-split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(30px, 6vw, 60px)", marginBottom: "80px", paddingTop: "60px", borderTop: "1px solid var(--border)" }}>
          {/* Achat Rapide Form */}
          <div style={{ background: "var(--bg-secondary)", borderRadius: "0", padding: "32px", border: "1px solid var(--border)", position: "relative" }}>
            <h2 style={{ fontFamily: "var(--font-condensed)", fontSize: "24px", fontWeight: 700, letterSpacing: "0.04em", marginBottom: "24px", color: "#fff" }}>ACHAT RAPIDE</h2>
            
            {!selectedVariant || selectedVariant.stock === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", background: "rgba(239, 68, 68, 0.05)", border: "1px dashed #ef4444", borderRadius: "0" }}>
                 <p style={{ color: "#ef4444", fontWeight: 700, fontFamily: "var(--font-condensed)", letterSpacing: "0.05em" }}>DÉSOLÉ, CETTE VARIANTE EST ÉPUISÉE</p>
                 <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "8px" }}>Veuillez choisir une autre variante ou revenir plus tard.</p>
              </div>
            ) : orderSuccess ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "0", background: "rgba(34, 197, 94, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <Shield size={32} color="#22c55e" />
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "24px", color: "#22c55e", marginBottom: "12px" }}>COMMANDE RÉUSSIE !</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "24px" }}>
                  Merci pour votre confiance. Notre équipe vous contactera très prochainement pour confirmer la livraison.
                </p>
                <button 
                  onClick={() => { setOrderSuccess(false); setNom(""); setPrenom(""); setPhone(""); setAdresse(""); }}
                  className="btn-ghost" 
                  style={{ padding: "12px 24px", borderRadius: "0", cursor: "pointer", fontFamily: "var(--font-condensed)", fontWeight: 700 }}
                >
                  NOUVELLE COMMANDE
                </button>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                setOrderError("");
                
                try {
                  if (!selectedVariant) throw new Error("Veuillez sélectionner une variante.");
                  
                  const unitPrice = product.sale_price || product.price;
                  
                  const payload = {
                    full_name: `${nom} ${prenom}`.trim(),
                    phone,
                    wilaya: currentWilayaName,
                    address: `${livraisonType === 'domicile' ? 'Domicile' : 'Stop Desk'} - ${commune} - ${adresse}`,
                    total: totalWithShipping,
                    delivery_fee: calculatedFee,
                    items: [{
                      product_id: product.id,
                      variant_id: selectedVariant.id,
                      quantity: qty,
                      unit_price: unitPrice
                    }],
                    turnstileToken: "dummy_token" // Replace with real Turnstile token integration if enabled
                  };

                  const res = await fetch("/api/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                  });

                  if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Erreur lors de la commande.");
                  }

                  setOrderSuccess(true);
                } catch (err: any) {
                  setOrderError(err.message);
                } finally {
                  setIsSubmitting(false);
                }
              }} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {orderError && (
                  <div style={{ padding: "12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef444444", borderRadius: "6px", color: "#ef4444", fontSize: "13px", fontWeight: 700 }}>
                    {orderError}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "16px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Nom</label>
                    <input required type="text" value={nom} onChange={e => setNom(e.target.value)} className="input-dark" style={{ width: "100%", padding: "12px 16px", borderRadius: "0", border: "1px solid var(--border)" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Prénom</label>
                    <input required type="text" value={prenom} onChange={e => setPrenom(e.target.value)} className="input-dark" style={{ width: "100%", padding: "12px 16px", borderRadius: "0", border: "1px solid var(--border)" }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Téléphone (ex: 0555123456)</label>
                  <input required pattern="^(05|06|07)[0-9]{8}$" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-dark" style={{ width: "100%", padding: "12px 16px", borderRadius: "0", border: "1px solid var(--border)" }} />
                </div>

                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "16px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Wilaya</label>
                    <select
                      required
                      value={selectedWilaya}
                      onChange={e => setSelectedWilaya(e.target.value)}
                      className="input-dark"
                      style={{ width: "100%", padding: "12px 16px", borderRadius: "0", border: "1px solid var(--border)" }}
                    >
                      <option value="">Sélectionner</option>
                      {algeriaWilayas.map(w => (
                        <option key={w.code} value={w.code}>{w.code.padStart(2, "0")} - {w.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Commune</label>
                    <select
                      required
                      value={commune}
                      onChange={e => setCommune(e.target.value)}
                      className="input-dark"
                      disabled={!selectedWilaya}
                      style={{ width: "100%", padding: "12px 16px", borderRadius: "0", border: "1px solid var(--border)", opacity: selectedWilaya ? 1 : 0.5 }}
                    >
                      <option value="">{selectedWilaya ? "Choisir" : "Attente..."}</option>
                      {selectedWilaya && algeriaWilayas.find(w => w.code === selectedWilaya)?.communes.map((c, i) => (
                        <option key={`${i}-${c}`} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Adresse complète</label>
                  <input required minLength={5} type="text" value={adresse} onChange={e => setAdresse(e.target.value)} className="input-dark" style={{ width: "100%", padding: "12px 16px", borderRadius: "0", border: "1px solid var(--border)" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginTop: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", border: `1px solid ${livraisonType === 'domicile' ? 'var(--accent)' : 'var(--border)'}`, borderRadius: "0", cursor: "pointer", background: livraisonType === 'domicile' ? "rgba(232, 255, 0, 0.05)" : "transparent" }}>
                    <input type="radio" value="domicile" checked={livraisonType === 'domicile'} onChange={e => setLivraisonType(e.target.value)} style={{ accentColor: "var(--accent)" }} />
                    <span style={{ fontSize: "14px", color: "var(--text-primary)" }}>Livraison à domicile</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", border: `1px solid ${livraisonType === 'stopdesk' ? 'var(--accent)' : 'var(--border)'}`, borderRadius: "0", cursor: "pointer", background: livraisonType === 'stopdesk' ? "rgba(232, 255, 0, 0.05)" : "transparent" }}>
                    <input type="radio" value="stopdesk" checked={livraisonType === 'stopdesk'} onChange={e => setLivraisonType(e.target.value)} style={{ accentColor: "var(--accent)" }} />
                    <span style={{ fontSize: "14px", color: "var(--text-primary)" }}>Stop Desk</span>
                  </label>
                </div>

                <div style={{ padding: "16px", background: "var(--bg-card)", borderRadius: "0", marginTop: "8px", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Total produit:</span>
                    <span style={{ fontSize: "14px", fontWeight: 700 }}>{((product.sale_price || product.price) * qty).toLocaleString()} DA</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Frais de livraison:</span>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent)" }}>
                      {loadingFee ? "Calcul..." : (selectedWilaya ? `${calculatedFee.toLocaleString()} DA` : "Choisir wilaya")}
                    </span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || !selectedVariant}
                  style={{ 
                    width: "100%", padding: "16px", background: "var(--accent)", color: "#000", border: "none", 
                    borderRadius: "0", fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "16px", 
                    letterSpacing: "0.06em", cursor: isSubmitting || !selectedVariant ? "not-allowed" : "pointer", 
                    marginTop: "8px", transition: "all 0.2s ease",
                    opacity: isSubmitting || !selectedVariant ? 0.7 : 1
                  }}>
                  {isSubmitting ? "TRAITEMENT..." : (selectedVariant ? "ACHAT DIRECT" : "VARIANTE REQUISE")}
                </button>
              </form>
            )}
          </div>
          
          {/* Livraison & Infos */}
          <div>
            <h2 style={{ fontFamily: "var(--font-condensed)", fontSize: "24px", fontWeight: 700, letterSpacing: "0.04em", marginBottom: "24px", color: "#fff" }}>LIVRAISON & INFOS</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}><Truck size={18} color="var(--accent)" /> Délai de livraison</h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>Livraison sous 24h à 72h selon votre wilaya. Alger et wilayas limitrophes : 24h. Autres wilayas : 48h à 72h.</p>
              </div>

              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}><Package size={18} color="var(--accent)" /> Stop Desk</h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>Retrait en bureau Noest Express disponible dans 58 wilayas. Tarif réduit par rapport à la livraison à domicile.</p>
              </div>

              <div style={{ padding: "16px", background: "var(--bg-secondary)", borderRadius: "0", border: "1px solid var(--border)", display: "inline-block", paddingRight: "40px" }}>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Livraison assurée par</p>
                <div style={{ fontSize: "20px", fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>NOEST EXPRESS</div>
              </div>

              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}><Shield size={18} color="var(--accent)" /> Paiement à la livraison</h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>Vous payez uniquement à la réception de votre commande. Aucun paiement en ligne requis.</p>
              </div>

              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}><Zap size={18} color="var(--accent)" /> Retour & échange</h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>Produit endommagé ou erreur de commande ? Contactez-nous sous 48h après réception.</p>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "28px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><MessageCircle size={18} color="var(--accent)" /> Support client</h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px" }}>Disponible 7j/7 via WhatsApp :</p>
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                  <a href="https://wa.me/213541368216" style={{ fontSize: "16px", fontWeight: 700, color: "var(--accent)", textDecoration: "none" }}>+213 541 36 82 16</a>
                  <a href="https://wa.me/213791765369" style={{ fontSize: "16px", fontWeight: 700, color: "var(--accent)", textDecoration: "none" }}>+213 791 76 53 69</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "60px", marginBottom: "32px" }}>
              <p style={{ fontFamily: "var(--font-condensed)", fontSize: "12px", letterSpacing: "0.12em", color: "var(--accent)", fontWeight: 700, marginBottom: "6px" }}>VOUS AIMEREZ AUSSI</p>
              <h2 className="section-heading" style={{ fontSize: "32px" }}>
                {product.category?.name.toLowerCase().includes("pack") ? "DÉCOUVREZ D'AUTRES PACKS" : "PRODUITS SIMILAIRES"}
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
