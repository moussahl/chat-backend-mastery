import { validationResult } from "express-validator";
import AppError from "../utils/AppError";
import { Request, Response, NextFunction } from "express";

//  runs the validators and short-circuits with 400 if invalid.
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(",");
    return next(new AppError(message, 400));
  }

  next();
};

export default validate;
