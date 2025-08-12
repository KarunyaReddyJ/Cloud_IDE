import { useContext } from "react";
import FileTabsContext from "../context/FileTabsContext";
const useFileTabs = () => {
    const ctx = useContext(FileTabsContext);
    if(!ctx){
        throw new Error("filetabs context is not initialzed: ",ctx);
        
    }
    return ctx
}

export default useFileTabs;