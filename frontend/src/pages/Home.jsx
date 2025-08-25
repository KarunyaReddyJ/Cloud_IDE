import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import useWorkspaceMeta from "../hooks/useWorkspaceMeta";
import  useTheme  from "../hooks/useTheme";

const Home = () => {
  const [languages, setLanguages] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [creating, setCreating] = useState(false);
  const { setWorkspaceId } = useWorkspaceMeta();
  const { loading, authFetch } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();

  // Fetch runtimes
  useEffect(() => {
    const getLanguages = async () => {
      try {
        const response = await authFetch("/api/runtime");
        if (!response.ok) throw new Error("Failed to fetch runtimes");
        const data = await response.json();
        setLanguages(data);
        if (data.length > 0) setSelectedLanguage(data[0]);
      } catch (error) {
        console.error("Error fetching runtimes:", error);
      }
    };

    if (!loading) getLanguages();
  }, [authFetch, loading]);

  // Fetch workspaces
  useEffect(() => {
    const getWorkspaces = async () => {
      try {
        const response = await authFetch("/api/workspaces");
        if (!response.ok) throw new Error("Failed to fetch workspaces");
        const data = await response.json();
        setWorkspaces(data);
      } catch (error) {
        console.error("Error fetching workspaces:", error);
      }
    };

    if (!loading) getWorkspaces();
  }, [authFetch, loading]);

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) {
      alert("Please enter a workspace name.");
      return;
    }

    try {
      setCreating(true);
      const response = await authFetch("/api/workspace", {
        method: "POST",
        body: JSON.stringify({
          name: workspaceName,
          language: selectedLanguage,
        }),
      });
      if (!response.ok) throw new Error("Failed to create workspace");

      const newWorkspace = await response.json();
      setWorkspaces((prev) => [newWorkspace, ...prev]);
      setWorkspaceName("");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteWorkspace = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workspace?"))
      return;

    try {
      const res = await authFetch(`/api/workspace/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete workspace");

      setWorkspaces((prev) => prev.filter((ws) => ws._id !== id));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleViewWorkspace = (id) => {
    setWorkspaceId(id);
    navigate(`/workspace/${id}`);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col p-6">
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">
          ⚡ DevCloud
        </h2>
        <nav className="space-y-2">
          <button className="w-full text-left px-4 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
            🏠 Dashboard
          </button>
          <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
            📂 Workspaces
          </button>
          <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
            ⚙️ Settings
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-800 shadow-sm">
          <input
            className="px-4 py-2 w-1/3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="🔍 Search workspaces..."
          />
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {darkMode ? "🌙" : "☀️"}
            </button>
            <div className="px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
              👤 User
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Create section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Create New Workspace
            </h3>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Workspace Name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <button
                onClick={handleCreateWorkspace}
                disabled={creating}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {creating ? "⏳ Creating..." : "➕ Create"}
              </button>
            </div>
          </div>

          {/* Workspaces list */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Your Workspaces
            </h3>
            {workspaces.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No workspaces yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Language</th>
                      <th className="px-4 py-2">Created At</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workspaces.map((ws) => (
                      <tr
                        key={ws.id}
                        className="border-b border-gray-100 dark:border-gray-700"
                      >
                        <td className="px-4 py-2">{ws.name}</td>
                        <td className="px-4 py-2">{ws.language}</td>
                        <td className="px-4 py-2">
                          {new Date(ws.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 space-x-2">
                          <button
                            onClick={() => handleViewWorkspace(ws.id)}
                            className="px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                          >
                            👀 View
                          </button>
                          <button
                            onClick={() => handleDeleteWorkspace(ws.id)}
                            className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700"
                          >
                            ❌ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
