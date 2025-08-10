// WorkspaceMetaContext.js
import {  useState } from "react";
import WorkspaceMetaContext from '../context/WorkspaceContext'


export function WorkspaceMetaProvider({ children }) {
  const [workspaceId, setWorkspaceId] = useState(null);

  return (
    <WorkspaceMetaContext.Provider value={{ workspaceId, setWorkspaceId }}>
      {children}
    </WorkspaceMetaContext.Provider>
  );
}
