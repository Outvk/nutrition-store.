"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Truck, Phone, ArrowRight, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/i18n/LanguageContext";

export default function OrderConfirmedClient() {
  const { t, locale } = useLanguage();
  const params = useSearchParams();
  const orderId = params.get("id") || "ORD-0001";

  const steps = [
    { icon: CheckCircle, label: t("checkout.tracking.confirmed"), desc: t("checkout.tracking.confirmedDesc"), done: true },
    { icon: Package, label: t("checkout.tracking.preparation"), desc: t("checkout.tracking.preparationDesc"), done: false },
    { icon: Truck, label: t("checkout.tracking.shipping"), desc: t("checkout.tracking.shippingDesc"), done: false },
    { icon: Phone, label: t("checkout.tracking.delivery"), desc: t("checkout.tracking.deliveryDesc"), done: false },
  ];

  const isAr = locale === 'ar';

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "60px 24px", direction: isAr ? 'rtl' : 'ltr' }}>
        <div style={{ textAlign: "center", marginBottom: "52px" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "2px solid #22c55e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle size={40} color="#22c55e" />
          </div>
          <p style={{ fontFamily: isAr ? "var(--font-cairo)" : "var(--font-condensed)", fontSize: "13px", letterSpacing: "0.12em", color: "var(--accent)", fontWeight: 700, marginBottom: "10px" }}>
            {isAr ? 'شكراً على طلبكم' : 'MERCI POUR VOTRE COMMANDE'}
          </p>
          <h1 className="section-heading" style={{ fontSize: "clamp(36px, 6vw, 56px)", marginBottom: "12px", fontFamily: isAr ? "var(--font-cairo)" : "inherit" }}>
            {isAr ? 'تم ' : 'COMMANDE '} <span style={{ color: "#22c55e" }}>{isAr ? 'تأكيد الطلب' : 'CONFIRMÉE'}</span>
          </h1>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginBottom: "16px", fontFamily: isAr ? "var(--font-cairo)" : "inherit" }}>
            {t("checkout.orderSuccessMsg")}
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "8px", padding: "12px 20px", flexDirection: isAr ? 'row-reverse' : 'row' }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: isAr ? "var(--font-cairo)" : "inherit" }}>{t("checkout.tracking.orderNumber")}</span>
            <span style={{ fontFamily: "var(--font-condensed)", fontSize: "18px", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.06em" }}>{orderId}</span>
          </div>
        </div>

        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "8px", padding: "28px", marginBottom: "24px" }}>
          <h3 style={{ fontFamily: isAr ? "var(--font-cairo)" : "var(--font-condensed)", fontSize: "18px", fontWeight: 700, letterSpacing: "0.04em", marginBottom: "28px", textAlign: isAr ? 'right' : 'left' }}>
            {t("checkout.tracking.title")}
          </h3>
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start", flexDirection: isAr ? 'row-reverse' : 'row' }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: step.done ? "#22c55e" : "var(--bg-elevated)", border: `2px solid ${step.done ? "#22c55e" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={18} color={step.done ? "#000" : "var(--text-muted)"} />
                  </div>
                  {i < steps.length - 1 && <div style={{ width: "2px", height: "40px", background: i === 0 ? "#22c55e44" : "var(--border)", margin: "4px 0" }} />}
                </div>
                <div style={{ paddingBottom: i < steps.length - 1 ? "16px" : "0", flex: 1, textAlign: isAr ? 'right' : 'left' }}>
                  <p style={{ fontFamily: isAr ? "var(--font-cairo)" : "var(--font-condensed)", fontSize: "15px", fontWeight: 700, letterSpacing: "0.04em", color: step.done ? "#22c55e" : "var(--text-primary)", marginBottom: "2px" }}>{step.label}</p>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: isAr ? "var(--font-cairo)" : "inherit" }}>{step.desc}</p>
                </div>
                {step.done && <span style={{ fontSize: "12px", fontFamily: isAr ? "var(--font-cairo)" : "var(--font-condensed)", fontWeight: 700, color: "#22c55e", letterSpacing: "0.06em", paddingTop: "10px" }}>{isAr ? '✓ مكتمل' : '✓ DONE'}</span>}
              </div>
            );
          })}
        </div>

        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "8px", padding: "24px", marginBottom: "32px", textAlign: isAr ? 'right' : 'left' }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", flexDirection: isAr ? 'row-reverse' : 'row' }}>
            <Truck size={20} color="var(--accent)" />
            <h4 style={{ fontFamily: isAr ? "var(--font-cairo)" : "var(--font-condensed)", fontWeight: 700, fontSize: "16px", letterSpacing: "0.04em" }}>{t("checkout.tracking.shippingInfo")}</h4>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, fontFamily: isAr ? "var(--font-cairo)" : "inherit" }}>
            {t("checkout.tracking.shippingTime")}
          </p>
          <div style={{ 
            display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", padding: "10px 14px", 
            background: "rgba(232,255,0,0.06)", border: "1px solid rgba(232,255,0,0.15)", borderRadius: "6px",
            flexDirection: isAr ? 'row-reverse' : 'row'
          }}>
            <Phone size={14} color="var(--accent)" />
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontFamily: isAr ? "var(--font-cairo)" : "inherit" }}>{t("checkout.tracking.customerSupport")}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <Link href="/products" className="btn-accent" style={{ padding: "14px 32px", borderRadius: "6px", textDecoration: "none", fontSize: "15px", display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: isAr ? "var(--font-cairo)" : "inherit", flexDirection: isAr ? 'row-reverse' : 'row' }}>
            {t("checkout.tracking.continueShopping")} {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </Link>
          <Link href="/" className="btn-ghost" style={{ padding: "14px 32px", borderRadius: "6px", textDecoration: "none", fontSize: "15px", display: "inline-block", fontFamily: isAr ? "var(--font-cairo)" : "inherit" }}>
            {t("nav.home").toUpperCase()}
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
