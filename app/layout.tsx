import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SocketListener from "@/components/SocketListener"; // <-- Import du Listener WebSocket

// Geist, the same font as the public site (see app/globals.css)
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

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
      <body className={`${geistSans.variable} font-sans bg-slate-50 text-slate-900`}>
        
        {/* Le contenu principal de ton application (pages, sidebar, etc.) */}
        {children}

        {/* Le composant invisible qui écoute les notifications en arrière-plan */}
        <SocketListener />
        
      </body>
    </html>
  );
}