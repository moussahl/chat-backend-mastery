import { Request, Response } from "express";
import * as roomService from "./room.service";
import catchAsync from "../../utils/catchAsync";
import AppError from "../../utils/AppError";

//create room
export const creeateRoom = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const data = req.body;

  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const room = await roomService.createRoom(userId, data);

  res.status(201).json({
    success: true,
    message: "Room created successfully",
    data: room,
  });
});

// list all rooms where user is member

//room query interface
interface ListRoomQuery {
  page?: string;
  limit?: string;
}

export const listUserRooms = catchAsync(
  async (req: Request<{}, {}, {}, ListRoomQuery>, res: Response) => {
    const userId = req.user?.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    if (!userId) {
      throw new AppError("Not authenticated", 401);
    }

    const rooms = await roomService.listUserRooms(userId, page, limit);

    res.status(200).json({
      success: true,
      data: rooms,
    });
  },
);

// Get room by id

interface RoomParams {
  roomId: string;
}

export const getRoomById = catchAsync(
  async (req: Request<RoomParams>, res: Response) => {
    const roomId = req.params.roomId;

    if (!roomId) {
      throw new AppError("Room ID is required", 400);
    }

    const room = await roomService.getRoomById(roomId);

    res.status(200).json({
      success: true,
      data: room,
    });
  },
);

