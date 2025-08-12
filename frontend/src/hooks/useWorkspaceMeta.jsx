import { useContext } from "react";
import WorkspaceMetaContext from "../context/WorkspaceMetaContext";


const useWorkspaceMeta = () => {
  const ctx=  useContext(WorkspaceMetaContext);
  if(!ctx){
        throw new Error("workspace context is not initialzed: ",ctx);
        
    }
    return ctx
}


export default useWorkspaceMeta