import { Request } from "express";

export interface CreateRoomRequest extends Request {
  body: {
    name: string;
    type: "public" | "private";
  };
}

export interface ListUserRoomsRequest extends Request {
  query: {
    page?: string;
    limit?: string;
  };
}

export interface RoomParamsRequest extends Request {
  params: {
    roomId: string;
  };
}

export interface JoinRoomRequest extends Request {
  body: {
    roomId: string;
  };
}

export interface QuitRoomRequest extends Request {
  body: {
    roomId: string;
  };
}

export interface GetRoomMembersRequest extends Request {
  params: {
    roomId: string;
  };
  query: {
    page?: string;
    limit?: string;
  };
}
