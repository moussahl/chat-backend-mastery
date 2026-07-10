import { Request } from "express";

// Route Params Interfaces
export interface RoomParam {
  roomId: string;
}

export interface MessageParam {
  messageId: string;
}

// Request Body Interfaces
export interface SaveMessageBody {
  content: string;
  type?: "text" | "image" | "file" | "system";
}

// Request Query Interfaces
export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface SearchQuery extends PaginationQuery {
  q?: string; // Search parameter
}

// Explicitly type definitions for our controller requests using standard Express types
export type SaveMessageRequest = Request<RoomParam, any, SaveMessageBody>;
export type GetHistoryRequest = Request<RoomParam, any, any, PaginationQuery>;
export type GetMessageRequest = Request<MessageParam>;
export type DeleteMessageRequest = Request<MessageParam>;
export type MarkReadRequest = Request<RoomParam>;
export type UnreadCountRequest = Request<RoomParam>;
export type SearchMessagesRequest = Request<RoomParam, any, any, SearchQuery>;