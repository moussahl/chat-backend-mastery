import { RoomMember } from "../rooms/roomMember.model";
import { isRoomMember } from "../rooms/room.service";
import AppError from "../../utils/AppError";
import { Room } from "../rooms/room.model";
import { IMessage, Message } from "./message.models";
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

export const getHistory = async (
  userId: string,
  roomId: string,
  page = 1,
  limit = 50,
) => {
  // Parameter validation
  if (page < 1 || limit < 1) {
    throw new AppError("Page and limit must be positive numbers", 400);
  }

  if (limit > 100) {
    throw new AppError("Limit cannot exceed 100", 400);
  }

  // Verify if the room exists
  const room = await Room.findById(roomId);
  if (!room) {
    throw new AppError("Room not found", 404);
  }

  // Verify if the user is room member
  const isMember = isRoomMember(userId, roomId);
  if (!isMember) {
    throw new AppError("You are not a member of this room", 403);
  }

  // Calculate the skip
  const skip = (page - 1) * limit;

  // Get messages
  const messages = await Message.find({
    room: new Types.ObjectId(roomId),
  })
    .populate("sender", "username avatar status")
    .sort({ createdAt: -1 }) // Most messages  recent first
    .skip(skip)
    .limit(limit)
    .lean();

  // Inverse for get in chronological order
  messages.reverse();

  // Count totla messages number
  const total = await Message.countDocuments({
    room: new Types.ObjectId(roomId),
  });

  console.log(
    `✅ Messages history fetched for room ${roomId}: ${messages.length} messages`,
  );

  return {
    data: messages,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasMore: page < Math.ceil(total / limit),
    },
    room: {
      _id: room._id,
      name: room.name,
      type: room.type,
    },
  };
};
// Get message by ID

export const getMessageById = async (messageId: string): Promise<IMessage> => {
  const message = await Message.findById(messageId).populate(
    "sender",
    "username  status",
  );

  if (!message) {
    throw new AppError("Message not found", 404);
  }

  console.log(`✅ Message fetched: ${messageId}`);

  return message;
};

// Delete message (only by sender or admin room)
export const deleteMessage = async (
  messageId: string,
  userId: string,
): Promise<void> => {
  // Fetch the message and ensure it exists
  const message = await Message.findById(messageId);

  if (!message) {
    throw new AppError("Message not found", 404);
  }

  // Identify if the current user is the author/sender
  const isSender = message.sender.toString() === userId;

  const room = await Room.findById(message.room);

  // Identify if the current user is the room creator (admin)
  const isAdmin = room && room.createdBy.toString() === userId;

  //  Block the request if they are neither
  if (!isSender && !isAdmin) {
    throw new AppError("You are not authorized to delete this message", 403);
  }

  await Message.findByIdAndDelete(messageId);

  console.log(`✅ Message deleted: ${messageId}`);
};

// Mark messages as read

// Get unread messages from a room

// Delete all messages from a room (when the room is deleted)

// Search for messages in a room.

// export all services
