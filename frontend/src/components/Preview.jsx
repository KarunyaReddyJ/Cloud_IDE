import React, { useRef, useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import useFileTabs from "../hooks/useFileTabsContext";

export default function Preview({ id }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const { code } = useFileTabs();
  const [debouncedKey, setDebouncedKey] = useState(code);
  const { authFetch } = useAuth();
  const tid = useRef(null);

  useEffect(() => {
    tid.current = setTimeout(() => {
      setDebouncedKey(code);
    }, 5000);
    return () => {
      clearTimeout(tid.current);
    };
  }, [code]);
  // Fetch preview URL only once per id
  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(`/api/workspace/${id}/preview-url`);
        if (!res.ok) throw new Error("Failed to load preview");

        const data = await res.json();
        setPreviewUrl(`${import.meta.env.VITE_BACKEND_URL}${data.url}`);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [id]); 

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!previewUrl) return <p>Loading preview...</p>;

  return (
    <div style={{ border: "1px solid #ccc", width: "100%", height: "500px" }}>
      <iframe
        key={debouncedKey}
        src={previewUrl}
        title="Workspace Preview"
        style={{ width: "100%", height: "100%", border: "none" }}
      />
    </div>
  );
}
