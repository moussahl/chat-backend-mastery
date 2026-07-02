import { Room } from "./room.model";
import { Types } from "mongoose";
import { RoomMember } from "./roomMember.model";

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

// list room members

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


