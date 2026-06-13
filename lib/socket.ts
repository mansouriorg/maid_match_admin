// src/lib/socket.ts
import { io } from "socket.io-client";

// Remplace par l'URL de ton backend NestJS si elle est différente
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// autoConnect: false permet de ne se connecter que lorsque l'admin est sur le dashboard
export const socket = io(BACKEND_URL, {
  autoConnect: false, 
  withCredentials: true, // <-- La correction est ici ("withCredentials" au lieu de "credentials")
});