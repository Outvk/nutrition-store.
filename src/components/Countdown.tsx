"use client";
import { useState, useEffect } from "react";

interface Props {
  targetDate: Date;
}

export default function Countdown({ targetDate }: Props) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  const [ticking, setTicking] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, targetDate.getTime() - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime({ h, m, s });
      setTicking(true);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const pad = (n: number) => String(n).padStart(2, "0");

  const Unit = ({ value, label }: { value: number; label: string }) => (
    <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
      <span style={{
        fontFamily: "var(--font-display)",
        fontSize: "24px",
        color: "var(--accent)",
        lineHeight: "1"
      }}>
        {pad(value)}
      </span>
      <span style={{ 
        fontSize: "10px", 
        fontFamily: "var(--font-condensed)", 
        fontWeight: 700, 
        color: "var(--text-secondary)",
        marginLeft: "1px"
      }}>
        {label}
      </span>
    </div>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "transparent" }}>
      <Unit value={time.h} label="H" />
      <Unit value={time.m} label="M" />
      <Unit value={time.s} label="S" />
    </div>
  );
}
