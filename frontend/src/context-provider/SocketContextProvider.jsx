import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import SocketContext from "../context/SocketContext";

let socket = io(import.meta.env.VITE_BACKEND_URL);

const originalOn=socket.on.bind(socket)
const originalOff=socket.off.bind(socket)
socket.on=(event,...args)=>{
  console.debug(`[SOCKET] Event "${event}" registered`, args);
  return originalOn(event,...args)
}
socket.off=(event,...args)=>{
  console.debug(`[SOCKET] Event "${event}" unregistered`, args);
  return originalOff(event,...args)
}
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
    console.log("🔌 Cleaning up socket connection");
    socket.off("connect");
    socket.off("disconnect");
    socket.disconnect();
    socket=null // <-- important if provider can unmount
    setLoading(true);
  };
}, []);


  return (
    <SocketContext.Provider value={{ socket: value, loading }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
