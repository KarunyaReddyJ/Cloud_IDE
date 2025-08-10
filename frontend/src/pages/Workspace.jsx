import { useEffect } from "react";
import TerminalComponent from "../components/Terminal";
import FileViewer from "../components/FileViewer";
import CodeEditor from "../components/CodeEditor";
import useFileContext from "../hooks/useFileContext";
import Tab from "../components/mini-components/Tab";
import useSocket from "../hooks/useSocket";
const Workspace = () => {
  const { workspaceId,fileTabs, removeTab, activeTab } = useFileContext();
  const {socket}=useSocket()
  useEffect(() => {
    console.log('workspace:join',{ workspaceId})
    socket.emit('workspace:join',({ workspaceId}))
    return () => {
      socket.emit('workspace:exit')
    };
  }, [socket, workspaceId]);
  return (
    <div>
      <div className="flex" style={{ display: "flex" }}>
        <FileViewer />
        <div>
          {" "}
          <div style={{ display: "flex" }}>
            {fileTabs.map((fileTab) => {
              return (
                <Tab
                  key={fileTab.path}
                  name={fileTab.name}
                  onClose={() => removeTab(fileTab)}
                />
              );
            })}
          </div>
          <CodeEditor activeTab={activeTab} />
        </div>
      </div>
      <TerminalComponent />
    </div>
  );
};

export default Workspace;
