import { NextFunction, Response } from "express";
import AppError from "../../utils/AppError";
import catchAsync from "../../utils/catchAsync";
import * as userService from "./user.service";
import {
  UpdateProfileRequest,
  UpdateStatusRequest,
  GetUserPublicInfoRequest,
  BaseUserRequest,
} from "./user.interfaces"

/**
 * @desc    Get the profile information of the currently authenticated user
 * @route   GET /api/users/me
 * @access  Private
 */
export const getMe = catchAsync(async (req: BaseUserRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  if (!userId) {
    return next(new AppError("Authentication required", 401));
  }

  const user = await userService.getMe(userId);

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Update editable core details of the authenticated user's profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = catchAsync(async (req: UpdateProfileRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  if (!userId) {
    return next(new AppError("Authentication required", 401));
  }

  const { username, email, avatar, status } = req.body;

  const user = await userService.updateProfile(userId, {
    username,
    email,
    status,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Quickly toggle or update the custom availability status of the authenticated user
 * @route   PATCH /api/users/status
 * @access  Private
 */
export const updateStatus = catchAsync(async (req: UpdateStatusRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  if (!userId) {
    return next(new AppError("Authentication required", 401));
  }

  const { status } = req.body;

  if (!status) {
    return next(new AppError("Status is required", 400));
  }

  const user = await userService.updateStatus(userId, status);

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Retrieve non-sensitive, public-facing identity details of any user by ID
 * @route   GET /api/users/:userId
 * @access  Private
 */
export const getUserPublicInfo = catchAsync(async (req: GetUserPublicInfoRequest, res: Response, next: NextFunction) => {
  const userId = Array.isArray(req.params.userId)
    ? req.params.userId[0]
    : req.params.userId;

  if (!userId) {
    return next(new AppError("Invalid user ID parameter", 400));
  }

  const user = await userService.getUserPublicInfo(userId);

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Fetch a list of all registered platform users
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllusers = catchAsync(async (req: BaseUserRequest, res: Response, next: NextFunction) => {
  const users = await userService.getAllUsers();

  res.status(200).json({
    success: true,
    data: users,
  });
});