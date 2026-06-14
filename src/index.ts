import express, { Request, Response, NextFunction } from "express";

require("dotenv").config();

import { connectToDB } from "./config/db.config";

import authRoutes from "./models/auth/auth.routes";

import errorHandler from "./middlewares/error.middleware";

import helemt from "helmet";
import cors from "cors";

import morgan from "morgan";

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















app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} from ${req.url} at ${new Date().toISOString}`);
  next();
});

// routes

app.use("/api/v1/auth", authRoutes);

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
