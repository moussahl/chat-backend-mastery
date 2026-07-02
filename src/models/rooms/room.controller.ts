import { Request, Response } from "express";
import * as userService from "./room.service";
import catchAsync from "../../utils/catchAsync";
import AppError from "../../utils/AppError";

//create room
export const creeateRoom = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const data = req.body;

  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const room = await userService.createRoom(userId, data);

  res.status(201).json({
    success: true,
    message: "Room created successfully",
    data: room,
  });
});

// list all rooms where user is member

export const listUserRooms = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const roomMembership = await userService.listUserRooms(userId, page, limit);

  res.status(200).json({
    success: true,
    roomMembership,
  });
});


