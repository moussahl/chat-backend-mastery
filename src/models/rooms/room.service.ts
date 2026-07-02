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
};


