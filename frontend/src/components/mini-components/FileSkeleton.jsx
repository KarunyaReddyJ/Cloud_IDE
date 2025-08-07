import React from 'react'

const FileSkeleton = () => {
  return (
    <div style={{ padding: "10px" }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            height: "20px",
            width: `${80 + Math.random() * 60}px`,
            backgroundColor: "#e0e0e0",
            margin: "8px 0",
            borderRadius: "4px",
            animation: "pulse 1.2s infinite ease-in-out",
          }}
        />
      ))}

      {/* Inject animation keyframes */}
      <style>
        {`
          @keyframes pulse {
            0% {
              background-color: #e0e0e0;
            }
            50% {
              background-color: #f0f0f0;
            }
            100% {
              background-color: #e0e0e0;
            }
          }
        `}
      </style>
    </div>
  )
}

export default FileSkeleton