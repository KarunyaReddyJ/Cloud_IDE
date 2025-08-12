import { useContext } from "react";
import AuthContext from "../context/AuthContext";

const useAuth = () =>{ 
    const ctx = useContext(AuthContext);
    if(!ctx){
        throw new Error("auth context is not initialzed: ",ctx);
        
    }
    return ctx
}


export default useAuth