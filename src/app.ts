// 1. Environment Configuration (Must be at the very top to load variables early)
require("dotenv").config();

// 2. Third-Party / Core Dependencies
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helemt from "helmet";
import morgan from "morgan";

// 3. Database & Infrastructure Configuration
import { connectToDB } from "./config/db.config";

// 4. Custom Application Middlewares
import errorHandler from "./middlewares/error.middleware";

// 5. Application Routes
import authRoutes from "./models/auth/auth.routes";

// 6. Constants & Configurations
const PORT = process.env.PORT || 5000;

// create Express application
const app = express();

// ============================================
// Security Middleware
// ============================================

// Helemet: secure the HTTP headers
app.use(helemt());

// CORS: authorize cross-origin requests
app.use(
  cors({
    origin: process.env.CLIENT_URL, // modify later
    credentials:
      process.env.CREDENTIALS === "true" ||
      process.env.CREDENTIALS === "1" ||
      false, // modify later
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ============================================
//  LOGGING MIDDLEWARES
// ============================================

// Morgan : request HTTP logger
const morganFormat =
  process.env.MORGANFORMAT === "production" ? "combined" : "dev";

app.use(morgan(morganFormat));

// ============================================
// MIDDLEWARES DE PARSING
// ============================================

// JSON Parser
app.use(express.json({ limit: "10kb" }));

//URL-encoded Parser
app.use(express.urlencoded({ limit: "10kb", extended: true }));

// ============================================
// HEALTH ROUTES (for monitoring)
// ============================================

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "Ok",
    timeStamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

app.get("api/v1/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// APPLICATION ROUTES
// ============================================

//auth route
app.use("/api/v1/auth", authRoutes);

// ============================================
//  404 MIDDLEWARE - Not found Routes
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server!`,
    status: 404,
  });
});

// Error handler - MUST be last
app.use(errorHandler);

// start

const startServer = async () => {
  try {
    await connectToDB();
    app.listen(PORT, () => {
      console.log(`Server has started on ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
