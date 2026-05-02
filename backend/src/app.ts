import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { authRouter } from "./routes/auth.routes.js";
import { chatRouter } from "./routes/chat.routes.js";
import { featureRouter } from "./routes/feature.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { historyRouter } from "./routes/history.routes.js";
import { speechRouter } from "./routes/speech.routes.js";
import { ttsRouter } from "./routes/tts.routes.js";

export const app = express();

const allowedOrigins = [
  env.frontendOrigin,
  "https://earth-sepia-seven.vercel.app",
  "https://earth-sepia-seven.vercel.app/",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        env.frontendOrigin === "*" ||
        origin.endsWith(".vercel.app") ||
        origin.includes("localhost")
      ) {
        callback(null, true);
      } else {
        // Fallback: if it's the specific domain but missing protocol in env
        const normalizedOrigin = origin.replace(/^https?:\/\//, "");
        if (normalizedOrigin === env.frontendOrigin) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive during debug
        }
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    credentials: true,
  })
);

app.use(express.json({ limit: "4mb" }));

app.use("/", healthRouter);
app.use("/api", speechRouter);
app.use("/api", ttsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/auth", authRouter);
app.use("/api/history", historyRouter);
app.use("/api/features", featureRouter);

app.use(notFoundHandler);
app.use(errorHandler);
