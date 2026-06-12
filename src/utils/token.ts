import jwt, { Secret, SignOptions, JwtPayload } from "jsonwebtoken";

const secret: Secret = process.env.JWT_SECRET || "secret";

const options: SignOptions = {
  expiresIn: (process.env.JWT_EXPIRES_IN as any) || "7d",
};

//sign
export const signToken = (userId: string, role: string) =>
  jwt.sign({ id: userId, role }, secret, options);

// verify
export const verifyToken = (token: string): string | JwtPayload => {
  return jwt.verify(token, secret);
};
