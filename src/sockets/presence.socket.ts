import { Server, Socket } from "socket.io";

interface OnlineUser {
  userId: string;
  username: string;
  socketId: string;
}

interface TypingData {
  roomId: string;
}

interface SocketResponse {
  success: boolean;
  users?: OnlineUser[];
  error?: string;
}

// In-memory online users tracker.
// Replace with Redis in production.
const onlineUsers = new Map<string, OnlineUser>();

/**
 * Initialize presence socket event handlers.
 *
 * @param io - Socket.IO server instance.
 * @param socket - Connected client socket.
 */
const initPresenceSocket = (io: Server, socket: Socket): void => {
  /**
   * Event: mark-online
   *
   * Marks the authenticated user as online.
   * Since the user has already been authenticated by the socket middleware,
   * we use the values stored on the socket instead of trusting client data.
   */
  socket.on("mark-online", (callback?: (res: SocketResponse) => void) => {
    try {
      if (!socket.userId || !socket.username) {
        callback?.({
          success: false,
          error: "Unauthenticated user.",
        });
        return;
      }

      onlineUsers.set(socket.id, {
        userId: socket.userId,
        username: socket.username,
        socketId: socket.id,
      });

      console.log(`${socket.username} is now online.`);

      // Broadcast updated online users list
      io.emit("users-online", Array.from(onlineUsers.values()));

      callback?.({
        success: true,
      });
    } catch (error) {
      console.error(
        `Error marking user online: ${
          error instanceof Error ? error.message : String(error)
        }`
      );

      callback?.({
        success: false,
        error: "Internal server error.",
      });
    }
  });

  /**
   * Event: typing
   *
   * Notify other users in the room that this user is typing.
   */
  socket.on("typing", (data: TypingData) => {
    try {
      socket.to(data.roomId).emit("user-typing", {
        userId: socket.userId,
        username: socket.username,
      });
    } catch (error) {
      console.error(
        `Error handling typing event: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  });

  /**
   * Event: stop-typing
   *
   * Notify other users in the room that this user stopped typing.
   */
  socket.on("stop-typing", (data: TypingData) => {
    try {
      socket.to(data.roomId).emit("user-stop-typing", {
        userId: socket.userId,
        username: socket.username,
      });
    } catch (error) {
      console.error(
        `Error handling stop-typing event: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  });

  /**
   * Event: disconnect
   *
   * Remove the user from the online users list and notify clients.
   */
  socket.on("disconnect", () => {
    try {
      const user = onlineUsers.get(socket.id);

      if (!user) return;

      onlineUsers.delete(socket.id);

      console.log(`${user.username} is now offline.`);

      // Broadcast updated online users list
      io.emit("users-online", Array.from(onlineUsers.values()));

      // Notify clients that the user went offline
      io.emit("user-offline", {
        userId: user.userId,
        username: user.username,
      });
    } catch (error) {
      console.error(
        `Error handling disconnect: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  });

  /**
   * Event: get-online-users
   *
   * Return the current list of online users.
   */
  socket.on(
    "get-online-users",
    (callback?: (res: SocketResponse) => void) => {
      try {
        callback?.({
          success: true,
          users: Array.from(onlineUsers.values()),
        });
      } catch (error) {
        console.error(
          `Error getting online users: ${
            error instanceof Error ? error.message : String(error)
          }`
        );

        callback?.({
          success: false,
          error: "Internal server error.",
        });
      }
    }
  );
};

export default initPresenceSocket;