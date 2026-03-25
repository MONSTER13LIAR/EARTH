import { useCallback, useState } from "react";
import Tesseract from "tesseract.js";

function cleanOCRText(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/[|]/g, "I")
    .trim();
}

function withFilteredTesseractWarnings(fn) {
  const originalWarn = console.warn;
  const ignored = [
    "Parameter not found: classify_misfit_junk_penalty",
    "Parameter not found: merge_fragments_in_matrix",
  ];

  console.warn = (...args) => {
    const msg = String(args[0] ?? "");
    if (ignored.some((pattern) => msg.includes(pattern))) {
      return;
    }
    originalWarn(...args);
  };

  return fn().finally(() => {
    console.warn = originalWarn;
  });
}

export async function extractTextFromImage(file) {
  const result = await withFilteredTesseractWarnings(() =>
    Tesseract.recognize(file, "eng+hin", {
      logger: () => {},
    })
  );

  return cleanOCRText(result.data?.text || "");
}

export function useOCR() {
  const [ocrText, setOcrText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runOCR = useCallback(async (file) => {
    setLoading(true);
    setError("");

    try {
      const extracted = await extractTextFromImage(file);
      setOcrText(extracted);
      return extracted;
    } catch (err) {
      const message = err instanceof Error ? err.message : "OCR fail hua";
      setError(message);
      return "";
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    ocrText,
    loading,
    error,
    runOCR,
    setOcrText,
  };
}
