import type { NextFunction, Request, Response } from "express";
import { HttpError } from "./error.middleware.js";

export function requireFields(fields: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const missing = fields.filter((f) => req.body?.[f] === undefined || req.body?.[f] === null || req.body?.[f] === "");
    if (missing.length > 0) {
      next(new HttpError(400, `Missing required fields: ${missing.join(", ")}`));
      return;
    }
    next();
  };
}
