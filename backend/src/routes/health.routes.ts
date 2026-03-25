import { Router } from "express";
import { ping } from "../controllers/health.controller.js";

export const healthRouter = Router();

healthRouter.get("/ping", ping);
