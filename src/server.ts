import http from "http";
import { Server } from "socket.io";
import app from "./app";
/* import config from './config/env'; */       // need it later
import { connectToDB } from "./config/db.config";
import { initSocket } from "./config/socket";
import "dotenv/config";

import "./types/socket.io.types";

import { instrument } from "@socket.io/admin-ui";



// Constants & Configurations
const PORT = Number(process.env.PORT) || 5000;

// ============================================
// INITIALISATION
// ============================================

let server: http.Server;

/**
 * start server */

const startServer = async () => {
  try {
    // connect to MongoDB
    await connectToDB();

    // create http server
    server = http.createServer(app);

    // initialize Socket.IO

    const io = new Server(server, {
      pingInterval: Number(process.env.SOCKET_PING_INTERVAL) || 25000,
      pingTimeout: Number(process.env.SOCKET_PING_TIMEOUT) || 60000,
       cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
    });


    instrument(io, {
  auth: {
    type: "basic",
     username: process.env.SOCKET_ADMIN_USERNAME || "admin",
    password: process.env.SOCKET_ADMIN_PASSWORD_HASH!,
  },
  mode: "development",
});

    // Attacher io in app for route access
    app.set("io", io);

    // Initialiser Initialize Socket.IO events
    console.log("Initializing Socket.IO...");
    initSocket(io);

    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   Chat App Server Started Successfully ║
╚════════════════════════════════════════╝
server has started on ${PORT}

`);
    });
  } catch (error) {
     console.log(`Failed to start server: ${error}`);
    process.exit(1);
  }
};



startServer();

