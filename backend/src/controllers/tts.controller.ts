import type { Request, Response } from "express";
import { synthesizeSpeech } from "../services/tts.service.js";

export async function textToSpeech(req: Request, res: Response): Promise<void> {
  const text = String(req.body?.text ?? "").trim();

  if (!text) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  const result = await synthesizeSpeech(text);

  if (result.provider === "featherless" || result.provider === "fallback-proxy") {
    res.setHeader("Content-Type", result.contentType);
    res.setHeader("X-TTS-Provider", result.provider);
    res.setHeader("Cache-Control", "no-store");
    res.send(result.audioBuffer);
    return;
  }

  if (result.provider === "fallback-url") {
    res.json({ provider: result.provider, audioUrl: result.audioUrl });
    return;
  }

  res.status(502).json({ error: "No TTS provider response" });
}
