import type { Request, Response } from "express";
import mongoose from "mongoose";
import { HttpError } from "../middlewares/error.middleware.js";
import { UserActivity } from "../models/UserActivity.js";

export async function saveActivity(req: Request, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) throw new HttpError(401, "Unauthorized");

  const { feature, inputSummary, outputSummary } = req.body as {
    feature?: string;
    inputSummary?: string;
    outputSummary?: string;
  };

  if (!feature || !inputSummary || !outputSummary) {
    res.status(400).json({ error: "feature, inputSummary and outputSummary are required" });
    return;
  }

  await UserActivity.create({
    userId: new mongoose.Types.ObjectId(userId),
    feature: String(feature).slice(0, 80),
    inputSummary: String(inputSummary).slice(0, 220),
    outputSummary: String(outputSummary).slice(0, 220),
    metadata: {},
  });

  res.json({ ok: true });
}

export async function getMyHistory(req: Request, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const activities = await UserActivity.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.json({
    activities: activities.map((item) => ({
      id: String(item._id),
      feature: item.feature,
      inputSummary: item.inputSummary,
      outputSummary: item.outputSummary,
      metadata: item.metadata,
      createdAt: item.createdAt,
    })),
  });
}
