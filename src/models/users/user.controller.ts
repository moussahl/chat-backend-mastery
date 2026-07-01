import { NextFunction, Request, Response } from "express";
import AppError from "../../utils/AppError";
import { TokenPayload, verifyToken } from "../../utils/token";
import catchAsync from "../../utils/catchAsync";

import * as userService from "./user.service";

// authMiddleware to get token
export const authMiddleware = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError("Invalid token format", 401);
    }

    // verify token
    const decoded = verifyToken(token);

    (req as any).user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    } as TokenPayload;

    console.log(`✅ User authenticated: ${decoded.id}`);
    next();
  },
);

// get current user info
export const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const user = await userService.getMe(userId);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// update user profile
export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
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
  const userId = (req as any).user.id;
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


