import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import SocketContext from "../context/SocketContext";

const socket = io(import.meta.env.VITE_BACKEND_URL);

const SocketProvider = ({ children }) => {
  const value = useMemo(() => socket, []);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setLoading(false);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    return () => {
      socket.off("connect");
      setLoading(true);
      socket.off("disconnect");
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: value, loading }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
