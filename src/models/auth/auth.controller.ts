import catchAsync from "../../utils/catchAsync";
import * as authService from "../auth/auth.service";
import { Request, Response } from "express";

/**
 * @desc  Register a user
 * @route POST /api/auth/register
 * @access public
 */

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

/**
 * @desc  login a user (with email and password)
 * @route POST /api/auth/login
 * @access public
 */

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
