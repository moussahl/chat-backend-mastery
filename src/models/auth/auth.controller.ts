import catchAsync from "../../utils/catchAsync";
import * as authService from "../auth/auth.service";
import { Request, Response } from "express";

export const register = catchAsync(async (req: Request, res: Response) => {
  const { token, user } = await authService.register(req.body);
  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { token, user } = await authService.login(req.body);

  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});
