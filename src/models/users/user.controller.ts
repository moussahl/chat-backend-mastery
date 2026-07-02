import { NextFunction, Request, Response } from "express";
import AppError from "../../utils/AppError";
import catchAsync from "../../utils/catchAsync";

import * as userService from "./user.service";

// get current user info
export const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const user = await userService.getMe(userId);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// update user profile
export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const { username, email, avatar, status } = req.body;

  const user = await userService.updateProfile(userId, {
    username,
    email,
    avatar,
    status,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// update user status
export const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const { status } = req.body;

  if (!status) {
    throw new AppError("Status is required", 400);
  }

  const user = await userService.updateStatus(userId, status);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// get user public info
export const getUserPublicInfo = catchAsync(
  async (req: Request, res: Response) => {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;

    if (!userId) {
      throw new AppError("Invalid user ID", 400);
    }

    const user = await userService.getUserPublicInfo(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  },
);

// get all users

export const getAllusers = catchAsync(async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();

  res.status(200).json({
    success: true,
    data: users,
  });
});
