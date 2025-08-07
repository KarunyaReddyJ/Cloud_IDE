import "./App.css";
import FileContextProvider from "./context-provider/FileContextProvider";
import SocketProvider from "./context-provider/SocketContextProvider";
import Layout from "./pages/Layout";

function App() {
  return (
    <>
      <SocketProvider>
        <FileContextProvider>
          <Layout />
        </FileContextProvider>
      </SocketProvider>
    </>
  );
}

export default App;
