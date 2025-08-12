import  WorkspaceMetaProvider  from "../context-provider/WorkspaceMetaContextProvider";
import  FileTreeProvider  from "../context-provider/FileContextProvider";
import  FileTabsProvider  from "../context-provider/FileTabsContextProvider";
import { useEffect } from "react";

export default function WorkspaceProvider({ children }) {
  useEffect(()=>{
    console.info('Workspace provider loaded')
  },[])
  try {
    return (
    <WorkspaceMetaProvider>
      <FileTreeProvider>
        <FileTabsProvider>
          {children}
        </FileTabsProvider>
      </FileTreeProvider>
    </WorkspaceMetaProvider>
  );
  } catch (err) {
    console.error('error in workspace provider: ')
    return <></>
  }
}
