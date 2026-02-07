import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Initialize the Inter font
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MaidMatch Admin",
  description: "Plateforme de gestion pour les services de nettoyage MaidMatch",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}