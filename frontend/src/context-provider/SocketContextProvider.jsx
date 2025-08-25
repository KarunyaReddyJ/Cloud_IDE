import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import SocketContext from "../context/SocketContext";
import useWorkspaceMeta from "../hooks/useWorkspaceMeta";

const SocketProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const { workspaceId } = useWorkspaceMeta();
  // Create socket once
  const socket = useMemo(() => {
    const token = localStorage.getItem("auth-token");
    const s = io(import.meta.env.VITE_BACKEND_URL, {
      auth: { workspaceId, token },
    });

    const originalOn = s.on.bind(s);
    const originalOff = s.off.bind(s);
    const originalDisconnected = s.disconnect.bind(s);
    s.on = (event, ...args) => {
      console.debug(`[SOCKET] Event "${event}" registered`, args);
      return originalOn(event, ...args);
    };

    s.off = (event, ...args) => {
      console.debug(`[SOCKET] Event "${event}" unregistered`, args);
      return originalOff(event, ...args);
    };
    s.disconnect = () => {
      console.debug(`[SOCKET] Event disconnect initiated`);
      originalDisconnected();
    };
    return s;
  }, []);

  // Listen for connection changes
  useEffect(() => {
    const socketConnected = () => {
      console.log("✅ Socket connected:", socket.id);
      setLoading(false);
    };

    const socketDisconnected = () => {
      console.log("❌ Socket disconnected");
      setLoading(true);
    };
    socket.on("connect", socketConnected);

    socket.on("disconnect", socketDisconnected);

    return () => {
      console.log("🔌 Cleaning up socket connection");
      socket.off("connect", socketConnected);
      socket.off("disconnect", socketDisconnected);
      socket.disconnect();
    };
  }, [socket]);

  // Stable value for context consumers
  const value = useMemo(() => ({ socket, loading }), [socket, loading]);

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;
