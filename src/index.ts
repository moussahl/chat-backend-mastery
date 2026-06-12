import express from "express";
const app = express();

require("dotenv").config();

import { connectToDB } from "./config/db.config";

const PORT = process.env.PORT || 5000;

app.use(express.json());

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
