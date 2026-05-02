import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

async function bootstrap(): Promise<void> {
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`EARTH backend listening on port ${env.port}`);
  });

  connectDB().catch((err) => {
    console.error("Delayed MongoDB connection failed:", err);
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start backend:", error);
  process.exit(1);
});
