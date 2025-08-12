import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import useWorkspaceMeta from "../hooks/useWorkspaceMeta";
import FileTreeContext from "../context/FileContext";
import useSocket from "../hooks/useSocket";

export default function FileTreeProvider({ children }) {
  const [fileTree, setFileTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchFiles, setFetchFiles] = useState(true);
  const { authFetch } = useAuth();
  const { workspaceId } = useWorkspaceMeta();
  const { socket } = useSocket();

  useEffect(() => {
    console.log("loaded");
  }, []);
  useEffect(() => {
    if (!fetchFiles || !workspaceId) return;
    (async () => {
      setLoading(true);
      const res = await authFetch(`/api/workspace/${workspaceId}/files`);
      const data = await res.json();
      setFileTree(data.fsTree || []);
      setFetchFiles(false);
      setLoading(false);
    })();
  }, [authFetch, fetchFiles, workspaceId]);

  useEffect(() => {
    const fileFetchFunction = (data) => {
      setFetchFiles(true);
    };
    socket?.on("file:refresh", fileFetchFunction);
    return () => {
      socket?.off("file:refresh", fileFetchFunction);
    };
  }, []);
  return (
    <FileTreeContext.Provider value={{ fileTree, loading, setFetchFiles }}>
      {children}
    </FileTreeContext.Provider>
  );
}
