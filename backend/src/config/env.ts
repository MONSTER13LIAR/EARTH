import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.ENVIRONMENT ?? "development",
  port: Number(process.env.PORT ?? 3000),
  mongoUri: process.env.MONGO_URI ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "earth-dev-secret",
  featherlessApiKey: process.env.FEATHERLESS_API_KEY ?? "",
  featherlessBaseUrl: process.env.FEATHERLESS_BASE_URL ?? "https://api.featherless.ai/v1",
  featherlessModel: process.env.FEATHERLESS_MODEL ?? "vicgalle/Roleplay-Llama-3-8B",
  deepgramApiKey: process.env.DEEPGRAM_SECRET ?? "",
  ttsVoice: process.env.TTS_VOICE ?? "alloy",
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  medicineDuplicateWindowHours: Number(process.env.MEDICINE_DUPLICATE_WINDOW_HOURS ?? 6),
  aiRateLimitPerMinute: Number(process.env.AI_RATE_LIMIT_PER_MINUTE ?? 30),
};
