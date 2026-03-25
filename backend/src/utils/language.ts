export function hasHindiScript(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

export function inferResponseLanguageFromText(text: string): "Hindi" | "English" {
  return hasHindiScript(text) ? "Hindi" : "English";
}

export function inferResponseLanguageFromMany(values: Array<string | undefined | null>): "Hindi" | "English" {
  const merged = values.filter(Boolean).join(" ");
  return inferResponseLanguageFromText(merged);
}
