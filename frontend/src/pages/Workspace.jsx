import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useFileTabsContext from "../hooks/useFileTabsContext";
import useSocket from "../hooks/useSocket";
import useWorkspaceMeta from "../hooks/useWorkspaceMeta";

// Components
import TerminalComponent from "../components/Terminal";
import FileViewer from "../components/FileViewer";
import CodeEditor from "../components/CodeEditor";
import Tab from "../components/mini-components/Tab";
import Preview from "../components/Preview";
import SkeletonIDE from "../components/mini-components/WorkspaceSkeleton";
import ResourceInfo from "../components/ResourceInfo";

const Workspace = () => {
  const { fileTabs, removeTab, activeTab } = useFileTabsContext();
  const { socket, loading } = useSocket();
  const { id } = useParams();
  const { setWorkspaceId } = useWorkspaceMeta();

  const [showPreview, setShowPreview] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [online, setOnline] = useState(0);

  // Workspace ID setup
  useEffect(() => {
    setWorkspaceId(id);
  }, [id, setWorkspaceId]);

  // Online count from socket
  useEffect(() => {
    const changeOnline = (data) => {
      setOnline(data.count);
    };
    socket.on("online-count", changeOnline);
    return () => socket.off("online-count", changeOnline);
  }, [socket]);

  if (loading) return <SkeletonIDE />;

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* File viewer sidebar */}
        <aside className="w-64 border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
          <FileViewer />
        </aside>

        {/* Editor section */}
        <main className="flex flex-col flex-1 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex space-x-2 overflow-x-auto">
              {fileTabs.map((tab) => (
                <Tab
                  key={tab.path}
                  name={tab.name}
                  onClose={() => removeTab(tab)}
                />
              ))}
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center px-3 py-2 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              onClick={() => setShowPreview((p) => !p)}
              className="px-3 py-1 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition"
            >
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
            <button
              onClick={() => setShowResources((r) => !r)}
              className="ml-2 px-3 py-1 text-sm rounded-md bg-gray-700 hover:bg-gray-800 text-white transition"
            >
              {showResources ? "Hide Resources" : "Show Resources"}
            </button>
          </div>

          {/* Editor + Preview */}
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <CodeEditor activeTab={activeTab} />
            </div>
            {showPreview && (
              <div className="w-1/3 border-l border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
                <Preview id={id} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Terminal */}
      {showResources && (
        <div className="h-48 border-t border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
          <ResourceInfo />
        </div>
      )}
      <div className="h-48 border-t border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <TerminalComponent />
      </div>
    </div>
  );
};

export default Workspace;
