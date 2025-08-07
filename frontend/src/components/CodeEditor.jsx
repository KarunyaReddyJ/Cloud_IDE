import Editor from "@monaco-editor/react";
import useFileContext from "../hooks/useFileContext";

const CodeEditor = () => {
  const { code, setcode, activeTab,loading } = useFileContext();

  const handleEditorDidMount = (editor, monaco) => {
    console.log("Editor mounted:", editor);
    editor.focus();
  };

  const handleEditorChange = (value) => {
    setcode(value);
    console.log("Editor content changed:", value);
  };
  const getLanguageByExtension = () => {
    console.log('enetered ',activeTab)
    if (!activeTab?.name) return "plaintext";
    const ext = activeTab.name.split(".").pop();
    console.log("ext", ext);
    return (
      {
        js: "javascript",
        ts: "typescript",
        jsx: "javascript",
        tsx: "typescript",
        html: "html",
        css: "css",
        json: "json",
        py: "python",
        java: "java",
        cpp: "cpp",
        c: "c",
        md: "markdown",
        sh: "shell",
        txt: "plaintext",
      }[ext] || "plaintext"
    );
  };
  console.log("getLanguageByExtension", getLanguageByExtension());
  return (
    <div>
      <Editor
        height="70vh"
        width="70vw"
        language={getLanguageByExtension()}
        value={code}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        options={{
          selectOnLineNumbers: true,
          minimap: { enabled: true },
        }}
      />
    </div>
  );
};

export default CodeEditor;
