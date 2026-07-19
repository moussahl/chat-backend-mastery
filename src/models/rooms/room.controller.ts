import { Request, Response, NextFunction } from "express";
import * as roomService from "./room.service";
import catchAsync from "../../utils/catchAsync";
import AppError from "../../utils/AppError";
import { 
  CreateRoomRequest, 
  ListUserRoomsRequest, 
  RoomParamsRequest, 
  JoinRoomRequest, 
  QuitRoomRequest, 
  GetRoomMembersRequest 
} from "./room.interfaces";

/**
 * @desc    Create a new chat room and automatically join the creator as an admin
 * *route   POST /api/rooms
 * @access  Private
 */
export const creeateRoom = catchAsync(async (req: CreateRoomRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const data = req.body;

  if (!userId) {
    return next(new AppError("Authentication required", 401));
  }

  const room = await roomService.createRoom(userId, data);

  res.status(201).json({
    success: true,
    message: "Room created successfully",
    data: room,
  });
});

/**
 * @desc    List all chat rooms that the authenticated user is a member of (with pagination)
 * @route   GET /api/rooms
 * @access  Private
 */
export const listUserRooms = catchAsync(async (req: ListUserRoomsRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  if (!userId) {
    return next(new AppError("Authentication required", 401));
  }

  const rooms = await roomService.listUserRooms(userId, page, limit);

  res.status(200).json({
    success: true,
    data: rooms,
  });
});

/**
 * @desc    Retrieve details and member count of a specific room by its ID
 * @route   GET /api/rooms/:roomId
 * @access  Private
 */
export const getRoomById = catchAsync(async (req: RoomParamsRequest, res: Response, next: NextFunction) => {
  const { roomId } = req.params;

  if (!roomId) {
    return next(new AppError("Room ID is required", 400));
  }

  const room = await roomService.getRoomById(roomId);

  res.status(200).json({
    success: true,
    data: room,
  });
});

/**
 * @desc    Join an existing chat room as a standard member
 * @route   POST /api/rooms/join
 * @access  Private
 */
export const joinRoom = catchAsync(async (req: JoinRoomRequest, res: Response, next: NextFunction) => {
  const { roomId } = req.body;
  const userId = req.user?.id;

  if (!roomId || !userId) {
    return next(new AppError("Room ID and user authentication are required", 400));
  }
  
  const roomMember = await roomService.joinRoom(userId, roomId);
  
  res.status(200).json({
    success: true,
    data: roomMember,
  });
});

/**
 * @desc    Leave a chat room and trigger cleanups if no admins remain
 * @route   POST /api/rooms/quit
 * @access  Private
 */
export const quitRoom = catchAsync(async (req: QuitRoomRequest, res: Response, next: NextFunction) => {
  const { roomId } = req.body;
  const userId = req.user?.id;

  if (!roomId || !userId) {
    return next(new AppError("Room ID and user authentication are required", 400));
  }

  const membership = await roomService.leaveRoom(userId, roomId);

  res.status(200).json({
    success: true,
    message: `User with ID: ${userId} has successfully quit from Room with ID ${roomId}`,
    data: membership,
  });
});

/**
 * @desc    Delete an entire chat room and remove all member associations (Restricted to Room Admins)
 * @route   DELETE /api/rooms/:roomId
 * @access  Private
 */
export const deleteRoom = catchAsync(async (req: RoomParamsRequest, res: Response, next: NextFunction) => {
  const { roomId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return next(new AppError("Authentication required", 401));
  }

  const result = await roomService.deleteRoom(roomId, userId);

  res.status(200).json({
    success: true,
    result,
  });
});

/**
 * @desc    Get a paginated list of all members registered to a specific room
 * @route   GET /api/rooms/:roomId/members
 * @access  Private
 */
export const getRoomMembers = catchAsync(async (req: GetRoomMembersRequest, res: Response, next: NextFunction) => {
  const { roomId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 50;

  const members = await roomService.getRoomMembers(roomId, page, limit);

  res.status(200).json({
    success: true,
    data: members,
  });
});

/**
 * @desc    Check if the currently authenticated user is a registered member of a specific room
 * @route   GET /api/rooms/:roomId/is-member
 * @access  Private
 */
export const isRoomMember = catchAsync(async (req: RoomParamsRequest, res: Response, next: NextFunction) => {
  const { roomId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return next(new AppError("Authentication required", 401));
  }

  const isMember = await roomService.isRoomMember(userId, roomId);

  res.status(200).json({
    success: true,
    data: {
      isMember,
    },
  });
});