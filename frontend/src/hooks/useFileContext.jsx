import { useContext } from "react";
import FileContext from "../context/FileContext";

const useFileContext =()=> useContext(FileContext)

export default useFileContext