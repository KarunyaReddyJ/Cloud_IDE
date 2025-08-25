// logger.js
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m"
};

const environment = process.env.NODE_ENV || "development";

const timestamp = () => new Date().toISOString();
const formatArgs = (args) =>
  args.map(arg => typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg);

function patchConsole(method, label, color, show = true) {
  const original = console[method];
  console[method] = (...args) => {
    if (!show) return;
    original(
      color,
      `[${label}] ${timestamp()}`,
      colors.reset,
      ...formatArgs(args)
    );
  };
}

// Patch global console
patchConsole("log", "INFO", colors.green);
patchConsole("info", "INFO", colors.green);
patchConsole("warn", "WARN", colors.yellow);
patchConsole("error", "ERROR", colors.red);
patchConsole("debug", "DEBUG", colors.blue, environment === "development");

// Per-module logger factory
function Logger(moduleName) {
  return {
    info: (...args) => console.info(`[${moduleName}]`, ...args),
    debug: (...args) => console.debug(`[${moduleName}]`, ...args),
    log:   (...args) => console.log(`[${moduleName}]`, ...args),
    error: (...args) => console.error(`[${moduleName}]`, ...args),
    warn:  (...args) => console.warn(`[${moduleName}]`, ...args),
  };
}

module.exports = { Logger };
