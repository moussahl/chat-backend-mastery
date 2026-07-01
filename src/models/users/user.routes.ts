import { Router } from "express";
import { authMiddleware } from "./user.controller";
import * as userController from "./user.controller";

const router = Router();

router.get("/me", authMiddleware, userController.getMe);
router.patch("/profile", authMiddleware, userController.updateProfile);
router.patch("/status", authMiddleware, userController.updateStatus);
router.get("/:userId", userController.getUserPublicInfo);

export default router;
