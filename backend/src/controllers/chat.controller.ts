import type { Request, Response } from "express";
import { env } from "../config/env.js";

const SYSTEM_PROMPT = `You are EARTH Assistant — a helpful rural India companion AI. You help with:
1. Health and medicine questions (Swasth Raho)
2. Education and career guidance (Pustak Dost)
3. Farming, crop disease, loans, govt schemes (Kisan Rath)
4. Women safety and legal rights (Shakti)
Always respond in simple Hindi unless user writes in English. Keep answers short, clear, and actionable. Never use complex words.`;

export async function chat(req: Request, res: Response): Promise<void> {
  const { message } = req.body as { message?: string };

  if (!message?.trim()) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  if (!env.featherlessApiKey) {
    res.status(500).json({ error: "FEATHERLESS_API_KEY is not configured" });
    return;
  }

  const featherlessRes = await fetch(`${env.featherlessBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.featherlessApiKey}`,
    },
    body: JSON.stringify({
      model: "Qwen/Qwen2.5-7B-Instruct",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message.trim() },
      ],
      max_tokens: 300,
    }),
  });

  if (!featherlessRes.ok) {
    const detail = await featherlessRes.text();
    res.status(502).json({ error: "Featherless API error", detail });
    return;
  }

  const data = (await featherlessRes.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const reply = data?.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    res.status(502).json({ error: "Empty response from AI" });
    return;
  }

  res.json({ reply });
}
