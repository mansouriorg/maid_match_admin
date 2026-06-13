// src/components/SocketListener.tsx
"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket";
import toast, { Toaster } from "react-hot-toast";

export default function SocketListener() {
  useEffect(() => {
    // 1. On se connecte au WebSocket quand le composant est monté
    socket.connect();

    // 2. On écoute l'événement exact que l'on a défini dans le backend
    socket.on("new-intervention", (data) => {
      console.log("Nouvelle intervention reçue :", data);
      
      // 3. On affiche une jolie notification
      toast.success(
        <div>
          <strong>{data.title}</strong>
          <p className="text-sm text-slate-600 mt-1">{data.message}</p>
        </div>,
        {
          duration: 6000, // Disparaît après 6 secondes
          position: "top-right",
          style: {
            border: '1px solid #14b8a6', // Couleur Teal
            padding: '16px',
            color: '#0f172a',
          },
        }
      );
    });

    // 4. Nettoyage : on se déconnecte quand l'admin quitte la page
    return () => {
      socket.off("new-intervention");
      socket.disconnect();
    };
  }, []);

  // Le Toaster est le conteneur physique qui affiche les notifications sur l'écran
  return <Toaster />;
}