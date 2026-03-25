import { Router } from "express";
import { getMyHistory } from "../controllers/history.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const historyRouter = Router();

historyRouter.get("/me", requireAuth, getMyHistory);
