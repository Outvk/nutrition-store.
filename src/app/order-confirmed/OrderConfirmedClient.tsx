"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Truck, Phone, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function OrderConfirmedClient() {
  const params = useSearchParams();
  const orderId = params.get("id") || "ORD-0001";

  const steps = [
    { icon: CheckCircle, label: "Commande confirmée", desc: "Votre commande a été reçue", done: true },
    { icon: Package, label: "Préparation", desc: "Emballage sous 24h", done: false },
    { icon: Truck, label: "Expédition", desc: "Via Noest-DZ", done: false },
    { icon: Phone, label: "Livraison", desc: "Paiement à la réception", done: false },
  ];

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "52px" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "2px solid #22c55e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle size={40} color="#22c55e" />
          </div>
          <p style={{ fontFamily: "var(--font-condensed)", fontSize: "13px", letterSpacing: "0.12em", color: "var(--accent)", fontWeight: 700, marginBottom: "10px" }}>MERCI POUR VOTRE COMMANDE</p>
          <h1 className="section-heading" style={{ fontSize: "clamp(36px, 6vw, 56px)", marginBottom: "12px" }}>
            COMMANDE <span style={{ color: "#22c55e" }}>CONFIRMÉE</span>
          </h1>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginBottom: "16px" }}>
            Notre équipe vous contactera pour confirmer les détails.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "8px", padding: "12px 20px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Numéro de commande</span>
            <span style={{ fontFamily: "var(--font-condensed)", fontSize: "18px", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.06em" }}>{orderId}</span>
          </div>
        </div>

        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "8px", padding: "28px", marginBottom: "24px" }}>
          <h3 style={{ fontFamily: "var(--font-condensed)", fontSize: "18px", fontWeight: 700, letterSpacing: "0.04em", marginBottom: "28px" }}>SUIVI DE COMMANDE</h3>
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: step.done ? "#22c55e" : "var(--bg-elevated)", border: `2px solid ${step.done ? "#22c55e" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={18} color={step.done ? "#000" : "var(--text-muted)"} />
                  </div>
                  {i < steps.length - 1 && <div style={{ width: "2px", height: "40px", background: i === 0 ? "#22c55e44" : "var(--border)", margin: "4px 0" }} />}
                </div>
                <div style={{ paddingBottom: i < steps.length - 1 ? "16px" : "0", flex: 1 }}>
                  <p style={{ fontFamily: "var(--font-condensed)", fontSize: "15px", fontWeight: 700, letterSpacing: "0.04em", color: step.done ? "#22c55e" : "var(--text-primary)", marginBottom: "2px" }}>{step.label}</p>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{step.desc}</p>
                </div>
                {step.done && <span style={{ fontSize: "12px", fontFamily: "var(--font-condensed)", fontWeight: 700, color: "#22c55e", letterSpacing: "0.06em", paddingTop: "10px" }}>✓ DONE</span>}
              </div>
            );
          })}
        </div>

        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "8px", padding: "24px", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <Truck size={20} color="var(--accent)" />
            <h4 style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "16px", letterSpacing: "0.04em" }}>LIVRAISON PAR NOEST-DZ</h4>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Expédition dans les 24h ouvrées. Délai estimé : <strong style={{ color: "var(--text-primary)" }}>2 à 5 jours</strong> selon votre wilaya.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", padding: "10px 14px", background: "rgba(232,255,0,0.06)", border: "1px solid rgba(232,255,0,0.15)", borderRadius: "6px" }}>
            <Phone size={14} color="var(--accent)" />
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Notre équipe vous appellera avant expédition.</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/products" className="btn-accent" style={{ padding: "14px 32px", borderRadius: "6px", textDecoration: "none", fontSize: "15px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
            CONTINUER LES ACHATS <ArrowRight size={16} />
          </Link>
          <Link href="/" className="btn-ghost" style={{ padding: "14px 32px", borderRadius: "6px", textDecoration: "none", fontSize: "15px", display: "inline-block" }}>
            RETOUR À L&apos;ACCUEIL
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
