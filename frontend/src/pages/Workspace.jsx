import { useEffect } from "react";
import { useParams } from "react-router-dom";
import TerminalComponent from "../components/Terminal";
import FileViewer from "../components/FileViewer";
import CodeEditor from "../components/CodeEditor";
import useFileTabsContext from "../hooks/useFileTabsContext";
import Tab from "../components/mini-components/Tab";
import useSocket from "../hooks/useSocket";
import useWorkspaceMeta from "../hooks/useWorkspaceMeta";

const Workspace = () => {
  const { fileTabs, removeTab, activeTab } = useFileTabsContext();
  const { workspaceId, setWorkspaceId } = useWorkspaceMeta();
  const { socket } = useSocket();
  const { id } = useParams();

  useEffect(() => {
    setWorkspaceId(id);

    console.log(`${id}: id`);
    console.log("workspace:join", { workspaceId });

    socket.emit("workspace:join", { workspaceId });

    return () => {
      socket.emit("workspace:exit");
      setWorkspaceId(null);
    };
  }, [id, setWorkspaceId, socket, workspaceId]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Top section: File viewer + Editor */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: "0 0 250px", borderRight: "1px solid #ccc" }}>
          <FileViewer />
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              background: "#f5f5f5",
              borderBottom: "1px solid #ccc",
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {fileTabs.map((fileTab) => (
              <Tab
                key={fileTab.path}
                name={fileTab.name}
                onClose={() => removeTab(fileTab)}
              />
            ))}
          </div>

          {/* Code editor */}
          <div style={{ flex: 1, overflow: "auto" }}>
            <CodeEditor activeTab={activeTab} />
          </div>
        </div>
      </div>

      {/* Terminal */}
      <div style={{ flex: "0 0 200px", borderTop: "1px solid #ccc" }}>
        <TerminalComponent />
      </div>
    </div>
  );
};

export default Workspace;
