import { NextFunction } from "express";
import { Socket } from "socket.io";
import { verifyToken } from "../utils/token";
import AppError from "../utils/AppError";

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: Error) => void,
): void => {
  try {
    // get token
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    //verify token in it is valid
    const decoded = verifyToken(token);

    socket.userId = decoded.id;
    socket.username = decoded.username;

    console.log(
      `Socket authenticated: ${socket.id} (user: ${decoded.username})`,
    );

    next();
  } catch (error) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error("Authentication failed"));
    }
  }
};
