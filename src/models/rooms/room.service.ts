import { Room } from "./room.model";
import { Types } from "mongoose";
import { RoomMember } from "./roomMember.model";
import AppError from "../../utils/AppError";

//create room
export const createRoom = async (
  creatorId: string,
  data: {
    name: string;
    type: "public" | "private";
  },
) => {
  const room = new Room({
    name: data.name,
    type: data.type,
    createdBy: new Types.ObjectId(creatorId),
  });

  await room.save();

  // add room creator as admin

  await RoomMember.create({
    userId: new Types.ObjectId(creatorId),
    roomId: room._id,
    role: "admin",
  });

  console.log(`✅ Room created: ${room._id} by ${creatorId}`);

  return room;
};

// list all rooms where user is member

export const listUserRooms = async (userId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const roomMembership = await RoomMember.find({
    userId: new Types.ObjectId(userId),
  })
    .populate({
      path: "roomId",
      select: "name type lastActivity",
      options: { sort: { lastActivity: -1 } },
    })
    .skip(skip)
    .limit(limit);

  const rooms = roomMembership.map((rm) => {
    // rm.roomId can be either a populated Room document or an ObjectId.
    // Safely call toObject if available, otherwise fall back to an object with _id.
    const roomData =
      rm.roomId && typeof (rm.roomId as any).toObject === "function"
        ? (rm.roomId as any).toObject()
        : { _id: rm.roomId };

    return {
      ...roomData,
      userRole: rm.role,
      joinedAt: rm.joinedAt,
    };
  });

  //count the total
  const total = await RoomMember.countDocuments({
    userId: new Types.ObjectId(userId),
  });

  console.log(`✅ Rooms listed for user: ${userId}`);

  return {
    data: rooms,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Get room by ID

export const getRoomById = async (roomId: string) => {
  const room = await Room.findById(roomId).populate("createdBy", "name").lean();

  if (!room) throw new AppError("Room not found", 404);

  //count members
  const membersCount = RoomMember.countDocuments({
    roomId: new Types.ObjectId(roomId),
  });

  console.log(`✅ Room fetched: ${roomId}`);

  return {
    ...room,
    membersCount,
  };
};

// Join room

export const joinRoom = async (userId: string, roomId: string) => {
  const room = await Room.findById(roomId);
  if (!roomId) throw new AppError("Room not found", 404);

  // verifiy if the user is already member
  const existingMembership = await RoomMember.findOne({
    userId: new Types.ObjectId(userId),
    roomId: new Types.ObjectId(roomId),
  });

  if (existingMembership) {
    throw new AppError("User is already a member of this room", 400);
  }

  // create membership

  const roomMember = await RoomMember.create({
    userId: new Types.ObjectId(userId),
    roomId: new Types.ObjectId(roomId),
    role: "member",
  });

  await roomMember.populate("userId", "username  status");

  console.log(`✅ User ${userId} joined room ${roomId}`);

  return roomMember;
};

// Quit room

export const leaveRoom = async (userId: string, roomId: string) => {
  const membership = await RoomMember.findOneAndDelete({
    userId: new Types.ObjectId(userId),
    roomId: new Types.ObjectId(roomId),
  });

  if (!membership) {
    throw new AppError("User is not a member of this room", 404);
  }

  // If it was the admin and there is no longer an admin, delete the room
  const adminCount = await RoomMember.countDocuments({
    roomId: new Types.ObjectId(roomId),
    role: "admin",
  });

  if (adminCount === 0) {
    await Room.findByIdAndDelete(roomId);
    console.log(`✅ Room deleted (no admins left): ${roomId}`);
  }

  console.log(`✅ User ${userId} left room ${roomId}`);

  return {
    success: true,
    message: "Left room successfully",
  };
};

// Delete room (only admin)

export const deleteRoom = async (roomId: string, userId: string) => {
  const membership = await RoomMember.findOne({
    roomId: new Types.ObjectId(roomId),
    userId: new Types.ObjectId(userId),
    role: "admin",
  });

  if (!membership) {
    throw new AppError("Only room admin can delete the room", 403);
  }

  //delete all users
  await RoomMember.deleteMany({
    roomId: new Types.ObjectId(roomId),
  });

  // delete room
  const deletedRoom = await Room.findByIdAndDelete(roomId);

  if (!deletedRoom) {
    throw new AppError("Room not found", 404);
  }

  console.log(`✅ Room deleted: ${roomId} by ${userId}`);

  return {
    success: true,
    message: "Room deleted successfully",
  };
};


