import { Server, Socket } from "socket.io";
import { getRoomById } from "../models/rooms/room.service";
import { isRoomMember } from "../models/rooms/room.service";

/**
 * Initialize chat handlers
 * @param {Object} io -  Socket.IO Instance
 * @param {Object} socket - Socket client
 */

const initChatSocket = (io: Server, socket: Socket): void => {
  /**
   * Event: join-room
   * user join room
   */
  socket.on("join-room", async (roomId: string, callback) => {
    try {
      // Validate if the user is authenticated
      if (!socket.userId) {
        console.log(
          `Invalid room join attempt. RoomId: ${roomId}, UserId: ${socket.userId}`,
        );
        if (callback)
          callback({
            success: false,
            error: "Invalid request or unauthenticated user",
          });
        return;
      }
      // Verify that the user is a member of the room

      const isMember = await isRoomMember(socket.userId, roomId);

      if (!isMember) {
        console.log(
          `User ${socket.username} attempted unauthorized access to room ${roomId}`,
        );
        if (callback)
          return callback({
            success: false,
            error: "Unauthorized: Not a member of this room",
          });
        return;
      }

      //  Join the socket room
      socket.join(roomId);
      console.log(`User ${socket.username} joined room ${roomId}`);

      // Notify other users in the room
      socket.to(roomId).emit("user-joined", {
        userId: socket.userId,
        username: socket.username,
        timestamp: new Date().toISOString(),
      });

      //  Acknowledge success to the client
      if (callback) callback({ success: true });
    } catch (error: any) {
      console.log(`Error joining room: ${error.message}`);
      if (callback)
        callback({ success: false, error: "Internal server error" });
    }
  });
};

export default initChatSocket;
