import type { NextFunction, Request, Response } from "express";
import { HttpError } from "./error.middleware.js";
import { verifyAuthToken } from "../services/auth.service.js";

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    next();
    return;
  }

  req.user = verifyAuthToken(token);
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    next(new HttpError(401, "Authorization token missing"));
    return;
  }

  req.user = verifyAuthToken(token);
  next();
}
