import { Role } from "@prisma/client";
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
const JWT_SECRET: string = process.env.JWT_SECRET;

export const COOKIE_NAME = "apd_token";

export interface AuthTokenPayload {
  sub: string;
  name: string;
  email: string;
  role: Role;
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}
