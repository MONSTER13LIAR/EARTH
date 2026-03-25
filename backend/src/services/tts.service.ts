import { env } from "../config/env.js";
import { hasHindiScript } from "../utils/language.js";

export type TTSResult =
  | { provider: "featherless" | "fallback-proxy"; audioBuffer: Buffer; contentType: string }
  | { provider: "fallback-url"; audioUrl: string };

function getTargetLanguage(text: string): "hi" | "en" {
  return hasHindiScript(text) ? "hi" : "en";
}

function fallbackUrlGoogle(text: string): string {
  const q = encodeURIComponent(text);
  const tl = getTargetLanguage(text);
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${q}&tl=${tl}&client=tw-ob`;
}

function fallbackUrlGoogleApis(text: string): string {
  const q = encodeURIComponent(text);
  const tl = getTargetLanguage(text);
  return `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${q}&tl=${tl}&client=gtx`;
}

async function fetchAudio(url: string): Promise<TTSResult | null> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Referer: "https://translate.google.com/",
    },
  });

  if (!response.ok) return null;

  const arrayBuffer = await response.arrayBuffer();
  return {
    provider: "fallback-proxy",
    audioBuffer: Buffer.from(arrayBuffer),
    contentType: response.headers.get("content-type") ?? "audio/mpeg",
  };
}

async function tryFeatherlessTts(text: string): Promise<TTSResult | null> {
  if (!env.featherlessApiKey) return null;

  const response = await fetch(`${env.featherlessBaseUrl}/audio/speech`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.featherlessApiKey}`,
    },
    body: JSON.stringify({
      model: env.featherlessModel,
      voice: env.ttsVoice,
      input: text,
      format: "mp3",
    }),
  });

  if (!response.ok) return null;

  const arrayBuffer = await response.arrayBuffer();
  return {
    provider: "featherless",
    audioBuffer: Buffer.from(arrayBuffer),
    contentType: response.headers.get("content-type") ?? "audio/mpeg",
  };
}

export async function synthesizeSpeech(text: string): Promise<TTSResult> {
  const shortText = text.slice(0, 320);

  const featherlessAudio = await tryFeatherlessTts(shortText);
  if (featherlessAudio) return featherlessAudio;

  const primaryFallback = await fetchAudio(fallbackUrlGoogle(shortText));
  if (primaryFallback) return primaryFallback;

  const secondaryFallback = await fetchAudio(fallbackUrlGoogleApis(shortText));
  if (secondaryFallback) return secondaryFallback;

  return {
    provider: "fallback-url",
    audioUrl: fallbackUrlGoogleApis(shortText),
  };
}
