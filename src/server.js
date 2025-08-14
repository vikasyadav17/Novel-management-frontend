import express from "express";
import logger from "./utils/serverLogger.js";
import bodyParser from "body-parser";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(bodyParser.json());

// Example route
app.get("/api/novels", (req, res) => {
  logger.info("GET /api/novels - Fetching novels");
  res.json({ message: "Novels fetched successfully" });
});

// API endpoint to receive logs from the frontend
app.post("/api/logs", (req, res) => {
  const { level, message } = req.body;
  if (logger[level]) {
    logger[level](message); // Log the message using the appropriate log level
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ error: "Invalid log level" });
  }
});

// Error handling
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
