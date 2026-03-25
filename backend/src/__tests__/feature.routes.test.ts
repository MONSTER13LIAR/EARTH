import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { beforeAll, afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "../models/User.js";
import { hashPassword, signAuthToken } from "../services/auth.service.js";

vi.mock("../services/ai.service.js", () => ({
  callLLM: vi.fn(async (prompt: string) => {
    if (prompt.includes("medicine label")) {
      return {
        text: JSON.stringify({
          medicineName: "Paracetamol",
          dosage: "500mg",
          expiry: "12/2027",
          overdoseWarning: "Do not exceed recommended dose",
          simpleSummary: "Used for fever and mild pain",
        }),
      };
    }

    if (prompt.includes("triage assistant")) {
      return {
        text: JSON.stringify({
          condition: "Flu",
          severity: "medium",
          advice: "Rest and hydrate",
          needsDoctor: false,
          followUpQuestions: ["How long has fever lasted?"],
        }),
      };
    }

    if (prompt.includes("decide next step")) {
      return {
        text: JSON.stringify({
          decision: "Safe at home",
          reason: "Symptoms are mild",
          remedySteps: ["Rest", "Drink water"],
        }),
      };
    }

    return {
      text: JSON.stringify({
        diagnosis: "Viral",
        medicines: ["Paracetamol"],
        precautions: ["Rest"],
        simpleExplanation: "Likely mild viral infection",
      }),
    };
  }),
}));

const { app } = await import("../app.js");
const { MedicineLog } = await import("../models/MedicineLog.js");
const { SymptomLog } = await import("../models/SymptomLog.js");

let authHeader = "";

describe("Feature routes", () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: "earth-test" });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  beforeEach(async () => {
    await MedicineLog.deleteMany({});
    await SymptomLog.deleteMany({});
    await User.deleteMany({});

    const passwordHash = await hashPassword("Pass@123");
    const user = await User.create({
      name: "Test User",
      email: "test@example.com",
      passwordHash,
      healthProfile: [],
      history: [],
    });

    const token = signAuthToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    authHeader = `Bearer ${token}`;
  });

  it("should reject unauthorized feature access", async () => {
    await request(app)
      .post("/api/features/symptom-checker")
      .send({ symptomsText: "fever" })
      .expect(401);
  });

  it("POST /api/features/medicine-label-reader should parse and log medicine", async () => {
    const first = await request(app)
      .post("/api/features/medicine-label-reader")
      .set("Authorization", authHeader)
      .send({ ocrText: "Paracetamol 500mg" })
      .expect(200);

    expect(first.body.medicineName).toBe("Paracetamol");
    expect(first.body.duplicatePrevented).toBe(false);

    const second = await request(app)
      .post("/api/features/medicine-label-reader")
      .set("Authorization", authHeader)
      .send({ ocrText: "Paracetamol 500mg" })
      .expect(200);

    expect(second.body.duplicatePrevented).toBe(true);
  });

  it("POST /api/features/symptom-checker should return structured output", async () => {
    const response = await request(app)
      .post("/api/features/symptom-checker")
      .set("Authorization", authHeader)
      .send({ symptomsText: "Fever and cough" })
      .expect(200);

    expect(response.body).toMatchObject({
      condition: "Flu",
      severity: "medium",
      needsDoctor: false,
    });

    const count = await SymptomLog.countDocuments({});
    expect(count).toBe(1);
  });

  it("POST /api/features/doctor-or-home-decision should return decision", async () => {
    const response = await request(app)
      .post("/api/features/doctor-or-home-decision")
      .set("Authorization", authHeader)
      .send({
        symptomData: {
          condition: "Flu",
          severity: "medium",
          advice: "Rest",
          needsDoctor: false,
        },
      })
      .expect(200);

    expect(response.body.decision).toBe("Safe at home");
    expect(Array.isArray(response.body.remedySteps)).toBe(true);
  });

  it("POST /api/features/doctor-visit-explainer should expand memory", async () => {
    const response = await request(app)
      .post("/api/features/doctor-visit-explainer")
      .set("Authorization", authHeader)
      .send({ partialVoiceMemory: "Doctor said viral" })
      .expect(200);

    expect(response.body).toMatchObject({
      diagnosis: "Viral",
      simpleExplanation: "Likely mild viral infection",
    });
  });
});
