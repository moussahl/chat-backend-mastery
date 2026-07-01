import { Server, Socket } from "socket.io";
import { verifyToken, roleEnum, TokenPayload } from "./utils/token";
import { NextFunction } from "express";
import AppError from "./utils/AppError";

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: roleEnum;
}

// this verify token
export const initializeTokenSocket = (io: Server) => {
  try {
    //authentication middleware
    io.use((socket: Socket, next) => {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) throw new AppError("Authentication required", 401);

      const decoded = verifyToken(token);

      socket.data.user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
      } satisfies AuthenticatedUser;

      console.log(`Socket authenticated: ${socket.data.username}`);

      next();
    });
  } catch (error) {
    throw new AppError("Invalid token", 401);
  }

  //connection

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user as AuthenticatedUser;

    console.log(`✅ Socket connected: ${user.id} (${user.username})`);

    socket.on("join-room", (roomId: string, callback) => {});

    socket.on("disconnect", (reason) => {
      console.log(`❌ Socket disconnected: ${user.id} | ${reason}`);
    });
  });
};
