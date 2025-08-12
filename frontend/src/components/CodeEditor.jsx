import Editor from "@monaco-editor/react";
import useFileTabsContext from "../hooks/useFileTabsContext";

const CodeEditor = () => {
  
  const {
    code,
    setCode,
    activeTab,
    loading: fileTreeLoading,
  } = useFileTabsContext();
  const handleEditorDidMount = (editor, monaco) => {
    console.log("Editor mounted:", editor);
    editor.focus();
  };

  const handleEditorChange = (value) => {
    setCode(value);
    console.log("Editor content changed:", value);
  };
  const getLanguageByExtension = () => {
    console.log("enetered ", activeTab);
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
  if (fileTreeLoading) {
    return <>Loadiing</>;
  }
  return (
    <div>
      {console.log("code: ", code)}
      <Editor
        height="70vh"
        width="70vw"
        language={getLanguageByExtension()}
        value={activeTab ? code : ""}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        onChange={activeTab ? handleEditorChange : undefined}
        options={{
          readOnly: !activeTab,
          selectOnLineNumbers: true,
          minimap: { enabled: true },
        }}
      />
    </div>
  );
};

export default CodeEditor;
