import { Router } from "express";
import * as messageController from "./message.controller";

// ==========================================
// 1. NESTED ROUTER (Room-Dependent Messages)
// Mounted at: /api/rooms/:roomId/messages
// ==========================================
export const roomMessageRouter = Router({ mergeParams: true });

roomMessageRouter.get("/search", messageController.searchMessages);
roomMessageRouter.patch("/read", messageController.markMessagesAsRead);
roomMessageRouter.get("/", messageController.getHistory);
roomMessageRouter.post("/", messageController.saveMessage);


// ==========================================
// 2. DIRECT ROUTER (Standalone Messages)
// Mounted at: /api/messages
// ==========================================
export const directMessageRouter = Router();

directMessageRouter.get("/:messageId", messageController.getMessageById);
directMessageRouter.delete("/:messageId", messageController.deleteMessage);
