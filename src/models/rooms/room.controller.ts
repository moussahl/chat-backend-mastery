import { Request, Response } from "express";
import * as userService from "./room.service";
import catchAsync from "../../utils/catchAsync";
import AppError from "../../utils/AppError";

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
