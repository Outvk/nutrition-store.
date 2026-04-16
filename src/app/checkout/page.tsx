"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Lock, Zap, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { algeriaWilayas } from "@/lib/algeria-data";
import { getCart, clearCart } from "@/lib/cart";
import { CartItem } from "@/types";
import { useLanguage } from "@/i18n/LanguageContext";

import { STORE_CONFIG } from "@/lib/config";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";

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

const Field = ({ label, name, placeholder, type = "text", children, form, setForm, errors, setErrors }: FieldProps) => {
  const { locale } = useLanguage();
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{ 
        display: "block", 
        fontFamily: locale === 'ar' ? "var(--font-cairo)" : "var(--font-condensed)", 
        fontSize: "12px", 
        letterSpacing: "0.08em", 
        fontWeight: 700, 
        color: "var(--text-muted)", 
        marginBottom: "8px",
        textAlign: locale === 'ar' ? 'right' : 'left'
      }}>
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
          style={{ 
            width: "100%", 
            padding: "13px 16px", 
            borderRadius: "0px", 
            fontSize: "15px", 
            textAlign: locale === 'ar' ? 'right' : 'left',
            direction: (name === 'phone') ? 'ltr' : 'inherit',
            border: `1px solid ${errors[name] ? "#ff3b3b" : "var(--border)"}` 
          }}
        />
      )}
      {errors[name] && (
        <p style={{ 
          fontSize: "12px", 
          color: "#ff3b3b", 
          marginTop: "6px",
          textAlign: locale === 'ar' ? 'right' : 'left',
          fontFamily: locale === 'ar' ? "var(--font-cairo)" : "inherit"
        }}>
          {errors[name]}
        </p>
      )}
    </div>
  );
};

export default function CheckoutPage() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState({ full_name: "", phone: "", wilaya: "", commune: "", address: "", livraison_type: "domicile" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [loadingFee, setLoadingFee] = useState(false);
  const [abandonedOrderId, setAbandonedOrderId] = useState<string | null>(null);

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

  // Abandoned Cart Detection
  useEffect(() => {
    if (isSuccess || submitting || cartItems.length === 0) return;
    if (!form.full_name && !form.phone) return;

    const timer = setTimeout(async () => {
      try {
        const payload = {
          orderData: {
            full_name: form.full_name || "Client Inconnu",
            phone: form.phone || "0000000000",
            wilaya: form.wilaya || "Inconnu",
            address: `${form.livraison_type === 'domicile' ? 'Domicile' : 'Stop Desk'} - ${form.commune || ''} - ${form.address || ''}`,
            total,
            delivery_fee: calculatedFee,
          },
          items: cartItems.map(item => ({
            product_id: item.product.id,
            variant_id: item.variant?.id || null,
            quantity: item.quantity,
            unit_price: item.product.sale_price || item.product.price
          })),
          existingOrderId: abandonedOrderId
        };

        const res = await fetch("/api/orders/abandoned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const { orderId } = await res.json();
          setAbandonedOrderId(orderId);
        }
      } catch (err) {
        console.error("Failed to save abandoned cart", err);
      }
    }, 3000); // 3 second debounce

    return () => clearTimeout(timer);
  }, [form, cartItems, isSuccess, submitting, abandonedOrderId, total, calculatedFee]);


  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.full_name.trim() || form.full_name.length < 3) e.full_name = t("common.form.validation.name");
    if (!form.phone.match(/^(05|06|07)[0-9]{8}$/)) e.phone = t("common.form.validation.phone");
    if (!form.wilaya) e.wilaya = t("common.form.validation.wilaya");
    if (!form.commune) e.commune = t("common.form.validation.commune");
    if (!form.address.trim() || form.address.length < 10) e.address = t("common.form.validation.address");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (cartItems.length === 0) return setApiError(t("checkout.emptyCart"));

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
        turnstileToken: "dummy_token",
        livraison_type: form.livraison_type,
        abandonedOrderId: abandonedOrderId || undefined
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("common.error"));
      }

      const { orderId } = await res.json();
      clearCart();
      setIsSuccess(true);
      
      setTimeout(() => {
        router.push("/order-confirmed?id=" + orderId);
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("common.error");
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ 
        maxWidth: "1280px", 
        margin: "0 auto", 
        padding: "clamp(20px, 4vw, 40px) clamp(16px, 4vw, 24px)",
        fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'inherit'
      }}>
        <div style={{ marginBottom: "36px", textAlign: locale === 'ar' ? 'right' : 'left' }}>
          <p style={{ fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-condensed)', fontSize: "12px", letterSpacing: "0.12em", color: "var(--accent)", fontWeight: 700, marginBottom: "6px" }}>{locale === 'ar' ? 'إكمال العملية' : 'FINALISER'}</p>
          <h1 className="section-heading" style={{ fontSize: "clamp(28px, 5vw, 48px)", fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'inherit' }}>
            {locale === 'ar' ? 'إتمام' : 'PASSER LA'} <span style={{ color: "var(--accent)" }}>{locale === 'ar' ? 'الطلب' : 'COMMANDE'}</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "40px", alignItems: "start" }}>

            {/* Form Area */}
            <div style={{ order: locale === 'ar' ? 2 : 1 }}>
              {apiError && (
                <div style={{ 
                  padding: "12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef444444", borderRadius: "6px", color: "#ef4444", 
                  fontSize: "14px", fontWeight: 700, marginBottom: "20px", textAlign: locale === 'ar' ? 'right' : 'left' 
                }}>
                  {apiError}
                </div>
              )}
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0px", padding: "28px", marginBottom: "20px" }}>
                <h2 style={{ 
                  fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-condensed)', 
                  fontSize: "20px", fontWeight: 700, letterSpacing: "0.04em", marginBottom: "24px",
                  textAlign: locale === 'ar' ? 'right' : 'left'
                }}>
                  {locale === 'ar' ? 'معلومات التوصيل' : 'INFORMATIONS DE LIVRAISON'}
                </h2>

                <Field label={t("common.form.fullName").toUpperCase()} name="full_name" placeholder={t("common.form.fullName")} form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
                <Field label={t("common.form.phone").toUpperCase()} name="phone" placeholder={t("common.form.phone")} type="tel" form={form} setForm={setForm} errors={errors} setErrors={setErrors} />

                <Field label={t("common.form.wilaya").toUpperCase()} name="wilaya" form={form} setForm={setForm} errors={errors} setErrors={setErrors}>
                  <div style={{ position: "relative" }}>
                    <select
                      value={form.wilaya}
                      onChange={e => { setForm(f => ({ ...f, wilaya: e.target.value, commune: "" })); if (errors.wilaya) setErrors(er => { const n = { ...er }; delete n.wilaya; return n; }); }}
                      className="input-dark"
                      style={{ 
                        width: "100%", 
                        padding: locale === 'ar' ? "13px 16px 13px 40px" : "13px 40px 13px 16px", 
                        borderRadius: "0px", 
                        fontSize: "15px", 
                        appearance: "none", 
                        cursor: "pointer", 
                        textAlign: locale === 'ar' ? 'right' : 'left',
                        border: `1px solid ${errors.wilaya ? "#ff3b3b" : "var(--border)"}` 
                      }}
                    >
                      <option value="">{locale === 'ar' ? 'اختر ولايتك' : 'Sélectionner votre wilaya'}</option>
                      {algeriaWilayas.map(w => <option key={w.code} value={w.name}>{w.code} - {w.name}</option>)}
                    </select>
                    <ChevronDown size={16} style={{ position: "absolute", [locale === 'ar' ? 'left' : 'right']: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                  </div>
                  {errors.wilaya && <p style={{ fontSize: "12px", color: "#ff3b3b", marginTop: "6px", textAlign: locale === 'ar' ? 'right' : 'left' }}>{errors.wilaya}</p>}
                </Field>

                <Field label={t("common.form.commune").toUpperCase()} name="commune" form={form} setForm={setForm} errors={errors} setErrors={setErrors}>
                  <div style={{ position: "relative" }}>
                    <select
                      value={form.commune}
                      onChange={e => { setForm(f => ({ ...f, commune: e.target.value })); if (errors.commune) setErrors(er => { const n = { ...er }; delete n.commune; return n; }); }}
                      disabled={!form.wilaya}
                      className="input-dark"
                      style={{ 
                        width: "100%", 
                        padding: locale === 'ar' ? "13px 16px 13px 40px" : "13px 40px 13px 16px", 
                        borderRadius: "0px", 
                        fontSize: "15px", 
                        appearance: "none", 
                        textAlign: locale === 'ar' ? 'right' : 'left',
                        cursor: form.wilaya ? "pointer" : "not-allowed", 
                        opacity: form.wilaya ? 1 : 0.5, 
                        border: `1px solid ${errors.commune ? "#ff3b3b" : "var(--border)"}` 
                      }}
                    >
                      <option value="">{form.wilaya ? (locale === 'ar' ? 'اختر بلديتك' : 'Choisir votre commune') : (locale === 'ar' ? 'اختر الولاية أولاً' : "Sélectionnez d'abord une wilaya")}</option>
                      {selectedWilayaData?.communes.map((c, i) => (
                        <option key={`${i}-${c}`} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} style={{ position: "absolute", [locale === 'ar' ? 'left' : 'right']: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                  </div>
                  {errors.commune && <p style={{ fontSize: "12px", color: "#ff3b3b", marginTop: "6px", textAlign: locale === 'ar' ? 'right' : 'left' }}>{errors.commune}</p>}
                </Field>

                <Field label={t("common.form.address").toUpperCase()} name="address" placeholder={locale === 'ar' ? 'شارع ديدوش مراد، الجزائر' : '12 Rue Didouche Mourad, Alger Centre'} form={form} setForm={setForm} errors={errors} setErrors={setErrors}>
                  <textarea
                    value={form.address}
                    onChange={e => { setForm(f => ({ ...f, address: e.target.value })); if (errors.address) setErrors(er => { const n = { ...er }; delete n.address; return n; }); }}
                    placeholder={locale === 'ar' ? 'شارع ديدوش مراد، الجزائر' : '12 Rue Didouche Mourad, Alger Centre'}
                    rows={3}
                    className="input-dark"
                    style={{ 
                      width: "100%", padding: "13px 16px", borderRadius: "0px", fontSize: "15px", resize: "vertical", 
                      textAlign: locale === 'ar' ? 'right' : 'left',
                      border: `1px solid ${errors.address ? "#ff3b3b" : "var(--border)"}` 
                    }}
                  />
                  {errors.address && <p style={{ fontSize: "12px", color: "#ff3b3b", marginTop: "6px", textAlign: locale === 'ar' ? 'right' : 'left' }}>{errors.address}</p>}
                </Field>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ 
                    display: "block", fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-condensed)', 
                    fontSize: "12px", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "12px",
                    textAlign: locale === 'ar' ? 'right' : 'left'
                  }}>
                    {t("common.form.deliveryMode").toUpperCase()} <span style={{ color: "var(--accent)" }}>*</span>
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <label style={{ 
                      display: "flex", alignItems: "center", gap: "10px", padding: "14px", 
                      border: `1px solid ${form.livraison_type === 'domicile' ? 'var(--accent)' : 'var(--border)'}`, 
                      background: form.livraison_type === 'domicile' ? "rgba(232, 255, 0, 0.05)" : "transparent",
                      cursor: "pointer", transition: "all 0.2s ease",
                      flexDirection: locale === 'ar' ? 'row-reverse' : 'row'
                    }}>
                      <input type="radio" name="livraison_type" value="domicile" checked={form.livraison_type === 'domicile'} onChange={e => setForm(f => ({ ...f, livraison_type: e.target.value }))} style={{ accentColor: "var(--accent)" }} />
                      <span style={{ fontSize: "14px", fontWeight: 600 }}>{t("common.form.domicile").toUpperCase()}</span>
                    </label>
                    <label style={{ 
                      display: "flex", alignItems: "center", gap: "10px", padding: "14px", 
                      border: `1px solid ${form.livraison_type === 'stopdesk' ? 'var(--accent)' : 'var(--border)'}`, 
                      background: form.livraison_type === 'stopdesk' ? "rgba(232, 255, 0, 0.05)" : "transparent",
                      cursor: "pointer", transition: "all 0.2s ease",
                      flexDirection: locale === 'ar' ? 'row-reverse' : 'row'
                    }}>
                      <input type="radio" name="livraison_type" value="stopdesk" checked={form.livraison_type === 'stopdesk'} onChange={e => setForm(f => ({ ...f, livraison_type: e.target.value }))} style={{ accentColor: "var(--accent)" }} />
                      <span style={{ fontSize: "14px", fontWeight: 600 }}>{t("common.form.stopdesk").toUpperCase()}</span>
                    </label>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px", textAlign: locale === 'ar' ? 'right' : 'left' }}>
                    {locale === 'ar' ? '* نقطة استلام: استلم طردك من أقرب مكتب لوكالة التوصيل.' : '* Stop Desk : Récupérez votre colis au bureau du transporteur le plus proche.'}
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0px", padding: "28px" }}>
                <h2 style={{ 
                  fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-condensed)', 
                  fontSize: "20px", fontWeight: 700, letterSpacing: "0.04em", marginBottom: "20px",
                  textAlign: locale === 'ar' ? 'right' : 'left'
                }}>
                  {locale === 'ar' ? 'طريقة الدفع' : 'MODE DE PAIEMENT'}
                </h2>
                <div style={{ 
                  display: "flex", alignItems: "center", gap: "12px", padding: "16px", 
                  border: "2px solid var(--accent)", borderRadius: "0px", background: "rgba(232,255,0,0.05)",
                  flexDirection: locale === 'ar' ? 'row-reverse' : 'row'
                }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "11px", color: "#000", fontWeight: 700 }}>✓</span>
                  </div>
                  <div style={{ textAlign: locale === 'ar' ? 'right' : 'left' }}>
                    <p style={{ fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-condensed)', fontSize: "16px", fontWeight: 700, letterSpacing: "0.04em" }}>{locale === 'ar' ? 'الدفع عند الاستلام' : 'PAIEMENT À LA LIVRAISON'}</p>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>{locale === 'ar' ? 'تدفع نقداً عند استلام طلبيتك' : 'Vous payez en espèces à la réception de votre commande'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary Sticky Sidebar */}
            <div className="checkout-summary-sticky" style={{ position: "sticky", top: "110px", order: locale === 'ar' ? 1 : 2 }}>
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0px", padding: "24px", marginBottom: "16px" }}>
                <h3 style={{ 
                  fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-condensed)', 
                  fontWeight: 700, fontSize: "18px", letterSpacing: "0.04em", marginBottom: "20px",
                  textAlign: locale === 'ar' ? 'right' : 'left'
                }}>{t("checkout.summary").toUpperCase()}</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
                  {cartItems.length === 0 && <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: locale === 'ar' ? 'right' : 'left' }}>{t("checkout.emptyCart")}</p>}
                  {cartItems.map((item, i) => {
                    const price = item.product.sale_price || item.product.price;
                    return (
                      <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center", flexDirection: locale === 'ar' ? 'row-reverse' : 'row' }}>
                        <div style={{ position: "relative", width: "52px", height: "52px", borderRadius: "0px", overflow: "hidden", background: "var(--bg-elevated)", flexShrink: 0 }}>
                          <Image src={item.product.images[0]} alt={item.product.name} fill style={{ objectFit: "cover" }} />
                          <span style={{ 
                            position: "absolute", top: "-4px", [locale === 'ar' ? 'left' : 'right']: "-4px", 
                            background: "var(--accent)", color: "#000", width: "18px", height: "18px", 
                            borderRadius: "50%", fontSize: "10px", fontWeight: 700, display: "flex", 
                            alignItems: "center", justifyContent: "center", fontFamily: "var(--font-condensed)" 
                          }}>
                            {item.quantity}
                          </span>
                        </div>
                        <div style={{ flex: 1, textAlign: locale === 'ar' ? 'right' : 'left' }}>
                          <p style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.3 }}>{item.product.name}</p>
                          {item.variant && (
                            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                              {item.variant.flavor} {item.variant.size && `/ ${item.variant.size}`}
                            </p>
                          )}
                        </div>
                        <span style={{ fontFamily: "var(--font-condensed)", fontSize: "14px", fontWeight: 700, whiteSpace: "nowrap" }}>
                          {(price * item.quantity).toLocaleString()} {t("common.da")}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--text-secondary)", flexDirection: locale === 'ar' ? 'row-reverse' : 'row' }}>
                    <span>{t("checkout.subtotal")}</span>
                    <span style={{ color: "var(--text-primary)" }}>{subtotal.toLocaleString()} {t("common.da")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--text-secondary)", flexDirection: locale === 'ar' ? 'row-reverse' : 'row' }}>
                    <span>{t("common.deliveryFees")} {form.wilaya ? `(${form.wilaya} — ${form.livraison_type === 'domicile' ? t("common.form.domicile") : t("common.form.stopdesk")})` : ""}</span>
                    <span style={{ color: "var(--text-primary)" }}>
                      {loadingFee ? (locale === 'ar' ? 'جاري الحساب...' : 'Calcul...') : (form.wilaya ? `${calculatedFee.toLocaleString()} ${t("common.da")}` : "—")}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--border)", marginTop: "16px", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "baseline", flexDirection: locale === 'ar' ? 'row-reverse' : 'row' }}>
                  <span style={{ fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'var(--font-condensed)', fontSize: "16px", fontWeight: 700, letterSpacing: "0.04em" }}>{t("checkout.total")}</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "30px", color: "var(--accent)" }}>{total.toLocaleString()} {t("common.da")}</span>
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
                  transition: "all 0.3s ease",
                  fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'inherit'
                }}
              >
                {isSuccess ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Check size={18} />
                    {t("checkout.orderSuccessTitle")}
                  </span>
                ) : submitting ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ width: "16px", height: "16px", border: "2px solid #000", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                    {locale === 'ar' ? 'جاري المعالجة...' : 'TRAITEMENT...'}
                  </span>
                ) : (
                  <><Zap size={18} /> {t("checkout.placeOrder")}</>
                )}
              </button>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "12px", flexDirection: locale === 'ar' ? 'row-reverse' : 'row' }}>
                <Lock size={12} color="var(--text-muted)" />
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: locale === 'ar' ? 'var(--font-cairo)' : 'inherit' }}>{locale === 'ar' ? 'طلب آمن — الدفع عند الاستلام' : 'Commande sécurisée — Paiement à la livraison'}</span>
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
