import { useState, useEffect } from "react";
import FileContext from "../context/FileContext";
import useSocket from "../hooks/useSocket";
import useAuth from "../hooks/useAuth";
const FileContextProvider = ({ children }) => {
  const [fetchFiles, setFetchFiles] = useState(true);
  const [fileTabs, setFileTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [fileTree, setFileTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [workspaceId, setWorkspaceId] = useState(null);
  const { socket, loading: socketLoading } = useSocket();
  const {authFetch}=useAuth()

  const initiateFileFetch = () => setFetchFiles(true);
  const markFileUptoDate = () => setFetchFiles(false);
  const [code, setcode] = useState("");
  useEffect(() => {
    const FetchFiles = async () => {
      console.log({workspaceId})
      if(workspaceId===null) return
      setLoading(true);
      const response = await authFetch(`/api/workspace/${workspaceId}/files`);
      const parsedResponse = await response.json();
      console.log(parsedResponse.fsTree);
      setFileTree(parsedResponse.fsTree || []);
      markFileUptoDate();
      setLoading(false);
    };
    if (fetchFiles) {
      FetchFiles();
      setFetchFiles(false);
    }
  }, [fetchFiles, workspaceId]);

  useEffect(() => {
    try {
      console.log("useffect running", activeTab);
      if (!activeTab) return;
      if (socketLoading) {
        console.warn("socket not yet loaded");
        return;
      }

      const id = setTimeout(() => {
        console.log("triggering", code);
        socket?.emit("file:write", {
          path: activeTab.path,
          content: code,
        });
      }, 2000);
      console.log("timer set", id);
      return () => {
        console.log("timer cleared", id);
        clearTimeout(id);
      };
    } catch (error) {
      console.error("error", error.message);
    }
  }, [activeTab, code, socket, socketLoading]);

  useEffect(() => {
    if (socketLoading) {
      console.warn("socket not yet loaded");
      return;
    }
    socket?.on("file:write:success", ({ path }) => {
      console.log(`✅ Saved ${path}`);
    });
    socket?.on("file:refresh", () => {
      setFetchFiles(true);
    });
    socket?.on("file:error", (err) => {
      console.error("❌ File error:", err.message);
    });

    return () => {
      socket?.off("file:write:success");
      socket?.off("file:error");
      socket?.off("file:refresh");
    };
  }, [socket, socketLoading]);

  const areSameFile = (tab1, tab2) => {
    return tab1.name === tab2.name && tab1.path === tab2.path;
  };

  const removeTab = (tab) => {
    const filteredTabs = fileTabs.filter(
      (fileTab) => !areSameFile(fileTab, tab)
    );

    setFileTabs(filteredTabs); // <-- update tabs
    if (areSameFile(activeTab, tab)) {
      // Set next tab as active, or null if none
      setActiveTab(filteredTabs[filteredTabs.length - 1] || null);
    }
  };

  const removeLeastRecentlyUsed = (tabs) => {};
  const addTab = (tab) => {
    const filteredTabs = fileTabs.filter(
      (fileTab) => !areSameFile(fileTab, tab)
    );
    setActiveTab(tab);
    if (filteredTabs.length != fileTabs.length) return;
    if (filteredTabs.length >= 5) {
      removeLeastRecentlyUsed(filteredTabs);
    }
    setFileTabs([...filteredTabs, tab]);
  };

  useEffect(() => {
    console.log("active Tab", activeTab);
    if (!activeTab) return;
    const path = activeTab.path;
    const getCode = async () => {
      if(!workspaceId) return
      try {
        const response = await authFetch(`/api/workspace/${workspaceId}/file?name=${path}`);
        const parsedData = await response.json();
        const content = parsedData.content;
        setcode(content);
      } catch (error) {
        console.error(
          "error while fetching content of ",
          path,
          error.message
        );
      }
    };
    getCode();
    return () => {};
  }, [activeTab, authFetch, workspaceId]);

  return (
    <FileContext.Provider
      value={{
        fileTree,
        loading,
        setFetchFiles,
        fetchFiles,
        initiateFileFetch,
        markFileUptoDate,
        fileTabs,
        addTab,
        removeTab,
        code,
        setcode,
        activeTab,
        setWorkspaceId,
        workspaceId
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

export default FileContextProvider;
