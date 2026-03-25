import { Router } from "express";
import {
  doctorOrHomeDecision,
  doctorVisitExplainer,
  getPromptSamples,
  medicineLabelReader,
  symptomChecker,
} from "../controllers/feature.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireFields } from "../middlewares/validate.middleware.js";

export const featureRouter = Router();

featureRouter.use(requireAuth);
featureRouter.get("/prompt-samples", getPromptSamples);

featureRouter.post(
  "/medicine-label-reader",
  requireFields(["ocrText"]),
  medicineLabelReader
);
featureRouter.post(
  "/symptom-checker",
  requireFields(["symptomsText"]),
  symptomChecker
);
featureRouter.post(
  "/doctor-or-home-decision",
  requireFields(["symptomData"]),
  doctorOrHomeDecision
);
featureRouter.post(
  "/doctor-visit-explainer",
  requireFields(["partialVoiceMemory"]),
  doctorVisitExplainer
);
