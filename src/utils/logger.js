import log from "loglevel";

log.setLevel("info"); // Set the default log level (e.g., "info", "warn", "error")

// Add a custom method to log messages with timestamps
const originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel, loggerName) {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);
  return function (...messages) {
    const timestamp = new Date().toISOString();
    rawMethod(`[${timestamp}] ${methodName.toUpperCase()}:`, ...messages);
  };
};
log.setLevel(log.getLevel()); // Apply the custom method factory

export default log;
