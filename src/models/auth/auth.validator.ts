import { body } from "express-validator";

//register validator
export const registerValidator = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be 3-30 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Invalid Email"),
  body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
];

//login validator
export const loginValidator = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];
