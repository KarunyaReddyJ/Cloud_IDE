import TerminalComponent from "../components/Terminal";
import FileViewer from "../components/FileViewer";
import CodeEditor from "../components/CodeEditor";
import useFileContext from "../hooks/useFileContext";
import Tab from "../components/mini-components/Tab";
const Layout = () => {
  const { fileTabs, removeTab, activeTab } = useFileContext();
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

export default Layout;
