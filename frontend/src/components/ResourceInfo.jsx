import React, { useEffect, useState } from "react";
import useSocket from "../hooks/useSocket";

const ResourceInfo = () => {
  const [stats, setStats] = useState(null);
  const { socket } = useSocket();

  useEffect(() => {
    const fetchResources = (payload) => {
      const { data } = payload;
      if (!data) return;
      setStats(data);
    };
    socket.on("resource", fetchResources);
    return () => {
      socket.off("resource", fetchResources);
    };
  }, [socket]);

  if (!stats || !socket) return <>No Data</>;

  const { cpu, memory, network } = stats;

  return (
    <div className="p-4 bg-gray-900 text-gray-100 rounded-xl shadow-lg w-full max-w-md">
      <h2 className="text-lg font-semibold mb-4">Container Resources</h2>

      {/* CPU */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span>CPU Usage</span>
          <span>{cpu.percent}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${cpu.percent}%` }}
          />
        </div>
      </div>

      {/* Memory */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span>Memory</span>
          <span>
            {memory.used}MB / {memory.limit}MB ({memory.percent}%)
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${memory.percent}%` }}
          />
        </div>
      </div>

      {/* Network */}
      {network && (
        <div>
          <h3 className="text-sm font-medium mb-2">Network</h3>
          {Object.entries(network).map(([iface, stats]) => (
            <div key={iface} className="text-xs mb-1">
              <span className="font-mono">{iface}</span>: RX{" "}
              {(stats.rx_bytes / 1024).toFixed(1)} KB | TX{" "}
              {(stats.tx_bytes / 1024).toFixed(1)} KB
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceInfo;
