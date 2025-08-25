import React from "react";
import "./styles/skeleton.css";

export default function SkeletonIDE() {
  return (
    <div className="skeleton-ide">
      {/* File Explorer */}
      <div className="skeleton-sidebar">
        <div className="skeleton-item"></div>
        <div className="skeleton-item"></div>
        <div className="skeleton-item"></div>
      </div>

      {/* Code Editor */}
      <div className="skeleton-editor">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="skeleton-line"></div>
        ))}
      </div>

      {/* Terminal */}
      <div className="skeleton-terminal">
        <div className="skeleton-line short"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
      </div>
    </div>
  );
}
