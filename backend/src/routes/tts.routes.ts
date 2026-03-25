import { Router } from "express";
import { textToSpeech } from "../controllers/tts.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const ttsRouter = Router();

ttsRouter.post("/text-to-speech", requireAuth, textToSpeech);
