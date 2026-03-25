import type { Request, Response } from "express";
import { HttpError } from "../middlewares/error.middleware.js";
import { transcribeAudio } from "../services/speech.service.js";

export async function speechToText(req: Request, res: Response): Promise<void> {
  const file = req.file;
  if (!file) {
    throw new HttpError(400, "Audio file is required. Send multipart/form-data with key 'audio'.");
  }

  const result = await transcribeAudio(file.buffer, file.mimetype || "audio/webm");
  res.json(result);
}
