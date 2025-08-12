import { useContext } from "react";
import SocketContext from "../context/SocketContext";
const useSocket = () =>{
    const ctx= useContext(SocketContext);
    if(!ctx){
        throw new Error("socket context is not initialzed: ",ctx);
        
    }
    return ctx
}

export default useSocket;