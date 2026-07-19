//  Environment Configuration (Must be at the very top to load variables early)
require("dotenv").config();

// Third-Party / Core Dependencies
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helemt from "helmet";
import morgan from "morgan";



//  Custom Application Middlewares
import protect from "./middlewares/auth.middleware";
import errorHandler from "./middlewares/error.middleware";

//  Application Routes
import authRoutes from "./models/auth/auth.routes";
import userRoutes from "./models/users/user.routes";
import roomRoutes from "./models/rooms/room.routes";
import { directMessageRouter } from "./models/messages/message.routes"



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

app.get("/api/v1/health", (req: Request, res: Response) => {
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
app.use("/api/v1/auth", authRoutes); //public

// protect everything else under /api/v1
app.use("/api/v1", protect);

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/rooms", roomRoutes);
app.use("/api/v1/messages", directMessageRouter);
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



export default app;
