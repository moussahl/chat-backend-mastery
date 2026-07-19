import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validateMessage = [
  //  Validate Sender ID
  body("sender")
    .notEmpty()
    .withMessage("Sender is required")
    .isMongoId()
    .withMessage("Sender must be a valid Mongo ID"),

  // Validate Room ID
  body("room")
    .notEmpty()
    .withMessage("Room is required")
    .isMongoId()
    .withMessage("Room must be a valid Mongo ID"),

  // Validate Content
  body("content")
    .notEmpty()
    .withMessage("Message content is required")
    .bail() // Stops running validation rules on this field if 'notEmpty' fails
    .isString()
    .withMessage("Content must be a string")
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage("Message must be between 1 and 5000 characters"),

  // Validate Type (Optional, defaults to 'text')
  body("type")
    .optional()
    .isIn(["text", "image", "file", "system"])
    .withMessage("Message type must be text, image, file, or system"),

  //  Validate isRead (Optional, defaults to false)
  body("isRead")
    .optional()
    .isBoolean()
    .withMessage("isRead must be a boolean value")
    .toBoolean(), // Sanitizes the input to a strict boolean type

  // Middleware to handle errors
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       res.status(400).json({ errors: errors.array() });
       return;
    }
    next();
  },
];