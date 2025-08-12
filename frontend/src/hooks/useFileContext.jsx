import { useContext } from "react";
import FileContext from "../context/FileContext";

const useFileContext =()=> {
    const ctx= useContext(FileContext)
    if(!ctx){
        throw new Error("filecontent context is not initialzed: ",ctx);
        
    }
    return ctx
}

export default useFileContext