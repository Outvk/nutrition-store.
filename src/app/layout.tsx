import type { Metadata } from "next";
import { Poppins, Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dm",
});

export const metadata: Metadata = {
  title: "AdemNutrition — Sport Supplements Algeria",
  description: "Suppléments sportifs authentiques livrés partout en Algérie",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${poppins.variable} ${bebas.variable} ${dmSans.variable}`}>
      <body suppressHydrationWarning className={poppins.className}>
        {children}
      </body>
    </html>
  );
}
