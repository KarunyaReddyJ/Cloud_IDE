import "./App.css";
import {lazy} from 'react'
import FileContextProvider from "./context-provider/FileContextProvider";
import SocketProvider from "./context-provider/SocketContextProvider";
import AuthProvider from "./context-provider/AuthContextProvider";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
const Workspace=lazy(()=>import("./pages/Workspace"))
const Home=lazy(()=>import("./pages/Home"))


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <FileContextProvider>
            <Routes>
              <Route path="/" element={<ProtectedRoute> <Home /> </ProtectedRoute>}/>
              <Route  path="/workspace/:id" element={ <ProtectedRoute>  <Workspace /> </ProtectedRoute>}/>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </FileContextProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
