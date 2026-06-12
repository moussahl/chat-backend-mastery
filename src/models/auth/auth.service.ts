import User from "../users/user.model";
import AppError from "../../utils/AppError";

import { signToken } from "../../utils/token";

// register
export const register = async ({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}) => {
  const exists = await User.findOne({ email });

  if (exists) {
    throw new AppError("Email already in use", 400);
  }

  const user = await User.create({ username, email, password });
  const token = signToken(user._id.toString(), "user");

  return { token, user };
};

//login

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid Credentials", 401);
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) throw new AppError("Invalid Credentials", 401);

  const token = signToken(user._id.toString(), user.role);

  return { token, user };
};
