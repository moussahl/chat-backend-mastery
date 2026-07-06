import { Router } from "express";
import * as roomController from "./room.controller";

const router = Router();

// Create room
router.post("/", roomController.creeateRoom);

// List user rooms
router.get("/", roomController.listUserRooms);

// Get room by id
router.get("/:roomId", roomController.getRoomById);

// Join room
router.post("/join", roomController.joinRoom);

// Quit room
router.post("/quit", roomController.quitRoom);

// Delete room (admin only)
router.delete("/:roomId", roomController.deleteRoom);

// Get room members
router.get("/:roomId/members", roomController.getRoomMembers);

// Check membership
router.get("/:roomId/is-member", roomController.isRoomMember);

export default router;
