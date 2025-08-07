import { useState } from "react";
import useFileContext from "../hooks/useFileContext";

// Simple file extension to emoji mapping
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
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Context menu actions
  const handleMenuAction = (action) => {
    if (!selectedNode) return;
    // Implement your logic for rename, delete, new file/folder here
    alert(`${action} on ${selectedNode.name}`);
    setContextMenu(null);
  };

  // Render context menu
  const renderContextMenu = () => {
    if (!contextMenu) return null;
    return (
      <div
        style={{
          position: "fixed",
          top: contextMenu.y,
          left: contextMenu.x,
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: "4px",
          zIndex: 1000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{ padding: "6px 12px", cursor: "pointer" }}
          onClick={() => handleMenuAction("Rename")}
        >
          Rename
        </div>
        <div
          style={{ padding: "6px 12px", cursor: "pointer" }}
          onClick={() => handleMenuAction("Delete")}
        >
          Delete
        </div>
        <div
          style={{ padding: "6px 12px", cursor: "pointer" }}
          onClick={() => handleMenuAction("New File")}
        >
          New File
        </div>
        <div
          style={{ padding: "6px 12px", cursor: "pointer" }}
          onClick={() => handleMenuAction("New Folder")}
        >
          New Folder
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: "10px" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: "20px",
              width: `${80 + Math.random() * 60}px`,
              backgroundColor: "#e0e0e0",
              margin: "8px 0",
              borderRadius: "4px",
              animation: "pulse 1.2s infinite ease-in-out",
            }}
          />
        ))}
        <style>
          {`
            @keyframes pulse {
              0% { background-color: #e0e0e0; }
              50% { background-color: #f0f0f0; }
              100% { background-color: #e0e0e0; }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "260px",
        height: "100%",
        overflowY: "auto",
        backgroundColor: "#f8f8fa",
        padding: "10px",
        boxSizing: "border-box",
        fontFamily: "monospace",
        fontSize: "14px",
        borderRight: "1px solid #e0e0e0",
        position: "relative",
      }}
      onClick={() => setContextMenu(null)}
    >
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
  const { addTab } = useFileContext();
  const [opened, setOpened] = useState(false);
  const { name, id, children = [], isDir } = node;
  const path = id?.split("/usr/src/app/user/")[1] || "path";
  const fullPath = path === "" ? name : path;

  // Right-click context menu
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
    <div style={{ marginLeft: "10px" }}>
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          backgroundColor: isDir ? "#eaf6ff" : "#fffbe6",
          padding: "2px 6px",
          borderRadius: "4px",
          margin: "2px 0",
          transition: "background 0.2s",
        }}
      >
        <span style={{ marginRight: "6px" }}>
          {isDir ? (opened ? "📂" : "📁") : getFileIcon(name)}
        </span>
        <span>{name}</span>
      </div>

      {opened && isDir && (
        <div style={{ marginLeft: "10px" }}>
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
