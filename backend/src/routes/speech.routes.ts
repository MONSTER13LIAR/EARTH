import { Router } from "express";
import multer from "multer";
import { speechToText } from "../controllers/speech.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const upload = multer({ storage: multer.memoryStorage() });

export const speechRouter = Router();

speechRouter.post("/speech-to-text", requireAuth, upload.single("audio"), speechToText);
