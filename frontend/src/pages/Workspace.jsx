import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TerminalComponent from "../components/Terminal";
import FileViewer from "../components/FileViewer";
import CodeEditor from "../components/CodeEditor";
import useFileTabsContext from "../hooks/useFileTabsContext";
import Tab from "../components/mini-components/Tab";
import useSocket from "../hooks/useSocket";
import useWorkspaceMeta from "../hooks/useWorkspaceMeta";
import Preview from "../components/Preview";
import "./styles/workspace.css"; // <-- New CSS file

const Workspace = () => {
  const { fileTabs, removeTab, activeTab } = useFileTabsContext();
  const { workspaceId, setWorkspaceId } = useWorkspaceMeta();
  const { socket } = useSocket();
  const { id } = useParams();
  const [showPreview, setShowPreview] = useState(false);
  
  useEffect(() => {
    setWorkspaceId(id);
    socket.emit("workspace:join", { workspaceId });

    return () => {
      socket.emit("workspace:exit");
      setWorkspaceId(null);
    };
  }, [id, setWorkspaceId, socket, workspaceId]);

  return (
    <div className="workspace-container">
      {/* Top section: File viewer + Editor */}
      <div className="workspace-main">
        <div className="workspace-fileviewer">
          <FileViewer />
        </div>

        <div className="workspace-editor">
          {/* Tabs */}
          <div className="workspace-tabs">
            {fileTabs.map((fileTab) => (
              <Tab
                key={fileTab.path}
                name={fileTab.name}
                onClose={() => removeTab(fileTab)}
              />
            ))}
          </div>

          <div className="workspace-toolbar">
            <button onClick={() => setShowPreview((p) => !p)}>
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
          </div>

          {/* Code editor + Preview */}
          <div className="workspace-editor-main">
            <div className="workspace-code">
              <CodeEditor activeTab={activeTab} />
            </div>
            {showPreview && (
              <div className="workspace-preview">
                <Preview id={id} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terminal */}
      <div className="workspace-terminal">
        <TerminalComponent />
      </div>
    </div>
  );
};

export default Workspace;
