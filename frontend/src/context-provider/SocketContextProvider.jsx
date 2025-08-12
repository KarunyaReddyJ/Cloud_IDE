import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import SocketContext from "../context/SocketContext";

const SocketProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);

  // Create socket once
  const socket = useMemo(() => {
    const s = io(import.meta.env.VITE_BACKEND_URL);

    const originalOn = s.on.bind(s);
    const originalOff = s.off.bind(s);

    s.on = (event, ...args) => {
      console.debug(`[SOCKET] Event "${event}" registered`, args);
      return originalOn(event, ...args);
    };

    s.off = (event, ...args) => {
      console.debug(`[SOCKET] Event "${event}" unregistered`, args);
      return originalOff(event, ...args);
    };

    return s;
  }, []);

  // Listen for connection changes
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setLoading(false);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setLoading(true);
    });

    return () => {
      console.log("🔌 Cleaning up socket connection");
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    }
  }, [socket]);

  // Stable value for context consumers
  const value = useMemo(() => ({ socket, loading }), [socket, loading]);

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;
