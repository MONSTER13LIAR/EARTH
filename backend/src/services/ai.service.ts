import { env } from "../config/env.js";
import { HttpError } from "../middlewares/error.middleware.js";

type LLMRole = "system" | "user";

type LLMMessage = {
  role: LLMRole;
  content: string;
};

type LLMResponse = {
  text: string;
  raw: unknown;
};

type ChatCompletionPayload = {
  choices?: Array<{ message?: { content?: string } }>;
};

type ModelListPayload = {
  data?: Array<{
    id?: string;
    available_on_current_plan?: boolean;
  }>;
};

const requestWindowMs = 60_000;
const aiRequestTimestamps: number[] = [];

function enforceRateLimit(): void {
  const now = Date.now();

  while (aiRequestTimestamps.length > 0) {
    const first = aiRequestTimestamps[0];
    if (first === undefined || now - first <= requestWindowMs) {
      break;
    }
    aiRequestTimestamps.shift();
  }

  if (aiRequestTimestamps.length >= env.aiRateLimitPerMinute) {
    throw new HttpError(429, "AI service rate limit exceeded. Please retry.");
  }

  aiRequestTimestamps.push(now);
}

function buildMessages(prompt: string, context?: unknown, language = "English"): LLMMessage[] {
  const systemPrompt = `You are EARTH (Complete Rural AI Companion), a voice-first rural healthcare assistant. Always respond in ${language}. Keep output simple, clear, and user-safe.`;
  const contextBlock = context ? `\n\nContext JSON:\n${JSON.stringify(context, null, 2)}` : "";

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: `${prompt}${contextBlock}` },
  ];
}

async function requestCompletion(model: string, messages: LLMMessage[]): Promise<Response> {
  return fetch(`${env.featherlessBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.featherlessApiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
      max_tokens: 600,
    }),
  });
}

function isModelNotFound(errorBody: string): boolean {
  const normalized = errorBody.toLowerCase();
  return normalized.includes("model_not_found") || normalized.includes("does not exist");
}

async function pickFallbackModel(currentModel: string): Promise<string | null> {
  const response = await fetch(`${env.featherlessBaseUrl}/models`, {
    headers: { Authorization: `Bearer ${env.featherlessApiKey}` },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as ModelListPayload;
  const models = payload.data ?? [];

  const available = models.filter((m) => m.available_on_current_plan && !!m.id && m.id !== currentModel);
  const instructLike = available.find((m) => m.id?.toLowerCase().includes("instruct"))?.id;

  return instructLike ?? available[0]?.id ?? null;
}

export async function callLLM(prompt: string, context?: unknown, language = "English"): Promise<LLMResponse> {
  if (!env.featherlessApiKey) {
    throw new HttpError(500, "FEATHERLESS_API_KEY is not configured");
  }

  enforceRateLimit();
  const messages = buildMessages(prompt, context, language);

  let model = env.featherlessModel;
  let response = await requestCompletion(model, messages);

  if (!response.ok) {
    const body = await response.text();

    if (isModelNotFound(body)) {
      const fallbackModel = await pickFallbackModel(model);
      if (fallbackModel) {
        model = fallbackModel;
        response = await requestCompletion(model, messages);
      }
    }

    if (!response.ok) {
      const finalBody = await response.text();
      throw new HttpError(502, "Featherless API request failed", finalBody);
    }
  }

  const data = (await response.json()) as ChatCompletionPayload;
  const text = data?.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new HttpError(502, "Featherless returned empty response");
  }

  return { text, raw: data };
}
