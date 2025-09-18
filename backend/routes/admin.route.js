import express from "express";
import { getAll, getById, update ,changeRole, deleteUser, } from "../controllers/admin.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/**
 * All routes below:
 *  - Require a valid JWT in cookies (`isAuthenticated`)
 *  - Require the user to have ADMIN role
 */
router.use(isAuthenticated, requireRole(["ADMIN"]));

// GET all users
router.get("/get", getAll);

// GET a single user by ID
router.get("/get/:id", getById);

// PATCH -> Update user
router.patch("/update/:id", update);  

// PATCH → Change another user’s role
router.patch("/change/:id/role", changeRole);

// DELETE a user
router.delete("/delete/:id", deleteUser);

export default router;
