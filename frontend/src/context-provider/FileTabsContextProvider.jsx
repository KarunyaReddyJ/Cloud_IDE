import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import useSocket from "../hooks/useSocket";
import useWorkspaceMeta from "../hooks/useWorkspaceMeta";
import FileTabsContext from "../context/FileTabsContext";

export default function FileTabsProvider({ children }) {
  const [fileTabs, setFileTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { authFetch } = useAuth();
  const { socket, loading: socketLoading } = useSocket();
  const { workspaceId } = useWorkspaceMeta();

  useEffect(() => {
    console.log("loaded", { socket, loading: socketLoading });
  }, []);
  // Fetch file content when active tab changes
  useEffect(() => {
    if (!activeTab || !workspaceId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await authFetch(
          `/api/workspace/${workspaceId}/file?name=${activeTab.path}`
        );
        const data = await res.json();
        setCode(data.content);
      } catch (error) {
        console.error(
          "Error while fetching content of ",
          activeTab.path,
          " ",
          error.message
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [activeTab, authFetch, workspaceId]);

  // Auto-save code changes
  useEffect(() => {
    if (!activeTab || socketLoading) return;
    const timer = setTimeout(() => {
      socket.emit("file:write", { path: activeTab.path, content: code });
    }, 2000);
    return () => clearTimeout(timer);
  }, [activeTab, code, socket, socketLoading]);

  // Listen for socket events
  useEffect(() => {
    if (socketLoading) return;
    socket.on("file:write:success", ({ path }) =>
      console.log(`✅ Saved ${path}`)
    );
    socket.on("file:error", (err) => console.error("❌ File error:", err));
    return () => {
      socket.off("file:write:success");
      socket.off("file:error");
    };
  }, [socket, socketLoading]);

  const areSameFile = (a, b) => a?.path === b?.path && a?.name === b?.name;

  const addTab = (tab) => {
    if (!fileTabs.some((t) => areSameFile(t, tab))) {
      setFileTabs([...fileTabs, tab]);
    }
    setActiveTab(tab);
  };

  const removeTab = (tab) => {
    const newTabs = fileTabs.filter((t) => !areSameFile(t, tab));
    setFileTabs(newTabs);
    if (areSameFile(activeTab, tab)) {
      setActiveTab(newTabs[newTabs.length - 1] || null);
    }
  };

  return (
    <FileTabsContext.Provider
      value={{
        fileTabs,
        activeTab,
        addTab,
        removeTab,
        code,
        setCode,
        setActiveTab,
        loading,
      }}
    >
      {children}
    </FileTabsContext.Provider>
  );
}
