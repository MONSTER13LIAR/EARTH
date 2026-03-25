import type { Request, Response } from "express";
import { HttpError } from "../middlewares/error.middleware.js";
import { UserActivity } from "../models/UserActivity.js";

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
