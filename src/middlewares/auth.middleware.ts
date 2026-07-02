import { verifyToken, TokenPayload } from "../utils/token";
import User from "../models/users/user.model";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";

import { Request, Response, NextFunction } from "express";
// Extend Express Request interface to include `user` set by authentication middleware
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer "))
      throw new AppError("Not authenticated", 400);

    const token = auth.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id);
    if (!user) throw new AppError("User no longer exists", 401);

    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };

    next();
  },
);

export default protect;
