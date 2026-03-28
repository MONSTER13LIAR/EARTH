const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const TOKEN_KEY = "earth_jwt_token";
const USER_KEY = "earth_user";

function getAuthToken() {
  return sessionStorage.getItem(TOKEN_KEY) || "";
}

function getAuthHeaders(extra = {}) {
  const token = getAuthToken();
  return token
    ? { ...extra, Authorization: `Bearer ${token}` }
    : { ...extra };
}

function ensureTokenPresent() {
  if (!getAuthToken()) {
    throw new Error("Please sign in to continue.");
  }
}

export function saveAuthSession(token, user) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function getCurrentUser() {
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    const errorPayload = contentType.includes("application/json")
      ? await response.json()
      : { error: await response.text() };
    throw new Error(errorPayload.error || "Request failed");
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response;
}

export async function signup(payload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await parseResponse(response);
  saveAuthSession(data.token, data.user);
  return data;
}

export async function login(payload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await parseResponse(response);
  saveAuthSession(data.token, data.user);
  return data;
}

export async function fetchMe() {
  ensureTokenPresent();

  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: getAuthHeaders(),
  });
  const data = await parseResponse(response);
  if (data?.user) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }
  return data;
}

export async function fetchMyHistory() {
  ensureTokenPresent();

  const response = await fetch(`${API_BASE_URL}/api/history/me`, {
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
}

export async function speechToText(audioBlob) {
  ensureTokenPresent();

  const formData = new FormData();
  formData.append("audio", audioBlob, "voice.webm");

  const response = await fetch(`${API_BASE_URL}/api/speech-to-text`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  return parseResponse(response);
}

export async function textToSpeech(text) {
  ensureTokenPresent();

  const response = await fetch(`${API_BASE_URL}/api/text-to-speech`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ text }),
  });

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    const errorPayload = contentType.includes("application/json")
      ? await response.json()
      : { error: await response.text() };
    throw new Error(errorPayload.error || "TTS request failed");
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const blob = await response.blob();
  return {
    provider: response.headers.get("x-tts-provider") || "binary",
    audioUrl: URL.createObjectURL(blob),
  };
}

export async function medicineLabelReader(payload) {
  ensureTokenPresent();

  const response = await fetch(`${API_BASE_URL}/api/features/medicine-label-reader`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function symptomChecker(payload) {
  ensureTokenPresent();

  const response = await fetch(`${API_BASE_URL}/api/features/symptom-checker`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function doctorOrHomeDecision(payload) {
  ensureTokenPresent();

  const response = await fetch(`${API_BASE_URL}/api/features/doctor-or-home-decision`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function doctorVisitExplainer(payload) {
  ensureTokenPresent();

  const response = await fetch(`${API_BASE_URL}/api/features/doctor-visit-explainer`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function chatWithEarth(message) {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return parseResponse(response);
}

export async function sendChatMessage(message, history = []) {
  ensureTokenPresent();

  const response = await fetch(`${API_BASE_URL}/api/features/chat`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ message, history }),
  });

  return parseResponse(response);
}

/** Silently log a tool usage to history. Never throws — fails quietly if not signed in. */
export async function logToolActivity(feature, inputSummary, outputSummary) {
  const token = getAuthToken();
  if (!token) return;
  try {
    await fetch(`${API_BASE_URL}/api/history/activity`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ feature, inputSummary, outputSummary }),
    });
  } catch {
    // silent — logging failure should never break the tool
  }
}

export async function getPromptSamples() {
  ensureTokenPresent();

  const response = await fetch(`${API_BASE_URL}/api/features/prompt-samples`, {
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
}
