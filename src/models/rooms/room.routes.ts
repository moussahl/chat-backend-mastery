import { Router } from "express";
import * as roomController from "./room.controller";
import * as messageController from "../messages/message.controller";
import { roomMessageRouter } from "../messages/message.routes"; // Import ONLY the nested router

const router = Router();

// ==========================================
// ROOM CRUD & MEMBERSHIP ROUTES
// Base: /api/rooms
// ==========================================
router.post("/", roomController.creeateRoom);
router.get("/", roomController.listUserRooms);
router.get("/:roomId", roomController.getRoomById);
router.post("/join", roomController.joinRoom);
router.post("/quit", roomController.quitRoom);
router.delete("/:roomId", roomController.deleteRoom);
router.get("/:roomId/members", roomController.getRoomMembers);
router.get("/:roomId/is-member", roomController.isRoomMember);

// Unread count sits at the room level, 
router.get("/:roomId/unread-count", messageController.getUnreadCount);

// ==========================================
// NESTED MESSAGES DELEGATION
// Forwards /api/rooms/:roomId/messages/* to the roomMessageRouter
// ==========================================
router.use("/:roomId/messages", roomMessageRouter);

export default router;