// src/components/SocketListener.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { socket, syncSocketWithSession } from "@/lib/socket";
import { getToken } from "@/lib/auth";
import toast, { Toaster } from "react-hot-toast";

export default function SocketListener() {
  const pathname = usePathname();

  // 1. Show a notification when the server announces a new booking.
  useEffect(() => {
    socket.on("new-intervention", (data) => {
      toast.success(
        <div>
          <strong>{data.title}</strong>
          <p className="text-sm text-slate-600 mt-1">{data.message}</p>
        </div>,
        {
          duration: 6000, // Disappears after 6 seconds
          position: "top-right",
          style: {
            border: "1px solid #14b8a6", // Teal
            padding: "16px",
            color: "#0f172a",
          },
        }
      );
    });

    // Cleanup: stop listening and disconnect when the page is closed.
    return () => {
      socket.off("new-intervention");
      socket.disconnect();
    };
  }, []);

  // 2. Connect only while an admin is logged in. The page changes after a
  // login and after a logout, so this check runs again each time.
  useEffect(() => {
    syncSocketWithSession(getToken());
  }, [pathname]);

  // The Toaster is the container that shows the notifications on the screen.
  return <Toaster />;
}
