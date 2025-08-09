import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";

const Home = () => {
  const [languages, setLanguages] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);

  const [workspaceName, setWorkspaceName] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [creating, setCreating] = useState(false);

  const { loading, authFetch } = useAuth();

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
        body: JSON.stringify({ name: workspaceName, language: selectedLanguage }),
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
    if (!window.confirm("Are you sure you want to delete this workspace?")) return;

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

  return (
    <div className="container">
      <h1>Dashboard</h1>

      <div className="create-section">
        <h2>Create New Workspace</h2>
        <input
          type="text"
          placeholder="Workspace Name"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
        />
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        <button onClick={handleCreateWorkspace} disabled={creating}>
          {creating ? "Creating..." : "Create"}
        </button>
      </div>

      <div className="workspace-list">
        <h2>Your Workspaces</h2>
        {workspaces.length === 0 ? (
          <p>No workspaces found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Language</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workspaces.map((ws) => (
                <tr key={ws.id}>
                  <td>{ws.name}</td>
                  <td>{ws.language}</td>
                  <td>{new Date(ws.createdAt).toLocaleString()}</td>
                  <td>
                    <a href={`/workspace/${ws.id}`} className="view-btn">
                      View
                    </a>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteWorkspace(ws.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Home;
