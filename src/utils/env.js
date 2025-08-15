// Centralized environment variable handling
const env = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/novels",
  IS_DEVELOPMENT: import.meta.env.MODE === "development",
  IS_PRODUCTION: import.meta.env.MODE === "production",
};

// Log environment configuration during startup
console.log("Environment configuration:", {
  mode: import.meta.env.MODE,
  apiBaseUrl: env.API_BASE_URL,
  isDevelopment: env.IS_DEVELOPMENT,
});

export default env;
