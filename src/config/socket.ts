// configuration and initialisation Socket.IO

import { Server, Socket } from "socket.io";
import {socketAuthMiddleware} from "../sockets/socket.middleware";
import initChatSocket from "../sockets/chat.socket";
import initPresenceSocket from "../sockets/presence.socket";

/**
 * Initialize Socket.IO with middlewares and handlers
 * @param {Object} io - Instance Socket.IO
 * */

export const initSocket = (io: Server) => {
  // Authentification middleware for Socket.IO
  io.use(socketAuthMiddleware);

  // New connection
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // initialize handlers
    initChatSocket(io, socket);
    initPresenceSocket(io, socket);
  });



};
