import "@xterm/xterm/css/xterm.css";
import { Terminal } from "@xterm/xterm";
import { useRef, useEffect } from "react";
import useSocket from "../hooks/useSocket";
const TerminalComponent = () => {
  const terminalRef = useRef();
  const { socket, loading: socketLoading } = useSocket();
  useEffect(() => {
    if (socketLoading) {
      console.warn("socket not yet loaded");
      return;
    }
    const terminal = new Terminal();
    terminal.open(terminalRef.current);
    terminal.onData((data) => {
      socket.emit("terminal:write", data);
    });

    socket.on("terminal:data", (data) => {
      terminal.write(data);
    });
    return () => {
      socket.off("terminal:data");
    };
  }, [socket, socketLoading]);

  return <div style={{ height: "30vh" }} ref={terminalRef}></div>;
};

export default TerminalComponent;
