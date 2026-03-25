import { env } from "../config/env.js";
import { HttpError } from "../middlewares/error.middleware.js";

export type SpeechToTextResult = {
  transcript: string;
  detectedLanguage: string;
};

export async function transcribeAudio(audioBuffer: Buffer, mimeType = "audio/webm"): Promise<SpeechToTextResult> {
  if (!env.deepgramApiKey) {
    throw new HttpError(500, "DEEPGRAM_SECRET is not configured");
  }

  const deepgramUrl =
    "https://api.deepgram.com/v1/listen?smart_format=true&model=nova-2&detect_language=true";

  const response = await fetch(deepgramUrl, {
    method: "POST",
    headers: {
      Authorization: `Token ${env.deepgramApiKey}`,
      "Content-Type": mimeType,
    },
    body: new Uint8Array(audioBuffer),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new HttpError(response.status, "Deepgram transcription failed", body);
  }

  const payload = (await response.json()) as {
    results?: {
      channels?: Array<{
        detected_language?: string;
        alternatives?: Array<{
          transcript?: string;
        }>;
      }>;
    };
  };

  const channel = payload?.results?.channels?.[0];
  const transcript = channel?.alternatives?.[0]?.transcript?.trim();
  if (!transcript) {
    throw new HttpError(422, "No speech detected in audio");
  }

  return {
    transcript,
    detectedLanguage: channel?.detected_language ?? "unknown",
  };
}
