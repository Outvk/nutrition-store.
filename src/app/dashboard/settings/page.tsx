"use client";
import { useState } from "react";
import { Save, Store, Truck, Phone, Globe } from "lucide-react";
import { WILAYAS } from "@/types";

const DEFAULT_FEES: Record<string, string> = { "Alger": "400", "Oran": "500", "Constantine": "500", "Annaba": "600", "Blida": "400", "Sétif": "550" };

export default function SettingsPage() {
  const [store, setStore] = useState({ name: "RiverNutrition", phone: "0555 000 000", instagram: "@rivernutrition", description: "Suppléments sportifs authentiques livrés partout en Algérie." });
  const [fees, setFees] = useState<Record<string, string>>(DEFAULT_FEES);
  const [defaultFee, setDefaultFee] = useState("700");
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const Section = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden", marginBottom: "20px" }}>
      <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "10px" }}>
        <Icon size={16} color="var(--accent)" />
        <h3 style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "16px", letterSpacing: "0.06em" }}>{title}</h3>
      </div>
      <div style={{ padding: "22px" }}>{children}</div>
    </div>
  );

  const Field = ({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="input-dark" style={{ width: "100%", padding: "11px 14px", borderRadius: "6px", fontSize: "14px", border: "1px solid var(--border)" }}
      />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <p style={{ fontFamily: "var(--font-condensed)", fontSize: "12px", letterSpacing: "0.12em", color: "var(--accent)", fontWeight: 700, marginBottom: "6px" }}>CONFIGURATION</p>
        <h1 className="section-heading" style={{ fontSize: "36px" }}>PARAMÈTRES</h1>
      </div>

      <Section title="INFORMATIONS DE LA BOUTIQUE" icon={Store}>
        <Field label="NOM DE LA BOUTIQUE" value={store.name} onChange={v => setStore(s => ({ ...s, name: v }))} placeholder="RiverNutrition" />
        <Field label="TÉLÉPHONE" value={store.phone} onChange={v => setStore(s => ({ ...s, phone: v }))} placeholder="0555 000 000" />
        <Field label="INSTAGRAM" value={store.instagram} onChange={v => setStore(s => ({ ...s, instagram: v }))} placeholder="@rivernutrition" />
        <div>
          <label style={{ display: "block", fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>DESCRIPTION</label>
          <textarea value={store.description} onChange={e => setStore(s => ({ ...s, description: e.target.value }))} rows={3}
            className="input-dark" style={{ width: "100%", padding: "11px 14px", borderRadius: "6px", fontSize: "14px", border: "1px solid var(--border)", resize: "vertical" }}
          />
        </div>
      </Section>

      <Section title="FRAIS DE LIVRAISON PAR WILAYA" icon={Truck}>
        <div style={{ marginBottom: "16px" }}>
          <Field label="FRAIS PAR DÉFAUT (autres wilayas)" value={defaultFee} onChange={setDefaultFee} placeholder="700" type="number" />
        </div>
        <p style={{ fontFamily: "var(--font-condensed)", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "14px" }}>
          TARIFS SPÉCIFIQUES
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
          {Object.keys(DEFAULT_FEES).map(wilaya => (
            <div key={wilaya}>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>{wilaya}</label>
              <div style={{ position: "relative" }}>
                <input type="number" value={fees[wilaya] || ""} onChange={e => setFees(f => ({ ...f, [wilaya]: e.target.value }))}
                  placeholder={defaultFee}
                  className="input-dark"
                  style={{ width: "100%", padding: "8px 44px 8px 12px", borderRadius: "5px", fontSize: "13px", border: "1px solid var(--border)" }}
                />
                <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-condensed)" }}>DA</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "16px", padding: "12px 14px", background: "rgba(232,255,0,0.06)", border: "1px solid rgba(232,255,0,0.15)", borderRadius: "6px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            Les wilayas non listées utiliseront le frais par défaut de <strong style={{ color: "var(--accent)" }}>{defaultFee} DA</strong>
          </p>
        </div>
      </Section>

      <Section title="CONTACT & RÉSEAUX SOCIAUX" icon={Phone}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <Field label="WHATSAPP" value="" onChange={() => {}} placeholder="+213 555 000 000" />
          <Field label="FACEBOOK PAGE" value="" onChange={() => {}} placeholder="facebook.com/rivernutrition" />
          <Field label="EMAIL" value="" onChange={() => {}} placeholder="contact@rivernutrition.dz" type="email" />
          <Field label="SITE WEB" value="" onChange={() => {}} placeholder="rivernutrition.dz" />
        </div>
      </Section>

      <button onClick={handleSave} className="btn-accent"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", width: "100%", padding: "15px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "15px" }}>
        <Save size={16} />
        {saved ? "✓ SAUVEGARDÉ !" : "SAUVEGARDER LES PARAMÈTRES"}
      </button>
    </div>
  );
}
