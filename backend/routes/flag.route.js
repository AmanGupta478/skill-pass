// routes/flagRoutes.js
import { Router } from "express";
import { createFlag, listFlags, resolveFlag } from "../controllers/flagController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// Anyone logged in can create a flag
router.post("/createflag", isAuthenticated, createFlag);

// Only admins can see / resolve flags
router.get("/listflags", isAuthenticated, isAdmin, listFlags);
router.patch("/resolve/:id", isAuthenticated, isAdmin, resolveFlag);

export default router;
