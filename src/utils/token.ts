import jwt, { Secret, SignOptions, JwtPayload } from "jsonwebtoken";



interface TokenPayload extends JwtPayload {
  id: string;
  role: roleEnum;
}




//import .env variables
const secret: Secret = process.env.JWT_SECRET || "secret";

const options: SignOptions = {
  expiresIn: (process.env.JWT_EXPIRES_IN as any) || "7d",};

//define role enum type
export type roleEnum = "admin" | "user";

//sign
export const signToken = (userId: string, role: roleEnum) =>
  jwt.sign({ id: userId, role }, secret, options);

// verify
export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, secret) as TokenPayload;
};
