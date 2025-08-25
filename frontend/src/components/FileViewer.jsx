import { useState, useEffect } from "react";
import useFileContext from "../hooks/useFileContext";
import useWorkspaceMetaContext from "../hooks/useWorkspaceMeta";
import useFileTabsContext from "../hooks/useFileTabsContext";
import useWorkspaceMeta from "../hooks/useWorkspaceMeta";
const fileIcons = {
  js: "🟨",
  jsx: "🟦",
  ts: "🟦",
  tsx: "🟦",
  py: "🐍",
  html: "🌐",
  css: "🎨",
  md: "📄",
  json: "🗄️",
  yml: "🗄️",
  yaml: "🗄️",
  svg: "🖼️",
  default: "📄",
};

function getFileIcon(name) {
  const ext = name.split(".").pop();
  return fileIcons[ext] || fileIcons.default;
}

const FileViewer = () => {
  const { fileTree, loading } = useFileContext();
  const { workspaceId } = useWorkspaceMetaContext();
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    console.log("mounted fileviewer", workspaceId, loading);
    return () => {};
  }, []);
  const handleMenuAction = (action) => {
    if (!selectedNode) return;
    alert(`${action} on ${selectedNode.name}`);
    setContextMenu(null);
  };

  const renderContextMenu = () =>
    contextMenu && (
      <div
        className="context-menu"
        style={{ top: contextMenu.y, left: contextMenu.x }}
      >
        {["Rename", "Delete", "New File", "New Folder"].map((item) => (
          <div
            key={item}
            className="context-menu-item"
            onClick={() => handleMenuAction(item)}
          >
            {item}
          </div>
        ))}
      </div>
    );

  if (loading) {
    return (
      <div className="fileviewer-loading">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="loading-line" />
        ))}
      </div>
    );
  }

  return (
    <div className="fileviewer" onClick={() => setContextMenu(null)}>
      {console.log(fileTree)}
      {fileTree?.map((fileNode) => (
        <RecursiveComponent
          key={fileNode.id}
          node={fileNode}
          setContextMenu={setContextMenu}
          setSelectedNode={setSelectedNode}
        />
      ))}
      {renderContextMenu()}
    </div>
  );
};

export default FileViewer;

const RecursiveComponent = ({ node, setContextMenu, setSelectedNode }) => {
  const { workspaceId } = useWorkspaceMeta();
  const { addTab } = useFileTabsContext();
  const [opened, setOpened] = useState(false);
  const { name, id, children = [], isDir } = node;
  const path = id?.split(`runtime-${workspaceId}/`)[1] || "path";
  const fullPath = path === "" ? name : path;

  const handleContextMenu = (e) => {
    e.preventDefault();
    setSelectedNode(node);
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (isDir) {
      setOpened((prev) => !prev);
    } else {
      addTab({ name, path: fullPath });
    }
  };

  return (
    <div className="file-node">
      <div
        className={`file-item ${isDir ? "dir" : "file"}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <span className="file-icon">
          {isDir ? (opened ? "📂" : "📁") : getFileIcon(name)}
        </span>
        <span>{name}</span>
      </div>

      {opened && isDir && (
        <div className="file-children">
          {children.map((child) => (
            <RecursiveComponent
              key={child.id}
              node={child}
              setContextMenu={setContextMenu}
              setSelectedNode={setSelectedNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};
