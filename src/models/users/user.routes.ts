import { Router } from "express";
import * as userController from "./user.controller";

const router = Router();

router.get("/me", userController.getMe);
router.patch("/profile", userController.updateProfile);
router.patch("/status", userController.updateStatus);
router.get("/:userId", userController.getUserPublicInfo);
router.get("/", userController.getAllusers);

export default router;
