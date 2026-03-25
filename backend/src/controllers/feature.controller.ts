import type { Request, Response } from "express";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { HttpError } from "../middlewares/error.middleware.js";
import { MedicineLog } from "../models/MedicineLog.js";
import { SymptomLog } from "../models/SymptomLog.js";
import { User } from "../models/User.js";
import { UserActivity } from "../models/UserActivity.js";
import { callLLM } from "../services/ai.service.js";
import { inferResponseLanguageFromMany } from "../utils/language.js";
import { promptTemplates } from "../utils/promptTemplates.js";

type MedicineReaderOutput = {
  medicineName: string;
  dosage: string;
  expiry: string;
  overdoseWarning: string;
  simpleSummary: string;
};

type SymptomOutput = {
  condition: string;
  severity: "low" | "medium" | "high";
  advice: string;
  needsDoctor: boolean;
  followUpQuestions: string[];
};

type DecisionOutput = {
  decision: "Go to doctor" | "Safe at home";
  reason: string;
  remedySteps: string[];
};

type VisitExplainerOutput = {
  diagnosis: string;
  medicines: string[];
  precautions: string[];
  simpleExplanation: string;
};

function getRequiredUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  return userId;
}

async function ensureUser(userId: string): Promise<void> {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new HttpError(400, "Invalid userId format");
  }

  const existing = await User.findById(userId);
  if (!existing) {
    throw new HttpError(404, "User not found");
  }
}

async function logActivity(
  userId: string,
  feature: string,
  inputSummary: string,
  outputSummary: string,
  metadata: Record<string, unknown>
): Promise<void> {
  await UserActivity.create({
    userId: new mongoose.Types.ObjectId(userId),
    feature,
    inputSummary,
    outputSummary,
    metadata,
  });

  await User.updateOne(
    { _id: new mongoose.Types.ObjectId(userId) },
    {
      $push: {
        history: {
          feature,
          inputSummary,
          outputSummary,
          createdAt: new Date(),
        },
      },
    }
  );
}

function extractJsonBlock(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

function parseJSON<T>(text: string): T {
  const block = extractJsonBlock(text);
  if (!block) {
    throw new HttpError(502, "LLM did not return JSON payload");
  }

  try {
    return JSON.parse(block) as T;
  } catch {
    throw new HttpError(502, "Invalid JSON received from LLM");
  }
}

function normalizeMedicineOutput(payload: Partial<MedicineReaderOutput>): MedicineReaderOutput {
  return {
    medicineName: payload.medicineName?.trim() || "unknown",
    dosage: payload.dosage?.trim() || "unknown",
    expiry: payload.expiry?.trim() || "unknown",
    overdoseWarning: payload.overdoseWarning?.trim() || "",
    simpleSummary: payload.simpleSummary?.trim() || "Incomplete information. Please consult a doctor.",
  };
}

function normalizeSymptomOutput(payload: Partial<SymptomOutput>): SymptomOutput {
  const severity = payload.severity === "high" || payload.severity === "medium" || payload.severity === "low"
    ? payload.severity
    : "medium";

  return {
    condition: payload.condition?.trim() || "unknown",
    severity,
    advice: payload.advice?.trim() || "Drink water and rest.",
    needsDoctor: Boolean(payload.needsDoctor || severity === "high"),
    followUpQuestions: Array.isArray(payload.followUpQuestions)
      ? payload.followUpQuestions.map((q) => String(q)).filter(Boolean)
      : [],
  };
}

function normalizeDecisionOutput(payload: Partial<DecisionOutput>): DecisionOutput {
  const decision = payload.decision === "Go to doctor" || payload.decision === "Safe at home"
    ? payload.decision
    : "Go to doctor";

  const remedySteps = Array.isArray(payload.remedySteps)
    ? payload.remedySteps.map((s) => String(s)).filter(Boolean)
    : [];

  return {
    decision,
    reason: payload.reason?.trim() || "Symptoms are unclear; safest next step is doctor visit.",
    remedySteps,
  };
}

function normalizeVisitOutput(payload: Partial<VisitExplainerOutput>): VisitExplainerOutput {
  return {
    diagnosis: payload.diagnosis?.trim() || "unknown",
    medicines: Array.isArray(payload.medicines) ? payload.medicines.map((m) => String(m)).filter(Boolean) : [],
    precautions: Array.isArray(payload.precautions) ? payload.precautions.map((p) => String(p)).filter(Boolean) : [],
    simpleExplanation:
      payload.simpleExplanation?.trim() || "Information is incomplete. Please confirm details with your doctor.",
  };
}

export async function medicineLabelReader(req: Request, res: Response): Promise<void> {
  const userId = getRequiredUserId(req);
  const { ocrText, intakeWindowHours } = req.body as {
    ocrText: string;
    intakeWindowHours?: number;
  };

  await ensureUser(userId);

  const language = inferResponseLanguageFromMany([ocrText]);
  const { text } = await callLLM(promptTemplates.medicineLabelReader, { ocrText, userId }, language);
  const parsed = normalizeMedicineOutput(parseJSON<Partial<MedicineReaderOutput>>(text));

  const windowHours = Number(intakeWindowHours ?? env.medicineDuplicateWindowHours);
  const cutoff = new Date(Date.now() - windowHours * 60 * 60 * 1000);

  const duplicate = await MedicineLog.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    medicineName: parsed.medicineName,
    timestamp: { $gte: cutoff },
  }).sort({ timestamp: -1 });

  const duplicatePrevented = Boolean(duplicate);
  if (!duplicate) {
    await MedicineLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      medicineName: parsed.medicineName,
      timestamp: new Date(),
    });
  }

  await logActivity(
    userId,
    "medicine-label-reader",
    String(ocrText).slice(0, 220),
    `${parsed.medicineName} | ${parsed.dosage} | ${parsed.expiry}`,
    { duplicatePrevented }
  );

  res.json({
    ...parsed,
    duplicatePrevented,
    duplicateWindowHours: windowHours,
  });
}

export async function symptomChecker(req: Request, res: Response): Promise<void> {
  const userId = getRequiredUserId(req);
  const { symptomsText, imageDescription } = req.body as {
    symptomsText: string;
    imageDescription?: string;
  };

  await ensureUser(userId);

  const language = inferResponseLanguageFromMany([symptomsText, imageDescription]);
  const { text } = await callLLM(
    promptTemplates.symptomChecker,
    { symptomsText, imageDescription: imageDescription ?? null, userId },
    language
  );

  const parsed = normalizeSymptomOutput(parseJSON<Partial<SymptomOutput>>(text));

  await SymptomLog.create({
    userId: new mongoose.Types.ObjectId(userId),
    symptoms: symptomsText,
    result: parsed,
  });

  await logActivity(
    userId,
    "symptom-checker",
    String(symptomsText).slice(0, 220),
    `${parsed.condition} | ${parsed.severity} | needsDoctor=${parsed.needsDoctor}`,
    { followUps: parsed.followUpQuestions.length }
  );

  res.json(parsed);
}

export async function doctorOrHomeDecision(req: Request, res: Response): Promise<void> {
  const userId = getRequiredUserId(req);
  const { symptomData } = req.body as {
    symptomData: Record<string, unknown>;
  };

  await ensureUser(userId);

  const user = await User.findById(userId).lean();
  const healthProfile = user?.healthProfile ?? [];
  const language = inferResponseLanguageFromMany([JSON.stringify(symptomData)]);

  const { text } = await callLLM(
    promptTemplates.doctorHomeDecision,
    {
      symptomData,
      healthProfile,
    },
    language
  );

  const parsed = normalizeDecisionOutput(parseJSON<Partial<DecisionOutput>>(text));

  await logActivity(
    userId,
    "doctor-home-decision",
    JSON.stringify(symptomData).slice(0, 220),
    `${parsed.decision} | ${parsed.reason}`,
    { steps: parsed.remedySteps.length }
  );

  res.json(parsed);
}

export async function doctorVisitExplainer(req: Request, res: Response): Promise<void> {
  const userId = getRequiredUserId(req);
  const { partialVoiceMemory } = req.body as {
    partialVoiceMemory: string;
  };

  await ensureUser(userId);

  const user = await User.findById(userId).lean();
  const language = inferResponseLanguageFromMany([partialVoiceMemory]);

  const { text } = await callLLM(
    promptTemplates.doctorVisitExplainer,
    {
      partialVoiceMemory,
      userHistory: user?.history ?? [],
    },
    language
  );

  const parsed = normalizeVisitOutput(parseJSON<Partial<VisitExplainerOutput>>(text));

  await logActivity(
    userId,
    "doctor-visit-explainer",
    String(partialVoiceMemory).slice(0, 220),
    `${parsed.diagnosis} | meds=${parsed.medicines.join(", ")}`,
    { precautions: parsed.precautions.length }
  );

  res.json(parsed);
}

export function getPromptSamples(_req: Request, res: Response): void {
  res.json(promptTemplates);
}
