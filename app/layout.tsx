import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SocketListener from "@/components/SocketListener"; // <-- Import du Listener WebSocket

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
        
        {/* Le contenu principal de ton application (pages, sidebar, etc.) */}
        {children}

        {/* Le composant invisible qui écoute les notifications en arrière-plan */}
        <SocketListener />
        
      </body>
    </html>
  );
}