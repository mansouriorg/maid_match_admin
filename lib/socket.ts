import { io } from "socket.io-client";
import { getToken } from "@/lib/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// The socket is opened only while an admin is logged in (see SocketListener).
// The login token is sent each time it connects, and the server refuses a
// socket without a valid token.
export const socket = io(BACKEND_URL, {
  autoConnect: false,
  auth: (callback) => {
    callback({ token: getToken() });
  },
});

// Connects when there is a session and disconnects when there is none.
export function syncSocketWithSession(token: string | null) {
  if (token) {
    if (socket.connected === false) {
      socket.connect();
    }
  } else if (socket.connected) {
    socket.disconnect();
  }
}
