import { RoomMember } from "../rooms/roomMember.model";
import { isRoomMember } from "../rooms/room.service";
import AppError from "../../utils/AppError";
import { Room } from "../rooms/room.model";
import { Message } from "./message.models";
import { Types } from "mongoose";

// Save new message

export const saveMessage = async (
  senderId: string,
  roomId: string,
  data: {
    content: string;
    type?: "text" | "image" | "file" | "system";
  },
) => {
  // Verify if the user is room member
  const isMember = isRoomMember(senderId, roomId);
  if (!isMember) {
    throw new AppError("You are not a member of this room", 403);
  }

  // verify if the room exist
  const room = await Room.findById(roomId);
  if (!room) {
    throw new AppError("Room not found", 404);
  }

  // Create message

  const message = await Message.create({
    sender: new Types.ObjectId(senderId),
    room: new Types.ObjectId(roomId),
    content: data.content.trim(),
    type: data.type || "text",
    isRead: false,
  });

  await message.save();

  // populate the sender
  await message.populate("sender", "username  status");

  // update lastActivity and lastMessage
  await Room.findByIdAndUpdate(roomId, {
    lastActivity: new Date(),
    lastMessage: data.content.substring(0, 100),
  });

  console.log(`✅ Message saved: ${message._id} in room ${roomId}`);
  return message;
};

// Retrieve message history with pagination

// Get message with ID

// Delete message ( only by sender or admin room)

// Mark messages as read

// Get unread messages from a room

// Delete all messages from a room (when the room is deleted)

// Search for messages in a room.

// export all services
