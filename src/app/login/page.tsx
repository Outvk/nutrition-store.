"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("Supabase Login Error:", signInError);
      setError("Indentifiants invalides. Veuillez réessayer.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 72px)", padding: "20px" }}>
        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "8px", padding: "40px", width: "100%", maxWidth: "420px", position: "relative", overflow: "hidden" }}>
          
          {/* Subtle industrial corner accents */}
          <div className="corner-plus top-left" style={{ color: "var(--accent)" }}>+</div>
          <div className="corner-plus top-right" style={{ color: "var(--accent)" }}>+</div>
          <div className="corner-plus bottom-left" style={{ color: "var(--accent)" }}>+</div>
          <div className="corner-plus bottom-right" style={{ color: "var(--accent)" }}>+</div>

          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <p style={{ fontFamily: "var(--font-condensed)", fontSize: "12px", letterSpacing: "0.2em", color: "var(--accent)", fontWeight: 700, marginBottom: "8px" }}>RESTREINT</p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "32px", color: "var(--text-primary)" }}>ACCÈS ADMIN</h1>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {error && (
              <div style={{ padding: "12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef444444", borderRadius: "6px", color: "#ef4444", fontSize: "13px", textAlign: "center", fontFamily: "var(--font-condensed)", fontWeight: 700, letterSpacing: "0.04em" }}>
                {error}
              </div>
            )}

            <div style={{ position: "relative" }}>
              <User size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email administrateur"
                className="input-dark"
                style={{ width: "100%", padding: "14px 16px 14px 44px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "15px", fontFamily: "var(--font-body)" }}
              />
            </div>

            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="input-dark"
                style={{ width: "100%", padding: "14px 16px 14px 44px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "15px", fontFamily: "var(--font-body)" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent"
              style={{ width: "100%", padding: "14px", borderRadius: "6px", border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: "15px", fontFamily: "var(--font-condensed)", fontWeight: 700, letterSpacing: "0.06em", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "8px", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "CONNEXION EN COURS..." : "SE CONNECTER"} <ArrowRight size={16} />
            </button>
          </form>

        </div>
      </div>
    </>
  );
}
