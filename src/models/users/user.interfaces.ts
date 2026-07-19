import { Request } from "express";

export interface BaseUserRequest extends Request {}

export interface UpdateProfileRequest extends Request {
  body: {
    username?: string;
    email?: string;
    avatar?: string | null;
    status?: "online" | "offline" | "away";
  };
}

export interface UpdateStatusRequest extends Request {
  body: {
    status: "online" | "offline" | "away";
  };
}

export interface GetUserPublicInfoRequest extends Request {
  params: {
    userId: string | string[];
  };
}