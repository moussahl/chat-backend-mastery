import express, { Request, Response, NextFunction } from "express";
const app = express();

require("dotenv").config();

import { connectToDB } from "./config/db.config";

import authRoutes from "./models/auth/auth.routes";

import errorHandler from "./middlewares/error.middleware";

const PORT = process.env.PORT || 5000;

app.use(express.json());



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
