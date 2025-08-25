import Docker from "dockerode";
import fs from "fs";
import path from "path";
import os from 'os'
const docker = new Docker(
  os.platform() === 'win32'
    ? { socketPath: '//./pipe/docker_engine' } // Windows named pipe
    : { socketPath: '/var/run/docker.sock' }   // Linux/macOS
);

// 1. Setup test dir on host
const serviceName = "runtime-71568a0116d0e75a";
const hostBasePath = "C:/Users/Karunya Kumar/projects/Cloud-IDE/mount";
const hostPath = path.join(hostBasePath, serviceName);

// Ensure dir + file exist
if (!fs.existsSync(hostPath)) {
  fs.mkdirSync(hostPath, { recursive: true });
}
fs.writeFileSync(path.join(hostPath, "hello.txt"), "Hello from host\n");

// 2. Run container with bind mount
const run = async () => {
  const container = await docker.createContainer({
    Image: "node-runtime:latest", // lightweight image
    Tty: true,
    HostConfig: {
      Binds: [
        // Try with //c/... if C:/... doesn’t work
        `//c/Users/Karunya Kumar/projects/Cloud-IDE/mount/${serviceName}:/app`
      ]
    }
  });

  await container.start();

  // 3. Exec to list files inside container
  const exec = await container.exec({
    Cmd: ["ls", "-la", "/app"],
    AttachStdout: true,
    AttachStderr: true
  });

  const stream = await exec.start({});
  stream.on("data", (chunk) => {
    console.log(chunk.toString());
  });

  // Cleanup after 5s
  setTimeout(async () => {
    await container.stop();
    await container.remove();
  }, 5000);
};

run().catch(console.error);
