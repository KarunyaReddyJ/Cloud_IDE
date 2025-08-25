import "./App.css";
import { lazy } from "react";

import SocketProvider from "./context-provider/SocketContextProvider";
import AuthProvider from "./context-provider/AuthContextProvider";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
const Workspace = lazy(() => import("./pages/Workspace"));
const Home = lazy(() => import("./pages/Home"));
import ErrorBoundary from "./utils/ErrorBoundary";
import WorkspaceMetaProvider from "./context-provider/WorkspaceMetaContextProvider";
import FileTreeProvider from "./context-provider/FileContextProvider";
import FileTabsProvider from "./context-provider/FileTabsContextProvider";
import { ThemeProvider } from "./context-provider/ThemeContextProvider";
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <WorkspaceMetaProvider>
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      {" "}
                      <Home />{" "}
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workspace/:id"
                  element={
                    <SocketProvider>
                      <FileTreeProvider>
                        <FileTabsProvider>
                          <ProtectedRoute>
                            <Workspace />{" "}
                          </ProtectedRoute>
                        </FileTabsProvider>
                      </FileTreeProvider>
                    </SocketProvider>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Routes>
            </WorkspaceMetaProvider>
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
