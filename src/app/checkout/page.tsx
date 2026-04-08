"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Lock, Zap, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { algeriaWilayas } from "@/lib/algeria-data";
import { getCart, clearCart } from "@/lib/cart";
import { CartItem } from "@/types";
import { useEffect } from "react";

import { STORE_CONFIG } from "@/lib/config";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";

// Delivery fees are now fetched dynamically from Supabase RPC get_delivery_fee

interface FieldProps {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  children?: React.ReactNode;
  form: Record<string, string>;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const Field = ({ label, name, placeholder, type = "text", children, form, setForm, errors, setErrors }: FieldProps) => (
  <div style={{ marginBottom: "20px" }}>
    <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "12px", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>
      {label} <span style={{ color: "var(--accent)" }}>*</span>
    </label>
    {children || (
      <input
        type={type}
        value={form[name as keyof typeof form] || ""}
        onChange={e => { 
          setForm((f: any) => ({ ...f, [name]: e.target.value })); 
          if (errors[name]) setErrors(er => { const n = { ...er }; delete n[name]; return n; }); 
        }}
        placeholder={placeholder}
        className="input-dark"
        style={{ width: "100%", padding: "13px 16px", borderRadius: "0px", fontSize: "15px", border: `1px solid ${errors[name] ? "#ff3b3b" : "var(--border)"}` }}
      />
    )}
    {errors[name] && <p style={{ fontSize: "12px", color: "#ff3b3b", marginTop: "6px" }}>{errors[name]}</p>}
  </div>
);

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState({ full_name: "", phone: "", wilaya: "", commune: "", address: "", livraison_type: "domicile" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [loadingFee, setLoadingFee] = useState(false);

  useEffect(() => {
    setCartItems(getCart());
  }, []);

  useEffect(() => {
    if (!form.wilaya) {
      setDeliveryFee(0);
      return;
    }

    const fetchFee = async () => {
      setLoadingFee(true);
      try {
        const supabase = createSupabaseClient();
        const { data, error } = await supabase.rpc('get_delivery_fee', { p_wilaya_name: form.wilaya });
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
  }, [form.wilaya]);

  const selectedWilayaData = algeriaWilayas.find(w => w.name === form.wilaya);

  const subtotal = cartItems.reduce((s, i) => s + (i.product.sale_price || i.product.price) * i.quantity, 0);
  const calculatedFee = form.wilaya 
    ? (form.livraison_type === 'domicile' ? deliveryFee : Math.max(200, deliveryFee - 200)) 
    : 0;
  const total = subtotal + calculatedFee;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.full_name.trim() || form.full_name.length < 3) e.full_name = "Nom complet requis (min 3 caractères)";
    if (!form.phone.match(/^(05|06|07)[0-9]{8}$/)) e.phone = "Numéro algérien invalide (ex: 0555123456)";
    if (!form.wilaya) e.wilaya = "Sélectionnez votre wilaya";
    if (!form.commune) e.commune = "Sélectionnez votre commune";
    if (!form.address.trim() || form.address.length < 10) e.address = "Adresse complète requise (min 10 caractères)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (cartItems.length === 0) return setApiError("Votre panier est vide");

    setSubmitting(true);
    setApiError("");
    
    try {
      const payload = {
        full_name: form.full_name.trim(),
        phone: form.phone,
        wilaya: form.wilaya,
        address: `${form.livraison_type === 'domicile' ? 'Domicile' : 'Stop Desk'} - ${form.commune} - ${form.address}`,
        total,
        delivery_fee: calculatedFee,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          variant_id: item.variant?.id || null,
          quantity: item.quantity,
          unit_price: item.product.sale_price || item.product.price
        })),
        turnstileToken: "dummy_token"
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la commande");
      }

      const { orderId } = await res.json();
      clearCart();
      setIsSuccess(true);
      
      // Short delay for the user to see the success state
      setTimeout(() => {
        router.push("/order-confirmed?id=" + orderId);
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue";
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "clamp(20px, 4vw, 40px) clamp(16px, 4vw, 24px)" }}>
        <div style={{ marginBottom: "36px" }}>
          <p style={{ fontFamily: "var(--font-condensed)", fontSize: "12px", letterSpacing: "0.12em", color: "var(--accent)", fontWeight: 700, marginBottom: "6px" }}>FINALISER</p>
          <h1 className="section-heading" style={{ fontSize: "clamp(28px, 5vw, 48px)" }}>PASSER LA <span style={{ color: "var(--accent)" }}>COMMANDE</span></h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "40px", alignItems: "start" }}>

            {/* Form */}
            <div>
              {apiError && (
                <div style={{ padding: "12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef444444", borderRadius: "6px", color: "#ef4444", fontSize: "14px", fontWeight: 700, marginBottom: "20px" }}>
                  {apiError}
                </div>
              )}
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0px", padding: "28px", marginBottom: "20px" }}>
                <h2 style={{ fontFamily: "var(--font-condensed)", fontSize: "20px", fontWeight: 700, letterSpacing: "0.04em", marginBottom: "24px" }}>
                  INFORMATIONS DE LIVRAISON
                </h2>

                <Field label="NOM COMPLET" name="full_name" placeholder="Ahmed Benali" form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
                <Field label="NUMÉRO DE TÉLÉPHONE" name="phone" placeholder="0555 123 456" type="tel" form={form} setForm={setForm} errors={errors} setErrors={setErrors} />

                <Field label="WILAYA" name="wilaya" form={form} setForm={setForm} errors={errors} setErrors={setErrors}>
                  <div style={{ position: "relative" }}>
                    <select
                      value={form.wilaya}
                      onChange={e => { setForm(f => ({ ...f, wilaya: e.target.value, commune: "" })); if (errors.wilaya) setErrors(er => { const n = { ...er }; delete n.wilaya; return n; }); }}
                      className="input-dark"
                      style={{ width: "100%", padding: "13px 40px 13px 16px", borderRadius: "0px", fontSize: "15px", appearance: "none", cursor: "pointer", border: `1px solid ${errors.wilaya ? "#ff3b3b" : "var(--border)"}` }}
                    >
                      <option value="">Sélectionner votre wilaya</option>
                      {algeriaWilayas.map(w => <option key={w.code} value={w.name}>{w.code} - {w.name}</option>)}
                    </select>
                    <ChevronDown size={16} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                  </div>
                  {errors.wilaya && <p style={{ fontSize: "12px", color: "#ff3b3b", marginTop: "6px" }}>{errors.wilaya}</p>}
                </Field>

                <Field label="COMMUNE (BALADIE)" name="commune" form={form} setForm={setForm} errors={errors} setErrors={setErrors}>
                  <div style={{ position: "relative" }}>
                    <select
                      value={form.commune}
                      onChange={e => { setForm(f => ({ ...f, commune: e.target.value })); if (errors.commune) setErrors(er => { const n = { ...er }; delete n.commune; return n; }); }}
                      disabled={!form.wilaya}
                      className="input-dark"
                      style={{ width: "100%", padding: "13px 40px 13px 16px", borderRadius: "0px", fontSize: "15px", appearance: "none", cursor: form.wilaya ? "pointer" : "not-allowed", opacity: form.wilaya ? 1 : 0.5, border: `1px solid ${errors.commune ? "#ff3b3b" : "var(--border)"}` }}
                    >
                      <option value="">{form.wilaya ? "Choisir votre commune" : "Sélectionnez d'abord une wilaya"}</option>
                      {selectedWilayaData?.communes.map((c, i) => (
                        <option key={`${i}-${c}`} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                  </div>
                  {errors.commune && <p style={{ fontSize: "12px", color: "#ff3b3b", marginTop: "6px" }}>{errors.commune}</p>}
                </Field>

                <Field label="ADRESSE COMPLÈTE" name="address" placeholder="12 Rue Didouche Mourad, Alger Centre" form={form} setForm={setForm} errors={errors} setErrors={setErrors}>
                  <textarea
                    value={form.address}
                    onChange={e => { setForm(f => ({ ...f, address: e.target.value })); if (errors.address) setErrors(er => { const n = { ...er }; delete n.address; return n; }); }}
                    placeholder="12 Rue Didouche Mourad, Alger Centre"
                    rows={3}
                    className="input-dark"
                    style={{ width: "100%", padding: "13px 16px", borderRadius: "0px", fontSize: "15px", resize: "vertical", border: `1px solid ${errors.address ? "#ff3b3b" : "var(--border)"}` }}
                  />
                  {errors.address && <p style={{ fontSize: "12px", color: "#ff3b3b", marginTop: "6px" }}>{errors.address}</p>}
                </Field>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "12px", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "12px" }}>
                    MODE DE LIVRAISON <span style={{ color: "var(--accent)" }}>*</span>
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <label style={{ 
                      display: "flex", alignItems: "center", gap: "10px", padding: "14px", 
                      border: `1px solid ${form.livraison_type === 'domicile' ? 'var(--accent)' : 'var(--border)'}`, 
                      background: form.livraison_type === 'domicile' ? "rgba(232, 255, 0, 0.05)" : "transparent",
                      cursor: "pointer", transition: "all 0.2s ease" 
                    }}>
                      <input 
                        type="radio" 
                        name="livraison_type" 
                        value="domicile" 
                        checked={form.livraison_type === 'domicile'} 
                        onChange={e => setForm(f => ({ ...f, livraison_type: e.target.value }))}
                        style={{ accentColor: "var(--accent)" }}
                      />
                      <span style={{ fontSize: "14px", fontWeight: 600 }}>À DOMICILE</span>
                    </label>
                    <label style={{ 
                      display: "flex", alignItems: "center", gap: "10px", padding: "14px", 
                      border: `1px solid ${form.livraison_type === 'stopdesk' ? 'var(--accent)' : 'var(--border)'}`, 
                      background: form.livraison_type === 'stopdesk' ? "rgba(232, 255, 0, 0.05)" : "transparent",
                      cursor: "pointer", transition: "all 0.2s ease" 
                    }}>
                      <input 
                        type="radio" 
                        name="livraison_type" 
                        value="stopdesk" 
                        checked={form.livraison_type === 'stopdesk'} 
                        onChange={e => setForm(f => ({ ...f, livraison_type: e.target.value }))}
                        style={{ accentColor: "var(--accent)" }}
                      />
                      <span style={{ fontSize: "14px", fontWeight: 600 }}>STOP DESK</span>
                    </label>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>
                    * Stop Desk : Récupérez votre colis au bureau du transporteur le plus proche.
                  </p>
                </div>
              </div>

              {/* Payment method */}
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0px", padding: "28px" }}>
                <h2 style={{ fontFamily: "var(--font-condensed)", fontSize: "20px", fontWeight: 700, letterSpacing: "0.04em", marginBottom: "20px" }}>
                  MODE DE PAIEMENT
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", border: "2px solid var(--accent)", borderRadius: "0px", background: "rgba(232,255,0,0.05)" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "11px", color: "#000", fontWeight: 700 }}>✓</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: "var(--font-condensed)", fontSize: "16px", fontWeight: 700, letterSpacing: "0.04em" }}>PAIEMENT À LA LIVRAISON</p>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>Vous payez en espèces à la réception de votre commande</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="checkout-summary-sticky" style={{ position: "sticky", top: "110px" }}>
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0px", padding: "24px", marginBottom: "16px" }}>
                <h3 style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "18px", letterSpacing: "0.04em", marginBottom: "20px" }}>VOTRE COMMANDE</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
                  {cartItems.length === 0 && <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Panier vide</p>}
                  {cartItems.map((item, i) => {
                    const price = item.product.sale_price || item.product.price;
                    return (
                      <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <div style={{ position: "relative", width: "52px", height: "52px", borderRadius: "0px", overflow: "hidden", background: "var(--bg-elevated)", flexShrink: 0 }}>
                          <Image src={item.product.images[0]} alt={item.product.name} fill style={{ objectFit: "cover" }} />
                          <span style={{ position: "absolute", top: "-4px", right: "-4px", background: "var(--accent)", color: "#000", width: "18px", height: "18px", borderRadius: "50%", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-condensed)" }}>
                            {item.quantity}
                          </span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.3 }}>{item.product.name}</p>
                          {item.variant && (
                            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                              {item.variant.flavor} {item.variant.size && `/ ${item.variant.size}`}
                            </p>
                          )}
                        </div>
                        <span style={{ fontFamily: "var(--font-condensed)", fontSize: "14px", fontWeight: 700, whiteSpace: "nowrap" }}>
                          {(price * item.quantity).toLocaleString()} DA
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--text-secondary)" }}>
                    <span>Sous-total</span>
                    <span style={{ color: "var(--text-primary)" }}>{subtotal.toLocaleString()} DA</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--text-secondary)" }}>
                    <span>Livraison {form.wilaya ? `(${form.wilaya} — ${form.livraison_type === 'domicile' ? 'Domicile' : 'Stop Desk'})` : ""}</span>
                    <span style={{ color: "var(--text-primary)" }}>
                      {loadingFee ? "Calcul..." : (form.wilaya ? `${calculatedFee.toLocaleString()} DA` : "—")}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--border)", marginTop: "16px", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: "var(--font-condensed)", fontSize: "16px", fontWeight: 700, letterSpacing: "0.04em" }}>TOTAL</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "30px", color: "var(--accent)" }}>{total.toLocaleString()} DA</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || isSuccess || cartItems.length === 0}
                className="btn-accent"
                style={{ 
                  width: "100%", padding: "16px", borderRadius: "0px", border: "none", 
                  cursor: (submitting || isSuccess || cartItems.length === 0) ? "not-allowed" : "pointer", 
                  fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", 
                  opacity: (submitting || cartItems.length === 0) ? 0.7 : 1,
                  background: isSuccess ? "#22c55e" : "var(--accent)",
                  color: isSuccess ? "#fff" : "#000",
                  transition: "all 0.3s ease"
                }}
              >
                {isSuccess ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Check size={18} />
                    COMMANDE RÉUSSIE !
                  </span>
                ) : submitting ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ width: "16px", height: "16px", border: "2px solid #000", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                    TRAITEMENT...
                  </span>
                ) : (
                  <><Zap size={18} /> CONFIRMER LA COMMANDE</>
                )}
              </button>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "12px" }}>
                <Lock size={12} color="var(--text-muted)" />
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Commande sécurisée — Paiement à la livraison</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Footer />
    </>
  );
}
