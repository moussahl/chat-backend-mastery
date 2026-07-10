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

export const markMessagesAsRead = async (
  userId: string,
  roomId: string,
): Promise<{ modifiedCount: number }> => {
  // Verify membership
  const isMember = await isRoomMember(userId, roomId);

  if (!isMember) {
    throw new AppError("You are not a member of this room", 403);
  }

  // marked messages as read
  const result = await Message.updateMany(
    {
      room: new Types.ObjectId(roomId),
      isRead: false,
    },
    {
      isRead: true,
    },
  );

  // update lastReadAt in RoomMember
  await RoomMember.findOneAndUpdate(
    {
      userId: new Types.ObjectId(userId),
      roomId: new Types.ObjectId(roomId),
    },
    {
      lastReadAt: new Date(),
    },
  );

  console.log(
    `✅ Messages marked as read in room ${roomId}: ${result.modifiedCount} messages`,
  );

  return {
    modifiedCount: result.modifiedCount,
  };
};

// Get unread messages from a room
export const getUnreadCount = async (
  userId: string,
  roomId: string,
): Promise<number> => {
  // Retrieve the last read timestamp for the specified user in the given room
  const member = await RoomMember.findOne({
    userId: new Types.ObjectId(userId),
    roomId: new Types.ObjectId(roomId),
  });

  if (!member) {
    throw new AppError("You are not a member of this room", 403);
  }

  // Fallback to the Unix epoch if no last read timestamp exists
  const lastReadDate = member.lastReadAt || new Date(0);

  // Count incoming messages created after the last read date, excluding the user's own messages
  const unreadCount = await Message.countDocuments({
    room: new Types.ObjectId(roomId),
    sender: { $ne: new Types.ObjectId(userId) },
    createdAt: { $gt: lastReadDate },
  });

  return unreadCount;
};
// Delete all messages from a room (when the room is deleted)

export const deleteRoomMessages = async (roomId: string): Promise<void> => {
  const result = await Message.deleteMany({
    room: new Types.ObjectId(roomId),
  });

  console.log(`✅ Deleted ${result.deletedCount} messages from room ${roomId}`);
};

// Search for messages in a room.
export const searchMessages = async (
  userId: string,
  roomId: string,
  query: string,
  page = 1,
  limit = 20,
) => {
  // Verify membership
  const isMember = await isRoomMember(userId, roomId);

  if (!isMember) {
    throw new AppError("You are not a member of this room", 403);
  }

  const skip = (page - 1) * limit;

  // Search with regex
  const messages = await Message.find({
    room: new Types.ObjectId(roomId),
    $text: { $search: query },
  })
    .populate("sender", "username status")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Message.countDocuments({
    room: new Types.ObjectId(roomId),
    $text: { $search: query },
  });

  console.log(
    `✅ Messages searched in room ${roomId}: found ${messages.length} results`,
  );

  return {
    data: messages,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// export all services

export default {
  saveMessage,
  getHistory,
  getMessageById,
  deleteMessage,
  markMessagesAsRead,
  getUnreadCount,
  deleteRoomMessages,
  searchMessages,
};
