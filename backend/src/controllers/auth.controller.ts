import type { Request, Response } from "express";
import { HttpError } from "../middlewares/error.middleware.js";
import { User } from "../models/User.js";
import { hashPassword, signAuthToken, verifyPassword } from "../services/auth.service.js";

export async function signup(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body as { name: string; email: string; password: string };

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new HttpError(409, "Email already registered");
  }

  const passwordHash = await hashPassword(String(password));
  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash,
    healthProfile: [],
    history: [],
  });

  const token = signAuthToken({
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
  });

  res.status(201).json({
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      healthProfile: user.healthProfile,
    },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new HttpError(401, "Invalid credentials");
  }

  const ok = await verifyPassword(String(password), user.passwordHash);
  if (!ok) {
    throw new HttpError(401, "Invalid credentials");
  }

  const token = signAuthToken({
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
  });

  res.json({
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      healthProfile: user.healthProfile,
    },
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const user = await User.findById(userId).lean();
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  res.json({
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      healthProfile: user.healthProfile,
    },
  });
}
