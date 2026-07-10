import { Response, NextFunction } from "express";
import messageService from "./message.service"; // Adjust import path to your service file
import AppError from "../../utils/AppError";
import catchAsync from "../../utils/catchAsync"; // Adjust import path to your catchAsync wrapper
import {
  SaveMessageRequest,
  GetHistoryRequest,
  GetMessageRequest,
  DeleteMessageRequest,
  MarkReadRequest,
  UnreadCountRequest,
  SearchMessagesRequest,
} from "./message.interfaces"

/**
 * @desc    Save and broadcast a new message inside a chat room
 * @route   POST /api/rooms/:roomId/messages
 * @access  Private
 */
export const saveMessage = catchAsync(async (req: SaveMessageRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const { roomId } = req.params;
  const { content, type } = req.body;

  if (!userId) return next(new AppError("Authentication required", 401));
  if (!content) return next(new AppError("Message content cannot be empty", 400));

  const message = await messageService.saveMessage(userId, roomId, { content, type });

  res.status(201).json({
    success: true,
    data: message,
  });
});

/**
 * @desc    Retrieve chat history for a room with reverse-chronological pagination
 * @route   GET /api/rooms/:roomId/messages
 * @access  Private
 */
export const getHistory = catchAsync(async (req: GetHistoryRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const { roomId } = req.params;
  
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;

  if (!userId) return next(new AppError("Authentication required", 401));

  const history = await messageService.getHistory(userId, roomId, page, limit);

  res.status(200).json({
    success: true,
    ...history,
  });
});

/**
 * @desc    Retrieve a single message entity details by ID
 * @route   GET /api/messages/:messageId
 * @access  Private
 */
export const getMessageById = catchAsync(async (req: GetMessageRequest, res: Response, next: NextFunction) => {
  const { messageId } = req.params;

  const message = await messageService.getMessageById(messageId);

  res.status(200).json({
    success: true,
    data: message,
  });
});

/**
 * @desc    Delete a message record (Restricted to message author or room creator)
 * @route   DELETE /api/messages/:messageId
 * @access  Private
 */
export const deleteMessage = catchAsync(async (req: DeleteMessageRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const { messageId } = req.params;

  if (!userId) return next(new AppError("Authentication required", 401));

  await messageService.deleteMessage(messageId, userId);

  res.status(200).json({
    success: true,
    message: "Message successfully deleted",
  });
});

/**
 * @desc    Mark unread messages as read and bump user membership read timestamps
 * @route   PATCH /api/rooms/:roomId/messages/read
 * @access  Private
 */
export const markMessagesAsRead = catchAsync(async (req: MarkReadRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const { roomId } = req.params;

  if (!userId) return next(new AppError("Authentication required", 401));

  const result = await messageService.markMessagesAsRead(userId, roomId);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * @desc    Calculate total unread messages for a room relative to user's last tracking date
 * @route   GET /api/rooms/:roomId/unread-count
 * @access  Private
 */
export const getUnreadCount = catchAsync(async (req: UnreadCountRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const { roomId } = req.params;

  if (!userId) return next(new AppError("Authentication required", 401));

  const unreadCount = await messageService.getUnreadCount(userId, roomId);

  res.status(200).json({
    success: true,
    data: { unreadCount },
  });
});

/**
 * @desc    Search message content indices within a specific room
 * @route   GET /api/rooms/:roomId/messages/search
 * @access  Private
 */
export const searchMessages = catchAsync(async (req: SearchMessagesRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const { roomId } = req.params;
  const query = req.query.q || "";
  
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;

  if (!userId) return next(new AppError("Authentication required", 401));
  if (!query.trim()) return next(new AppError("Search query string 'q' is required", 400));

  const results = await messageService.searchMessages(userId, roomId, query, page, limit);

  res.status(200).json({
    success: true,
    ...results,
  });
});