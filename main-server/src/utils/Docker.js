// services/container.service.js
const docker = require("../config/docker.config");
const { subscribeToExpiryEvents } = require('../config/redis.config')
const { Logger } = require('../middleware/logger')

const log = Logger('Docker utils')

/**
 * Create a new container
 * @param {Object} opts - Container options (name, image, binds, ports, env, etc.)
 */
const createContainer = async (opts) => {
  try {
    const container = await docker.createContainer({
      Image: opts.image,
      name: opts.name,
      Tty: true, // so we can attach terminals
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      OpenStdin: true,
      StdinOnce: false,
      Env: opts.env || [],
      ExposedPorts: opts.ports || {},
      HostConfig: {
        Binds: opts.binds || [], // e.g. ["/host/path:/container/path"]
        PortBindings: opts.portBindings || {}, // e.g. { "3000/tcp": [{ "HostPort": "3000" }] }
      },
    });

    log.log(`✅ Container "${opts.name}" created successfully`);
    return container;
  } catch (err) {
    log.error(`❌ Error creating container:`, err.message);
    throw err;
  }
};

/**
 * Delete a container by name
 */
const deleteContainer = async (containerName) => {
  try {
    const container = docker.getContainer(containerName);
    await container.remove({ force: true });
    log.log(`🗑️  Container "${containerName}" removed`);
  } catch (err) {
    log.error(`❌ Error removing container "${containerName}":`, err.message);
  }
};

/**
 * Start a container by name
 */
const startTheWorkspace = async (containerName) => {
  try {
    const container = docker.getContainer(containerName);
    const data = await container.inspect();

    if (data.State.Running) {
      log.log(`⚡ Container "${containerName}" is already running`);
      return;
    }

    await container.start();
    log.log(`🚀 Container "${containerName}" started`);
  } catch (error) {
    log.error(`❌ Error starting container "${containerName}":`, error.message);
  }
};

/**
 * Stop a container by name
 */
const stopContainer = async (containerName) => {
  try {
    const container = docker.getContainer(containerName);
    await container.stop();
    log.log(`🛑 Container "${containerName}" stopped`);
  } catch (err) {
    log.error(`❌ Error stopping container "${containerName}":`, err.message);
  }
};

/**
 * Inspect a container for detailed properties
 */
const containerProperties = async (containerName) => {
  try {
    const container = docker.getContainer(containerName);
    const data = await container.inspect();

    return {
      id: data.Id,
      name: data.Name.replace(/^\//, ""),
      image: data.Config.Image,
      state: data.State.Status, // running, exited, paused
      ports: data.NetworkSettings.Ports,
      mounts: data.Mounts,
    };
  } catch (error) {
    log.error(`❌ Error inspecting container "${containerName}":`, error.message);
    return null;
  }
};

/**
 * Attach interactive terminal to a container (like docker exec -it)
 */
const getInteractiveTerminal = async (containerName, cmd = ["/bin/bash"]) => {
  try {
    const container = docker.getContainer(containerName);

    // Create exec instance
    const exec = await container.exec({
      Cmd: cmd,
      AttachStdout: true,
      AttachStderr: true,
      AttachStdin: true,
      Tty: true,
    });

    const stream = await exec.start({ hijack: true, Tty: true });

    // You can now pipe this stream to WebSocket / xterm.js in frontend
    container.modem.demuxStream(stream, process.stdout, process.stderr);

    log.log(`📟 Attached interactive terminal to "${containerName}"`);
    return stream;
  } catch (err) {
    log.error(`❌ Error getting terminal for "${containerName}":`, err.message);
  }
};


async function streamContainerStats(containerId, socket) {
  const container = docker.getContainer(containerId);

  const statsStream = await container.stats({ stream: true });

  statsStream.on("data", (data) => {
    const stats = JSON.parse(data.toString());

    // CPU %
    const cpuDelta =
      stats.cpu_stats.cpu_usage.total_usage -
      stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta =
      stats.cpu_stats.system_cpu_usage -
      stats.precpu_stats.system_cpu_usage;

    let cpuPercent = 0.0;
    if (systemDelta > 0.0 && cpuDelta > 0.0) {
      const cpuCores =
        stats.cpu_stats.online_cpus ||
        stats.cpu_stats.cpu_usage.percpu_usage.length;
      cpuPercent = (cpuDelta / systemDelta) * cpuCores * 100.0;
    }

    // Memory %
    const memUsage = stats.memory_stats.usage;
    const memLimit = stats.memory_stats.limit;
    const memPercent = (memUsage / memLimit) * 100.0;

    socket.emit("resource", {
      type: "usage",
      data: {
        cpu: {
          percent: parseFloat(cpuPercent.toFixed(2))
        },
        memory: {
          used: parseFloat((memUsage / 1024 / 1024).toFixed(2)), // MB
          limit: parseFloat((memLimit / 1024 / 1024).toFixed(2)), // MB
          percent: parseFloat(memPercent.toFixed(2))
        },
        network: stats.networks
      }
    });


    log.log(`Container: ${containerId}`);
    log.log(`CPU: ${cpuPercent.toFixed(2)}%`);
    log.log(
      `Memory: ${(memUsage / 1024 / 1024).toFixed(2)} MB / ${(memLimit / 1024 / 1024).toFixed(2)} MB (${memPercent.toFixed(2)}%)`
    );
    log.log("Network:", stats.networks);
  });

  statsStream.on("error", (err) => {
    log.error("Error streaming stats:", err);
  });
}

// Example usage



subscribeToExpiryEvents(stopContainer)

module.exports = {
  createContainer,
  deleteContainer,
  startTheWorkspace,
  stopContainer,
  containerProperties,
  getInteractiveTerminal,
  streamContainerStats
};
