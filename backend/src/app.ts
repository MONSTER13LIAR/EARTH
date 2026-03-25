import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { authRouter } from "./routes/auth.routes.js";
import { featureRouter } from "./routes/feature.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { historyRouter } from "./routes/history.routes.js";
import { speechRouter } from "./routes/speech.routes.js";
import { ttsRouter } from "./routes/tts.routes.js";

export const app = express();

app.use(cors({ origin: env.frontendOrigin }));
app.use(express.json({ limit: "4mb" }));

app.use("/", healthRouter);
app.use("/api", speechRouter);
app.use("/api", ttsRouter);
app.use("/api/auth", authRouter);
app.use("/api/history", historyRouter);
app.use("/api/features", featureRouter);

app.use(notFoundHandler);
app.use(errorHandler);
