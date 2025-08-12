// WorkspaceMetaContext.js
import { useEffect, useState, useMemo } from "react";
import WorkspaceMetaContext from "../context/WorkspaceMetaContext";

export default function WorkspaceMetaProvider({ children }) {
  const [workspaceId, setWorkspaceId] = useState(null);
  const value = useMemo(() => {{workspaceId, setWorkspaceId}}, [workspaceId]);
  useEffect(() => {
    console.log(value);
  }, []);

  return (
    <WorkspaceMetaContext.Provider value={{workspaceId, setWorkspaceId}}>
      {children}
    </WorkspaceMetaContext.Provider>
  );
}
