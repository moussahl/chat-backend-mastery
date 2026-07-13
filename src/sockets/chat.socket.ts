import { Server, Socket } from "socket.io";
import { saveMessage } from "../models/messages/message.service";
import { isRoomMember } from "../models/rooms/room.service";

interface SendMessageData {
  roomId: string;
  content: string;
}

interface SocketResponse {
  success: boolean;
  message?: unknown;
  error?: string;
}

/**
 * Initialize chat socket event handlers.
 *
 * @param io - Socket.IO server instance.
 * @param socket - Connected client socket.
 */
const initChatSocket = (io: Server, socket: Socket): void => {
  /**
   * Event: join-room
   *
   * Allows an authenticated user to join a room after verifying
   * that they are a member of that room.
   */
  socket.on(
    "join-room",
    async (roomId: string, callback?: (response: SocketResponse) => void) => {
      try {
        // Ensure the user is authenticated
        if (!socket.userId || !socket.username) {
          console.log(`Unauthenticated join attempt for room ${roomId}.`);

          callback?.({
            success: false,
            error: "Unauthenticated user.",
          });

          return;
        }

        // Verify room membership
        const member = await isRoomMember(socket.userId, roomId);

        if (!member) {
          console.log(
            `User ${socket.username} attempted to join room ${roomId} without permission.`,
          );

          callback?.({
            success: false,
            error: "You are not a member of this room.",
          });

          return;
        }

        // Join the Socket.IO room
        socket.join(roomId);

        console.log(`User ${socket.username} joined room ${roomId}.`);

        // Notify other users in the room
        socket.to(roomId).emit("user-joined", {
          userId: socket.userId,
          username: socket.username,
          timestamp: new Date().toISOString(),
        });

        callback?.({
          success: true,
        });
      } catch (error) {
        console.log(
          `Error joining room: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );

        callback?.({
          success: false,
          error: "Internal server error.",
        });
      }
    },
  );

  /**
   * Event: send-message
   *
   * Saves a new message and broadcasts it to every client
   * currently connected to the room.
   */
  socket.on(
    "send-message",
    async (
      data: SendMessageData,
      callback?: (response: SocketResponse) => void,
    ) => {
      try {
        const { roomId, content } = data;

        // Validate payload
        if (!roomId || !content.trim()) {
          callback?.({
            success: false,
            error: "roomId and content are required.",
          });

          return;
        }

        // Ensure the user is authenticated
        if (!socket.userId || !socket.username) {
          callback?.({
            success: false,
            error: "Unauthenticated user.",
          });

          return;
        }

        // Ensure the user belongs to the room
        const member = await isRoomMember(socket.userId, roomId);

        if (!member) {
          callback?.({
            success: false,
            error: "You are not a member of this room.",
          });

          return;
        }

        // Save the message
        const savedMessage = await saveMessage(socket.userId, roomId, {
          content: content.trim(),
          type: "text",
        });

        console.log(`Message sent in room ${roomId} by ${socket.username}.`);

        // Broadcast to everyone in the room, including the sender
        io.to(roomId).emit("message-received", savedMessage);

        callback?.({
          success: true,
          message: savedMessage,
        });
      } catch (error) {
        console.log(
          `Error sending message: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );

        callback?.({
          success: false,
          error: "Internal server error.",
        });
      }
    },
  );

  /**
   * Event: leave-room
   *
   * Removes the user from a Socket.IO room and notifies
   * the remaining connected members.
   */
  socket.on(
    "leave-room",
    (roomId: string, callback?: (response: SocketResponse) => void) => {
      try {
        socket.leave(roomId);

        console.log(`User ${socket.username} left room ${roomId}.`);

        // Notify the remaining users
        socket.to(roomId).emit("user-left", {
          userId: socket.userId,
          username: socket.username,
          timestamp: new Date().toISOString(),
        });

        callback?.({
          success: true,
        });
      } catch (error) {
        console.log(
          `Error leaving room: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );

        callback?.({
          success: false,
          error: "Internal server error.",
        });
      }
    },
  );
};

export default initChatSocket;
