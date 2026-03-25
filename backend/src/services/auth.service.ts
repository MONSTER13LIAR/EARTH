import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../middlewares/error.middleware.js";

export type JwtUser = {
  userId: string;
  email: string;
  name: string;
};

const jwtSecret = process.env.JWT_SECRET || "earth-dev-secret";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

export function signAuthToken(payload: JwtUser): string {
  return jwt.sign(payload, jwtSecret, { expiresIn: "7d" });
}

export function verifyAuthToken(token: string): JwtUser {
  try {
    return jwt.verify(token, jwtSecret) as JwtUser;
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }
}
