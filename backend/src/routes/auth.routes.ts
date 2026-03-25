import { Router } from "express";
import { login, me, signup } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireFields } from "../middlewares/validate.middleware.js";

export const authRouter = Router();

authRouter.post("/signup", requireFields(["name", "email", "password"]), signup);
authRouter.post("/login", requireFields(["email", "password"]), login);
authRouter.get("/me", requireAuth, me);
