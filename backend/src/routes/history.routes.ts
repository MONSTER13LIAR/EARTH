import { Router } from "express";
import { getMyHistory, saveActivity } from "../controllers/history.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const historyRouter = Router();

historyRouter.get("/me", requireAuth, getMyHistory);
historyRouter.post("/activity", requireAuth, saveActivity);
